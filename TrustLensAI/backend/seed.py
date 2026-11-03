from werkzeug.security import generate_password_hash
from app import create_app
from models import db, User, Review
import json

app = create_app()

with app.app_context():
    db.create_all()

    demo = User.query.filter_by(email="demo@example.com").first()
    if not demo:
        demo = User(
            name="Demo User",
            email="demo@example.com",
            password_hash=generate_password_hash("Demo@12345")
        )
        db.session.add(demo)
        db.session.commit()

    if Review.query.count() == 0:
        samples = [
            ("Wireless Headphones", 5, "Sound is clear and the battery easily lasts through my workday.", "Genuine", 14.2),
            ("Smart Watch", 5, "BEST WATCH EVER!!! PERFECT!!! BUY NOW!!!", "Suspicious", 91.4),
            ("Running Shoes", 4, "Comfortable for daily walking. Size matched the product chart.", "Genuine", 18.8),
        ]
        for product, rating, text, prediction, prob in samples:
            db.session.add(Review(
                user_id=demo.id,
                product=product,
                rating=rating,
                text=text,
                prediction=prediction,
                fake_probability=prob,
                confidence=abs(prob-50)*2,
                signals=json.dumps(["Seed demo review"]),
                moderation_status="Pending"
            ))
        db.session.commit()

    print("Database ready.")
    print("Demo user: demo@example.com / Demo@12345")
    print("Admin: admin / Admin@12345")
