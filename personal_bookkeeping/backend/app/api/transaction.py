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
import os
import sys

# Third-party Packages
from flask import Blueprint, request, jsonify

# Local Packages
from ..data.database.finance_database_service import Finance_Database_Service as FinanceDatabaseService

# Get project root directory for database path
project_root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


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
    year=TODAY.year, 
    month=TODAY.month, 
    day=1
    )
QUARTER_START_DATE = datetime.date(
    year=TODAY.year, 
    month=((TODAY.month - 1) // 3) * 3 + 1, 
    day=1
    )
YEAR_START_DATE = datetime.date(
    year=TODAY.year, 
    month=1, 
    day=1
    )

# Database
DB_FILE_PATH = os.path.join(project_root_dir, "app", "data", "database", "finance.db")


########################################################################
# Initialize Services
########################################################################
finance_db_service = FinanceDatabaseService(db_file_path=DB_FILE_PATH)


########################################################################
# Transaction Routes
########################################################################
@transaction_bp.route("/transactions", methods=["GET"])
def get_transactions():
    """
    Get the transaction records based on certain criteria.

    :param transaction_ids: list[int]: The IDs of the transactions to retrieve.
    :param start_date: datetime.date: The start date of the transaction query.
    :param end_date: datetime.date: The end date of the transaction query.
    :param transaction_types: list[str]: The types of transactions to retrieve.
    :param transaction_categories: list[str]: The categories of transactions to retrieve.
    :param site: str: The site of the transactions to retrieve.
    :param comment: str: The comment of the transactions to retrieve.
    :return: A JSON response containing the transaction records.
    """
    try:
        # Transaction IDs
        transaction_ids = request.args.getlist("transaction_ids") or None

        # Dates
        ## Get the parameter strings
        start_date_str = request.args.get("start_date", MONTH_START_DATE)
        end_date_str = request.args.get("end_date", TODAY)
        ## Convert to date objects
        try:
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": f"Invalid date format: {str(e)}",
                "message": "Date parameters must be in YYYY-MM-DD format"
            }), 400
        ## Validate the parameters
        validate_date_range(start_date=start_date, end_date=end_date)

        # Transaction Type parameters
        transaction_types = request.args.getlist("transaction_types") or None
        
        # Transaction Category parameters
        transaction_categories = request.args.getlist("transaction_categories") or None

        # Transaction Site
        site = request.args.get("site")

        # Comment
        comment = request.args.get("comment")

        # Retrieve the transaction records
        transaction_records = finance_db_service.query_transaction_records_by_criteria(
            transaction_ids=transaction_ids,
            transaction_date_start=start_date,
            transaction_date_end=end_date,
            transaction_types=transaction_types,
            transaction_categories=transaction_categories,
            transaction_sites=[site] if site else None,
            comment=comment
        )

        # Convert Row objects to dictionaries for JSON serialization
        transaction_list = [dict(row) for row in transaction_records]

        # Return the transaction records
        return jsonify({
            "success": True,
            "data": transaction_list
        }), 200

    # Error handling
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Invalid request parameters"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve transactions"
        }), 500


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction_by_id(transaction_id):
    """
    Get a transaction by its ID.
    
    :param transaction_id: int: The ID of the transaction to retrieve.
    :return: A JSON response containing the transaction record.
    """
    try:
        # Retrieve the transaction record
        transaction_record = finance_db_service.query_transaction_record_by_id(transaction_id=transaction_id)
        
        # Return the transaction record
        return jsonify({
            "success": True,
            "data": transaction_record,
            "message": "Transaction retrieved successfully"
        }), 200
        
    # Error handling
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve transaction"
        }), 500
    


@transaction_bp.route("/transactions", methods=["POST"])
def add_transaction():
    """
    Create a new transaction and add to the database.
    
    :return: A JSON response containing the created transaction record.
    """
    try:
        # Get the transaction parameters from the payload
        payload = request.get_json()
        if not payload:
            return jsonify({
                "success": False,
                "error": "No JSON payload provided",
                "message": "Request body is required"
            }), 400
        
        transaction_record = payload
        
        # Validate the transaction record
        validate_transaction_record(transaction_record)

        # Create the transaction record
        transaction_record = finance_db_service.add_a_transaction_record(transaction_record=transaction_record)
        
        # Return the transaction record
        return jsonify({
            "success": True,
            "data": transaction_record,
            "message": "Transaction created successfully"
        }), 201
        
    # Error handling
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Invalid transaction data"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to create the transaction"
        }), 500


