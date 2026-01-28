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
from flask import Flask, render_template
from flask_cors import CORS

# Local Packages
from api.transaction import transaction_bp


########################################################################
# Function to initialize the Flask App
########################################################################
def create_app():
    """
    Factory function to create and configure the Flask app.
    """
    # Create Flask app instance
    app = Flask(__name__, 
        template_folder="../../frontend/templates", 
        static_folder="../../frontend/static"
    )

    # Enable CORS for frontend communication
    CORS(app)  

    # Set Configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["DEBUG"] = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    
    # Register Blueprints
    app.register_blueprint(transaction_bp, url_prefix="/api/transactions")

    # Register the root page route
    @app.route("/")
    def index():
        """Serve the main page."""
        return render_template("index.html")

    @app.route("/health")
    def health():
        return {"status": "healthy", "service": "personal-finance-app"}

    return app
