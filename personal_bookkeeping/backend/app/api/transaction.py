#!/usr/bin/env python3
########################################################################
# File: Personal Bookkeeping App - Flask Backend
# Description: The transaction module
# Author: AbigailWilliams1692
# Creation Date: 2026-01-28
# Version: 1.0.0
# License: MIT License
########################################################################

########################################################################
# Import Libraries
########################################################################
# Standard Packages
import datetime
import json

# Third-party Packages
from flask import Blueprint, request, jsonify

# Local Packages


########################################################################
# Create Blueprint
########################################################################
transaction_bp = Blueprint("transaction", __name__)


########################################################################
# Define Constants
########################################################################
# Dates
TODAY = datetime.date.today()
MONTH_START_DATE = datetime.date(
    year=DEFAULT_QUERY_END_DATE.year, 
    month=DEFAULT_QUERY_END_DATE.month, 
    day=1
    )


########################################################################
# Initialize Services
########################################################################
transaction_db_service = TransactionDBService()


########################################################################
# Transaction Routes
########################################################################
@transaction.route("/transactions", methods=["GET"])
def get_transactions():
    """
    Get the transactions based on start_date and end_date.

    :param start_date: datetime.date: the start date of the transaction query.
    :param end_date: datetime.date: the end date of the transaction query.

    """
    try:
        # Get the parameters
        start_date_str = request.args.get(key="start_date", default=MONTH_START_DATE)
        end_date_str = request.args.get(key="end_date", default=TODAY)

        # Convert the type of the parameters
        start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()

        # Validate the parameters
        

        # Retrieve the transaction records


    except Exception as e:
        return jsonify(
            {
                "success": False,
                "error": str(e)
            }
        ), 500

    return jsonify(
        {
            "message": "Get transactions"
        }
    )


@transaction.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction_by_id(transaction_id):
    return jsonify({"message": "Get transaction by id"})


@transaction.route("/transactions", methods=["POST"])
def create_transaction():
    return jsonify({"message": "Create transaction"})


@transaction.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    return jsonify({"message": "Update transaction"})


@transaction.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    return jsonify({"message": "Delete transaction"})
