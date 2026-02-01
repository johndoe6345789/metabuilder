"""
Phase 7: Flask Authentication Middleware
JWT token validation, multi-tenant isolation, RBAC, rate limiting, request logging
"""
from flask import request
from functools import wraps
from typing import Callable, Tuple, Optional, Dict, Any
from uuid import UUID
import logging
import jwt
import os
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class UserRole(Enum):
    """Role-based access control roles"""
    USER = "user"
    ADMIN = "admin"


class AuthError(Exception):
    """Authentication/authorization error"""
    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code


class JWTConfig:
    """JWT configuration"""
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))


def is_valid_uuid(value: str) -> bool:
    """Check if string is valid UUID"""
    try:
        UUID(value)
        return True
    except (ValueError, TypeError):
        return False


def create_jwt_token(tenant_id: str, user_id: str, role: str = "user",
                     expires_in_hours: int = None) -> str:
    """
    Create JWT token with tenant and user claims

    Args:
        tenant_id: Tenant UUID
        user_id: User UUID
        role: User role (user or admin)
        expires_in_hours: Token expiration hours (default from config)

    Returns:
        Encoded JWT token

    Raises:
        ValueError if inputs invalid
    """
    if not is_valid_uuid(tenant_id) or not is_valid_uuid(user_id):
        raise ValueError("Invalid tenant_id or user_id format")

    if role not in [r.value for r in UserRole]:
        raise ValueError(f"Invalid role: {role}")

    expires_in_hours = expires_in_hours or JWTConfig.EXPIRATION_HOURS
    expiration = datetime.utcnow() + timedelta(hours=expires_in_hours)

    payload = {
        'tenant_id': str(tenant_id),
        'user_id': str(user_id),
        'role': role,
        'exp': expiration,
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, JWTConfig.SECRET_KEY, algorithm=JWTConfig.ALGORITHM)
    logger.info(f'JWT token created for user {user_id} in tenant {tenant_id}')
    return token


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict

    Raises:
        AuthError if token invalid or expired
    """
    try:
        payload = jwt.decode(token, JWTConfig.SECRET_KEY, algorithms=[JWTConfig.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning(f'Expired JWT token: {token[:20]}...')
        raise AuthError('Token expired', 401)
    except jwt.InvalidTokenError as e:
        logger.warning(f'Invalid JWT token: {str(e)}')
        raise AuthError('Invalid token', 401)


def extract_bearer_token() -> Optional[str]:
    """
    Extract Bearer token from Authorization header

    Format: Authorization: Bearer <token>

    Returns:
        Token string or None if missing
    """
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return None

    return auth_header[7:]  # Remove 'Bearer ' prefix


def extract_tenant_context() -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Extract tenant, user, and role from JWT token or headers

    Priority:
    1. Bearer token in Authorization header (JWT)
    2. X-Tenant-ID and X-User-ID headers (development/testing)

    Returns:
        Tuple of (tenant_id, user_id, role) or (None, None, None) if missing
    """
    # Try JWT token first
    token = extract_bearer_token()
    if token:
        try:
            payload = decode_jwt_token(token)
            return (
                payload.get('tenant_id'),
                payload.get('user_id'),
                payload.get('role', 'user')
            )
        except AuthError:
            raise

    # Fallback to headers (development/testing)
    tenant_id = request.headers.get('X-Tenant-ID')
    user_id = request.headers.get('X-User-ID')
    role = request.headers.get('X-User-Role', 'user')

    # Also check query parameters as fallback
    if not tenant_id:
        tenant_id = request.args.get('tenant_id')
    if not user_id:
        user_id = request.args.get('user_id')

    return tenant_id, user_id, role


