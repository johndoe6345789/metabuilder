"""
Database configuration and connection pool
PostgreSQL connection management for email service
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool, NullPool
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

db = SQLAlchemy()


def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)


def get_database_url() -> str:
    """
    Construct PostgreSQL connection URL from environment variables
    Format: postgresql://user:password@host:port/database
    """
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', 'postgres')
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    database = os.getenv('DB_NAME', 'email_service')

    return f'postgresql://{user}:{password}@{host}:{port}/{database}'


def create_db_engine(echo: bool = False):
    """
    Create SQLAlchemy engine with connection pooling

    Args:
        echo: Enable SQL query logging

    Returns:
        SQLAlchemy Engine instance
    """
    url = get_database_url()

    # Use NullPool for testing/development, QueuePool for production
    pool_class = NullPool if os.getenv('FLASK_ENV') == 'testing' else QueuePool

    engine = create_engine(
        url,
        echo=echo,
        pool_class=pool_class,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connection before using
        pool_recycle=3600  # Recycle connections every hour
    )

    # Log connection events
    @event.listens_for(engine, 'connect')
    def receive_connect(dbapi_conn, connection_record):
        logger.debug('Database connection established')

    @event.listens_for(engine, 'close')
    def receive_close(dbapi_conn, connection_record):
        logger.debug('Database connection closed')

    return engine


def check_database_health() -> bool:
    """
    Check if database is accessible

    Returns:
        True if database is healthy, False otherwise
    """
    try:
        # Try executing a simple query
        from sqlalchemy import text
        engine = create_db_engine()
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1'))
            return result is not None
    except Exception as e:
        logger.error(f'Database health check failed: {str(e)}')
        return False
