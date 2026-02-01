"""
Rate limiting middleware
Implements per-user rate limiting (50 requests/minute)
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request
import os
import logging

logger = logging.getLogger(__name__)


def get_user_identifier():
    """
    Get unique identifier for rate limiting

    Priority:
    1. X-User-ID header (from authenticated request)
    2. IP address (fallback for unauthenticated)

    Returns:
        String identifier for rate limit key
    """
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return user_id

    # Fallback to IP address
    return get_remote_address()


def create_limiter():
    """
    Create Flask-Limiter instance with Redis backend

    Configuration:
    - Default: 50 requests/minute per user
    - Storage: Redis (configurable via env vars)
    - Key function: X-User-ID header or IP address

    Returns:
        Configured Limiter instance
    """
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    limiter = Limiter(
        key_func=get_user_identifier,
        default_limits=["50 per minute"],  # Per-user rate limit
        storage_uri=redis_url,
        storage_options={},
        strategy='moving-window',  # More precise than fixed window
        in_memory_fallback_enabled=True,  # Use in-memory if Redis unavailable
        swallow_errors=True  # Don't break requests if rate limiter fails
    )

    logger.info(f'Rate limiter initialized: {redis_url}')

    return limiter


def rate_limit(limit: str):
    """
    Decorator for route-specific rate limiting

    Args:
        limit: Rate limit string (e.g., "100 per hour", "5 per second")

    Example:
        @app.route('/api/accounts')
        @rate_limit("50 per minute")
        def list_accounts():
            ...
    """
    def decorator(f):
        f._rate_limit = limit
        return f
    return decorator


# Global limiter instance
limiter = create_limiter()