@transaction_bp.route("/transactions/batch", methods=["POST"])
def add_transaction_batch():
    """
    Add multiple transaction records in a batch.
    
    :return: A JSON response containing the created transaction records.
    """
    try:
        # Get the transaction parameters from the payload
        payload = request.get_json()
        if not payload:
            return jsonify({
                "success": False,
                "error": "No JSON payload provided",
                "message": "Request body is required"
            }), 400
        
        transaction_records = payload.get("transactions", [])
        if not isinstance(transaction_records, list):
            return jsonify({
                "success": False,
                "error": "transactions must be a list",
                "message": "Invalid request format"
            }), 400
        
        if not transaction_records:
            return jsonify({
                "success": False,
                "error": "No transactions provided",
                "message": "At least one transaction is required"
            }), 400
        
        # Validate each transaction record
        for i, record in enumerate(transaction_records):
            try:
                validate_transaction_record(record)
            except ValueError as e:
                return jsonify({
                    "success": False,
                    "error": f"Transaction {i+1}: {str(e)}",
                    "message": "Invalid transaction data"
                }), 400
        
        # Add the transaction records
        response = finance_db_service.add_transaction_records(transaction_records=transaction_records)
        
        # Return the transaction records
        return jsonify({
            "success": True,
            "data": response,
            "message": "Transactions created successfully"
        }), 201
        
    # Error handling
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to create the transactions"
        }), 500


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    """
    Update a transaction by ID.
    
    :param transaction_id: The ID of the transaction to update.
    :return: A JSON response containing the updated transaction record.
    """
    try:
        # Get the transaction parameters from the payload
        payload = request.get_json()
        if not payload:
            return jsonify({
                "success": False,
                "error": "No JSON payload provided",
                "message": "Request body is required"
            }), 400
        
        transaction_record = payload
        
        # Validate the transaction record
        validate_transaction_record(transaction_record)

        # Verify if the transaction_id already exists
        transaction = finance_db_service.query_transaction_record_by_id(transaction_id=transaction_id)
        if not transaction:
            return jsonify({
                "success": False,
                "error": f"Transaction ID {transaction_id} not found",
                "message": f"Transaction ID {transaction_id} not found"
            }), 404
        
        # Update the transaction record
        transaction_record = finance_db_service.update_transaction_record(transaction_id=transaction_id, transaction_record=transaction_record)
        
        # Return the transaction record
        return jsonify({
            "success": True,
            "data": transaction_record,
            "message": "Transaction updated successfully"
        }), 200
        
    # Error handling
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Invalid transaction data"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to update the transaction"
        }), 500


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    """
    Delete the transaction by a given ID.

    :param transaction_id: The ID of the transaction to delete.
    :return: A JSON response indicating success or failure.
    """
    try:
        # Delete the transaction record
        finance_db_service.delete_transaction_record_by_id(transaction_id=transaction_id)
        
        # Return success response
        return jsonify({
            "success": True,
            "message": "Transaction deleted successfully"
        }), 200
        
    # Error handling
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to delete the transaction"
        }), 500


########################################################################
# Util Functions
########################################################################
def validate_transaction_record(transaction_record: dict) -> None:
    """
    Validates the transaction record structure and required fields.
    
    :param transaction_record: dict: The transaction record to validate.
    :raises ValueError: If the transaction record is invalid.
    """
    if not isinstance(transaction_record, dict):
        raise ValueError("Transaction record must be a dictionary")
    
    required_fields = ["transaction_date", "amount", "transaction_type", "transaction_category"]
    for field in required_fields:
        if field not in transaction_record:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate amount is a number
    try:
        float(transaction_record["amount"])
    except (ValueError, TypeError):
        raise ValueError("Amount must be a valid number")
    
    # Validate transaction date format
    try:
        datetime.datetime.strptime(transaction_record["transaction_date"], "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("transaction_date must be in YYYY-MM-DD format")

def validate_date_range(start_date: datetime.date, end_date: datetime.date) -> None:
    """
    Validates that the end date is later than the start date.

    :param start_date: The start date of the range.
    :param end_date: The end date of the range.
    :raises ValueError: If the end date is not later than the start date.
    """
    if end_date < start_date:
        raise ValueError("end_date must be later than or equal to start_date")
