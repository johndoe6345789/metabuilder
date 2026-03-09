"""Health check endpoint."""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health")
def health():
    return jsonify({"service": "email-service", "status": "healthy"})


@health_bp.route("/version")
def version():
    return jsonify({"service": "Email Service", "version": "1.0.0"})
