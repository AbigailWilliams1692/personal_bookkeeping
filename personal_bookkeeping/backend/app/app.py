#!/usr/bin/env python3
"""
Personal Bookkeeping App - Flask Backend
A simple Flask application for managing personal financial transactions.
"""

import os
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, 
    template_folder="../../frontend/templates", 
    static_folder="../../frontend/static"
)
CORS(app)  # Enable CORS for frontend communication

# Configuration
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["DEBUG"] = os.environ.get("FLASK_DEBUG", "True").lower() == "true"

@app.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")
