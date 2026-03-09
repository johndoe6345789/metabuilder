"""Email Service - Flask REST API for IMAP/SMTP Operations."""

import os
import logging

from flask import Flask
from flask_cors import CORS

from src.extensions import db

logger = logging.getLogger(__name__)


def create_app():
    """Application factory for the email service."""
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///email_service.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS
    CORS(app, origins=os.environ.get("CORS_ORIGINS", "*").split(","))

    # Database
    db.init_app(app)

    # Logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Register blueprints
    from src.routes.health import health_bp
    from src.routes.accounts import accounts_bp
    from src.routes.compose import compose_bp
    from src.routes.folders import folders_bp
    from src.routes.sync import sync_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(accounts_bp, url_prefix="/api/accounts")
    app.register_blueprint(compose_bp, url_prefix="/api/compose")
    app.register_blueprint(folders_bp, url_prefix="/api/folders")
    app.register_blueprint(sync_bp, url_prefix="/api/sync")

    with app.app_context():
        try:
            db.create_all()
        except Exception as exc:
            logger.warning("db.create_all() deferred – DB not ready yet: %s", exc)

    return app


app = create_app()

if __name__ == "__main__":
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host=host, port=port)
