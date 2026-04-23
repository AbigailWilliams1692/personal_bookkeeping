#!/usr/bin/env python3
########################################################################
# File: Personal Bookkeeping App - Flask Backend
# Description: A simple Flask application for managing personal 
#              financial transactions.
# Author: AbigailWilliams1692
# Creation Date: 2026-01-25
# Version: 1.0.0
# License: MIT License
########################################################################

########################################################################
# Import Libraries
########################################################################
# Standard Packages
import os

# Third-party Packages
from flask import Flask, send_from_directory
from flask_cors import CORS

# Local Packages
from .api.transaction import transaction_bp


########################################################################
# Function to initialize the Flask App
########################################################################
def create_app():
    """
    Factory function to create and configure the Flask app.
    """
    # Get the path to the Angular build output
    static_folder = os.path.join(os.path.dirname(__file__), "..", "static", "browser")
    
    # Create Flask app instance
    app = Flask(__name__, static_folder=static_folder, static_url_path="")

    # Enable CORS for frontend communication
    CORS(app)  

    # Set Configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["DEBUG"] = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    
    # Register Blueprints
    app.register_blueprint(transaction_bp, url_prefix="/api/transactions")

    # Serve Angular app for root and all other routes (SPA routing)
    @app.route("/")
    def serve_index():
        """Serve the Angular index.html."""
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:path>")
    def serve_static(path):
        """Serve static files or fallback to index.html for SPA routing."""
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/health")
    def health():
        return {"status": "healthy", "service": "personal-finance-app"}

    return app
