import os
import json
from datetime import timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User, Review
from detector import predict
from auth import jwt_required_role

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "TrustLensAI API"})

    @app.post("/api/auth/signup")
    def signup():
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or len(password) < 6:
            return jsonify({"error": "Enter name, valid email and password of at least 6 characters"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 409

        user = User(name=name, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "Account created successfully"}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if email == app.config["ADMIN_USERNAME"].lower() and password == app.config["ADMIN_PASSWORD"]:
            token = create_access_token(
                identity="admin",
                additional_claims={"role": "admin", "name": "System Admin"},
                expires_delta=timedelta(hours=8)
            )
            return jsonify({"token": token, "role": "admin", "name": "System Admin", "email": "admin"})

        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid login credentials"}), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": "user", "name": user.name},
            expires_delta=timedelta(hours=8)
        )
        return jsonify({"token": token, "role": "user", "name": user.name, "email": user.email})

    @app.get("/api/me")
    @jwt_required_role()
    def me():
        claims = get_jwt()
        return jsonify({"id": get_jwt_identity(), "name": claims.get("name"), "role": claims.get("role")})

    @app.post("/api/reviews/analyze")
    @jwt_required_role("user")
    def analyze_review():
        data = request.get_json() or {}
        product = data.get("product", "").strip()
        text = data.get("text", "").strip()
        try:
            rating = int(data.get("rating", 0))
        except (ValueError, TypeError):
            rating = 0

        if not product or not text or rating < 1 or rating > 5:
            return jsonify({"error": "Product, review text and rating are required"}), 400

        result = predict(text, rating)
        review = Review(
            user_id=int(get_jwt_identity()),
            product=product,
            rating=rating,
            text=text,
            prediction=result["prediction"],
            fake_probability=result["fake_probability"],
            confidence=result["confidence"],
            signals=json.dumps(result["signals"]),
            moderation_status="Pending"
        )
        db.session.add(review)
        db.session.commit()
        result["review_id"] = review.id
        return jsonify(result)

    @app.get("/api/reviews/my")
    @jwt_required_role("user")
    def my_reviews():
        reviews = Review.query.filter_by(user_id=int(get_jwt_identity())).order_by(Review.created_at.desc()).all()
        return jsonify([serialize_review(r) for r in reviews])

    @app.get("/api/products")
    @jwt_required_role("user")
    def products():
        rows = Review.query.all()
        grouped = {}
        for r in rows:
            item = grouped.setdefault(r.product, {"product": r.product, "reviews": 0, "suspicious": 0, "average_rating": 0})
            item["reviews"] += 1
            item["suspicious"] += 1 if r.prediction == "Suspicious" else 0
            item["average_rating"] += r.rating

        result = []
        for item in grouped.values():
            item["average_rating"] = round(item["average_rating"] / item["reviews"], 1)
            item["risk"] = round((item["suspicious"] / item["reviews"]) * 100, 1)
            result.append(item)
        return jsonify(sorted(result, key=lambda x: x["risk"], reverse=True))

    # ---------------- ADMIN DASHBOARD ----------------

    @app.get("/api/admin/stats")
    @jwt_required_role("admin")
    def admin_stats():
        total = Review.query.count()
        suspicious = Review.query.filter_by(prediction="Suspicious").count()
        genuine = Review.query.filter_by(prediction="Genuine").count()
        pending = Review.query.filter_by(moderation_status="Pending").count()
        return jsonify({
            "total_reviews": total,
            "suspicious": suspicious,
            "genuine": genuine,
            "pending": pending,
            "users": User.query.count(),
            "products": len(set(r.product for r in Review.query.all()))
        })

    @app.get("/api/admin/reviews")
    @jwt_required_role("admin")
    def admin_reviews():
        query = Review.query.order_by(Review.created_at.desc())
        status = request.args.get("status")
        search = request.args.get("search", "").strip().lower()

        if status in ["Pending", "Reviewed", "Escalated"]:
            query = query.filter_by(moderation_status=status)

        reviews = query.all()
        if search:
            reviews = [
                r for r in reviews
                if search in r.product.lower()
                or search in r.text.lower()
                or search in r.prediction.lower()
                or (r.user and search in r.user.email.lower())
            ]
        return jsonify([serialize_review(r, include_user=True) for r in reviews])

    @app.patch("/api/admin/reviews/<int:review_id>")
    @jwt_required_role("admin")
    def update_review(review_id):
        review = db.session.get(Review, review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404

        data = request.get_json() or {}
        if "status" in data:
            if data["status"] not in ["Pending", "Reviewed", "Escalated"]:
                return jsonify({"error": "Invalid moderation status"}), 400
            review.moderation_status = data["status"]

        if "product" in data and str(data["product"]).strip():
            review.product = str(data["product"]).strip()
        if "rating" in data:
            try:
                rating = int(data["rating"])
                if 1 <= rating <= 5:
                    review.rating = rating
            except (ValueError, TypeError):
                pass
        if "text" in data and str(data["text"]).strip():
            review.text = str(data["text"]).strip()

        db.session.commit()
        return jsonify({"message": "Review updated successfully", "review": serialize_review(review, True)})

    @app.delete("/api/admin/reviews/<int:review_id>")
    @jwt_required_role("admin")
    def delete_review(review_id):
        review = db.session.get(Review, review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"})

    # ---------------- USER MANAGEMENT ----------------

    @app.get("/api/admin/users")
    @jwt_required_role("admin")
    def admin_users():
        search = request.args.get("search", "").strip().lower()
        users = User.query.order_by(User.created_at.desc()).all()

        if search:
            users = [u for u in users if search in u.name.lower() or search in u.email.lower()]

        return jsonify([serialize_user(u) for u in users])

    @app.patch("/api/admin/users/<int:user_id>")
    @jwt_required_role("admin")
    def update_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json() or {}
        name = str(data.get("name", user.name)).strip()
        email = str(data.get("email", user.email)).strip().lower()

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        existing = User.query.filter(User.email == email, User.id != user_id).first()
        if existing:
            return jsonify({"error": "Another account already uses this email"}), 409

        user.name = name
        user.email = email

        if data.get("password"):
            if len(data["password"]) < 6:
                return jsonify({"error": "Password must contain at least 6 characters"}), 400
            user.password_hash = generate_password_hash(data["password"])

        db.session.commit()
        return jsonify({"message": "User updated successfully", "user": serialize_user(user)})

    @app.delete("/api/admin/users/<int:user_id>")
    @jwt_required_role("admin")
    def delete_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Delete the user's reviews first because Review.user_id is a foreign key.
        Review.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User and associated reviews deleted successfully"})

    return app

def serialize_review(r, include_user=False):
    item = {
        "id": r.id,
        "product": r.product,
        "rating": r.rating,
        "text": r.text,
        "prediction": r.prediction,
        "fake_probability": r.fake_probability,
        "confidence": r.confidence,
        "signals": json.loads(r.signals or "[]"),
        "moderation_status": r.moderation_status,
        "created_at": r.created_at.isoformat()
    }
    if include_user:
        item["user"] = {"id": r.user.id if r.user else None, "name": r.user.name if r.user else "Unknown", "email": r.user.email if r.user else "Unknown"}
    return item

def serialize_user(u):
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "created_at": u.created_at.isoformat(),
        "review_count": Review.query.filter_by(user_id=u.id).count()
    }

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
