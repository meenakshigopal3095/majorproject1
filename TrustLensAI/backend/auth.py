from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def jwt_required_role(role=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if role and claims.get("role") != role:
                    return jsonify({"error": "Access denied"}), 403
            except Exception:
                return jsonify({"error": "Authentication required"}), 401
            return fn(*args, **kwargs)
        return wrapper
    return decorator
