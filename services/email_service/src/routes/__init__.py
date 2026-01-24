"""
Email Service - API Routes
"""
from .accounts import accounts_bp
from .sync import sync_bp
from .compose import compose_bp
from .filters import filters_bp

__all__ = ['accounts_bp', 'sync_bp', 'compose_bp', 'filters_bp']
