"""
Authentication Module
JWT-based user authentication for WorkflowUI
"""

from flask import request, jsonify
from functools import wraps
from datetime import datetime, timedelta
import jwt
import hashlib
import os
from typing import Dict, Tuple, Optional

# Get secret key from environment or use default (change in production!)
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_EXPIRATION_HOURS = 24

class AuthError(Exception):
    """Custom exception for auth errors"""
    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code


def hash_password(password: str) -> str:
    """Hash password using SHA-512"""
    return hashlib.sha512(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def generate_token(user_id: str, email: str) -> str:
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'email': email,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError('Token has expired', 401)
    except jwt.InvalidTokenError:
        raise AuthError('Invalid token', 401)


def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                raise AuthError('Invalid authorization header', 401)

        if not token:
            raise AuthError('Token is missing', 401)

        try:
            payload = verify_token(token)
            request.user_id = payload['user_id']
            request.email = payload['email']
        except AuthError as e:
            raise e

        return f(*args, **kwargs)

    return decorated


def validate_email(email: str) -> bool:
    """Simple email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """Validate password strength"""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'

    if not any(c.isupper() for c in password):
        return False, 'Password must contain uppercase letters'

    if not any(c.islower() for c in password):
        return False, 'Password must contain lowercase letters'

    if not any(c.isdigit() for c in password):
        return False, 'Password must contain numbers'

    return True, None


def register_auth_routes(app):
    """Register authentication routes with Flask app"""

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """Register new user"""
        try:
            data = request.get_json()

            # Validate input
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            email = data.get('email', '').strip()
            password = data.get('password', '')
            name = data.get('name', '').strip()

            # Validate email
            if not email or not validate_email(email):
                return jsonify({'error': 'Invalid email address'}), 400

            # Validate name
            if not name or len(name) < 2:
                return jsonify({'error': 'Name must be at least 2 characters'}), 400

            # Validate password
            is_valid, error_msg = validate_password(password)
            if not is_valid:
                return jsonify({'error': error_msg}), 400

            # Check if user already exists
            from models import User, db

            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'error': 'Email already registered'}), 409

            # Create new user
            user_id = f'user_{datetime.utcnow().timestamp()}'
            password_hash = hash_password(password)

            user = User(
                id=user_id,
                email=email,
                password_hash=password_hash,
                name=name,
                created_at=datetime.utcnow()
            )

            db.session.add(user)
            db.session.commit()

            # Generate token
            token = generate_token(user_id, email)

            return jsonify({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                },
                'token': token
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """Login user"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({'error': 'No data provided'}), 400

            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not email or not password:
                return jsonify({'error': 'Email and password required'}), 400

            from models import User

            # Find user
            user = User.query.filter_by(email=email).first()

            if not user or not verify_password(password, user.password_hash):
                return jsonify({'error': 'Invalid email or password'}), 401

            # Generate token
            token = generate_token(user.id, user.email)

            return jsonify({
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                },
                'token': token
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/me', methods=['GET'])
    @token_required
    def get_current_user():
        """Get current user info"""
        try:
            from models import User

            user = User.query.filter_by(id=request.user_id).first()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat()
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/logout', methods=['POST'])
    @token_required
    def logout():
        """Logout user (token invalidation on client side)"""
        # JWT tokens are stateless, so logout is client-side only
        # In production, you might maintain a token blacklist
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

    @app.route('/api/auth/change-password', methods=['POST'])
    @token_required
    def change_password():
        """Change user password"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({'error': 'No data provided'}), 400

            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '')

            if not current_password or not new_password:
                return jsonify({'error': 'Current and new password required'}), 400

            from models import User

            user = User.query.filter_by(id=request.user_id).first()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Verify current password
            if not verify_password(current_password, user.password_hash):
                return jsonify({'error': 'Current password is incorrect'}), 401

            # Validate new password
            is_valid, error_msg = validate_password(new_password)
            if not is_valid:
                return jsonify({'error': error_msg}), 400

            # Update password
            user.password_hash = hash_password(new_password)
            user.updated_at = datetime.utcnow()
            db.session.commit()

            return jsonify({'success': True, 'message': 'Password changed successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