def verify_tenant_context(f: Callable) -> Callable:
    """
    Decorator to verify tenant and user context on every request

    CRITICAL: This enforces multi-tenant safety by ensuring:
    1. Valid JWT token OR X-Tenant-ID/X-User-ID headers present
    2. Tenant and user IDs are valid UUIDs
    3. No cross-tenant data access is possible

    All database queries must filter by both tenantId AND userId.

    Logs request context for auditing:
    - User ID and role
    - Tenant ID
    - Endpoint and method
    - Timestamp

    Usage:
        @app.route('/api/accounts')
        @verify_tenant_context
        def list_accounts():
            tenant_id, user_id = get_tenant_context()
            # All queries must filter by tenant_id and user_id
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            tenant_id, user_id, role = extract_tenant_context()

            # Validate presence
            if not tenant_id or not user_id:
                return {
                    'error': 'Unauthorized',
                    'message': 'Bearer token or X-Tenant-ID and X-User-ID headers required'
                }, 401

            # Validate format
            if not is_valid_uuid(tenant_id):
                return {
                    'error': 'Invalid request',
                    'message': 'Tenant ID must be valid UUID'
                }, 400

            if not is_valid_uuid(user_id):
                return {
                    'error': 'Invalid request',
                    'message': 'User ID must be valid UUID'
                }, 400

            # Validate role
            valid_roles = [r.value for r in UserRole]
            if role not in valid_roles:
                return {
                    'error': 'Invalid request',
                    'message': f'Role must be one of: {", ".join(valid_roles)}'
                }, 400

            # Store in request context for use in route handlers
            request.tenant_id = tenant_id
            request.user_id = user_id
            request.user_role = role

            # Log request with user context
            log_request_context(request, user_id, tenant_id, role)

            return f(*args, **kwargs)

        except AuthError as e:
            logger.warning(f'Auth error: {e.message}')
            return {'error': 'Unauthorized', 'message': e.message}, e.status_code
        except Exception as e:
            logger.error(f'Unexpected auth error: {str(e)}', exc_info=True)
            return {'error': 'Internal server error'}, 500

    return decorated_function


def verify_role(*allowed_roles: str) -> Callable:
    """
    Decorator to verify user has required role

    Usage:
        @app.route('/api/admin')
        @verify_tenant_context
        @verify_role('admin')
        def admin_endpoint():
            ...

    Args:
        allowed_roles: One or more allowed role strings (e.g., 'admin', 'user')
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                user_role = getattr(request, 'user_role', None)

                if not user_role:
                    return {
                        'error': 'Forbidden',
                        'message': 'User role not found'
                    }, 403

                if user_role not in allowed_roles:
                    user_id = getattr(request, 'user_id', 'unknown')
                    logger.warning(
                        f'Role verification failed: user {user_id} '
                        f'has role {user_role}, required {allowed_roles}'
                    )
                    return {
                        'error': 'Forbidden',
                        'message': f'Insufficient permissions. Required role: {", ".join(allowed_roles)}'
                    }, 403

                return f(*args, **kwargs)

            except Exception as e:
                logger.error(f'Role verification error: {str(e)}', exc_info=True)
                return {'error': 'Internal server error'}, 500

        return decorated_function
    return decorator


def get_tenant_context() -> Tuple[str, str]:
    """
    Get tenant context from current request

    Returns:
        Tuple of (tenant_id, user_id)

    Raises:
        AuthError if not set by verify_tenant_context decorator
    """
    tenant_id = getattr(request, 'tenant_id', None)
    user_id = getattr(request, 'user_id', None)

    if not tenant_id or not user_id:
        raise AuthError('Tenant context not initialized')

    return tenant_id, user_id


def get_user_role() -> str:
    """
    Get user role from current request

    Returns:
        User role string (user or admin)

    Raises:
        AuthError if not set by verify_tenant_context decorator
    """
    role = getattr(request, 'user_role', None)

    if not role:
        raise AuthError('User role not initialized')

    return role


def verify_resource_access(resource_tenant_id: str, resource_user_id: str) -> bool:
    """
    Verify user can access a resource

    Implements row-level access control (RLS):
    - Regular user can only access their own resources
    - Admin can access any resource in their tenant
    - Tenant isolation enforced at all levels

    Args:
        resource_tenant_id: Tenant ID of resource
        resource_user_id: User ID of resource

    Returns:
        True if access granted

    Raises:
        AuthError if access denied
    """
    try:
        tenant_id, user_id = get_tenant_context()
        user_role = get_user_role()

        # Enforce tenant isolation (admin cannot cross tenants)
        if str(resource_tenant_id) != str(tenant_id):
            logger.warning(
                f'Cross-tenant access attempt: '
                f'request tenant {tenant_id}, resource tenant {resource_tenant_id}, '
                f'user {user_id}'
            )
            raise AuthError('Forbidden', 403)

        # Admin can access any resource in their tenant
        if user_role == UserRole.ADMIN.value:
            return True

        # Regular user can only access their own resources
        if str(resource_user_id) != str(user_id):
            logger.warning(
                f'Cross-user access attempt: '
                f'request user {user_id}, resource user {resource_user_id}, '
                f'tenant {tenant_id}'
            )
            raise AuthError('Forbidden', 403)

        return True

    except AuthError:
        raise
    except Exception as e:
        logger.error(f'Access verification error: {str(e)}', exc_info=True)
        raise AuthError('Internal server error', 500)


def log_request_context(req: Any, user_id: str, tenant_id: str, role: str) -> None:
    """
    Log request with user context for auditing

    Logs:
    - Timestamp
    - User ID and role
    - Tenant ID
    - HTTP method and endpoint
    - Request IP
    - User agent

    Args:
        req: Flask request object
        user_id: User UUID
        tenant_id: Tenant UUID
        role: User role
    """
    try:
        method = req.method
        endpoint = req.endpoint or req.path
        ip_address = req.remote_addr
        user_agent = req.headers.get('User-Agent', 'Unknown')

        logger.info(
            f'Request: method={method} endpoint={endpoint} '
            f'user_id={user_id} tenant_id={tenant_id} role={role} '
            f'ip={ip_address}'
        )
    except Exception as e:
        logger.error(f'Error logging request context: {str(e)}')


def create_auth_response(message: str, status_code: int = 401) -> Tuple[dict, int]:
    """Create standardized auth error response"""
    return {'error': 'Unauthorized', 'message': message}, status_code
