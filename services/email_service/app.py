"""
Email Service - Flask application entry point
Provides IMAP/SMTP email operations via RESTful API
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=os.getenv('EMAIL_SERVICE_LOG_LEVEL', 'INFO'))
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure app
app.config['JSON_SORT_KEYS'] = False
app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Enable CORS
CORS(app, resources={
    r'/api/*': {
        'origins': os.getenv('CORS_ORIGINS', 'localhost:3000').split(','),
        'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allow_headers': ['Content-Type', 'Authorization']
    }
})

# Initialize database
from src.db import init_db
try:
    init_db(app)
    with app.app_context():
        from src.db import db
        db.create_all()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

# Register blueprints
from src.routes.accounts import accounts_bp
from src.routes.sync import sync_bp
from src.routes.compose import compose_bp
from src.routes.folders import folders_bp
from src.routes.preferences import preferences_bp

app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
app.register_blueprint(sync_bp, url_prefix='/api/sync')
app.register_blueprint(compose_bp, url_prefix='/api/compose')
app.register_blueprint(folders_bp, url_prefix='/api')
app.register_blueprint(preferences_bp, url_prefix='/api/v1')

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'email_service'}, 200

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    return {'error': 'Bad request', 'message': str(error)}, 400

@app.errorhandler(401)
def unauthorized(error):
    """Handle unauthorized errors"""
    return {'error': 'Unauthorized', 'message': str(error)}, 401

@app.errorhandler(404)
def not_found(error):
    """Handle not found errors"""
    return {'error': 'Not found', 'message': str(error)}, 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    return {'error': 'Internal server error', 'message': str(error)}, 500

if __name__ == '__main__':
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_ENV', 'development') == 'development'
    )
