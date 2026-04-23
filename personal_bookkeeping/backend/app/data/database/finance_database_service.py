#!/usr/bin/env python3
########################################################################
# File: finance_database_service.py
# Description: a file that helps manage the finance.db
# Author: AbigailWilliams1692
# Creation Date: 2026-02-05
# Version: 1.0.0
# License: MIT License
########################################################################

########################################################################
# Import Libraries
########################################################################
# Standard Packages
import datetime
import sqlite3
import os
from typing import (Any, Dict, List, Optional, Tuple, Union)

# Third-party Packages
from data_retrieval.data_provider.database import (
    SQLite3_DataProvider,
)

########################################################################
# Import Libraries
########################################################################
class Finance_Database_Service(object):
    """
    Finance Database Service
    """

    ###################################################################
    # Class Attributes
    ###################################################################
    
    
    ###################################################################
    # Constructor Method
    ###################################################################
    def __init__(self, db_file_path: str = "finance.db", log_level: str = "INFO") -> None:
       """
       Initialize the Finance_DatabaseService object.

       :param db_file_path: str: The path to the database file.
       """
       # Initialize the attributes
       self._db_file_path = db_file_path

       # Validate whether the database file exists
       if not self.validate_db_file_path(db_file_path=db_file_path):
           raise ValueError("Invalid database file path.")
       
       # Ensure the bookkeeping table exists
       self.create_bookkeeping_table()

    ###################################################################
    # Getter & Setter Methods
    ###################################################################
    def get_db_file_path(self) -> str:
        """
        Getter method for the database file path.

        :return: The path to the database file.
        :rtype: str
        """
        return self._db_file_path

    def set_db_file_path(self, db_file_path: str) -> None:
        """
        Setter method for the database file path.

        :param db_file_path: The new path to the database file.
        :type db_file_path: str
        """
        self._db_file_path = db_file_path

    def get_db_provider(self) -> SQLite3_DataProvider:
        """
        Creates and returns a new database provider instance.
        A new instance is created each time to avoid SQLite threading issues.

        :return: A new database provider instance.
        :rtype: SQLite3_DataProvider
        """
        return SQLite3_DataProvider(db_file_path=self._db_file_path)

    ###################################################################
    # Core Methods
    ###################################################################
    def create_bookkeeping_table(self) -> None:
        """
        Creates the bookkeeping table in the database.

        :return: List.
        """
        # Formulate the SQL
        sql = """
            CREATE TABLE IF NOT EXISTS bookkeeping (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                transaction_date DATE NOT NULL,
                amount FLOAT NOT NULL,
                currency TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                transaction_category TEXT NOT NULL,
                site TEXT,
                comment TEXT,
                modified_time TIMESTAMP DEFAULT (datetime('now','localtime'))
            )
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql)

        return response

    def add_a_transaction_record(self, transaction_record: Dict) -> Dict:
        """
        Adds a single transaction record to the database.

        :param transaction_record: Dict: A single transaction record in Dict format.
        :return: Dict: The inserted transaction record with ID.
        """
        # Get a database connection
        db_provider = self.get_db_provider()
        
        # Formulate the SQL
        sql = """
            INSERT INTO bookkeeping (
                user, transaction_date, amount, currency, transaction_type, transaction_category, site, comment
            ) VALUES (
                :user, :transaction_date, :amount, :currency, :transaction_type, :transaction_category, :site, :comment
            )
        """

        # Execute the SQL
        response = db_provider.execute(sql=sql, params=transaction_record)

        # Verify the response is an empty list
        if response:
            raise ValueError(f"Failed to add transaction record. Response: {response}")
        
        # Get the last inserted row ID and return the full record
        last_id_sql = "SELECT last_insert_rowid() as id"
        last_id_result = db_provider.execute(sql=last_id_sql)
        
        if last_id_result and len(last_id_result) > 0:
            inserted_id = last_id_result[0]['id']
            # Return the record with the ID
            return {
                'id': inserted_id,
                **transaction_record
            }
        
        return transaction_record


    def add_transaction_records(self, transaction_records: List[Dict]) -> List:
        """
        Adds a list of transaction records to the database.

        :param transaction_records: List[Dict]: A list of transaction records in Dict format.
        :return: List: A list of the added transaction records.
        """
        # Formulate the SQL
        sql = """
            INSERT INTO bookkeeping (user, transaction_date, amount, currency, transaction_type, transaction_category, site, comment)
            VALUES (
                :user, :transaction_date, :amount, :currency, :transaction_type, :transaction_category, :site, :comment
            )
        """

        # Execute the SQL
        response = self.get_db_provider().execute_many(sql=sql, params_list=transaction_records)

        return response
    
    def query_all_transaction_records(self) -> List[sqlite3.Row]:
        """
        Queries all transaction records from the database.

        :return: List[sqlite3.Row]: A list of all transaction records.
        """
        # Formulate the SQL
        sql = """
            SELECT * FROM bookkeeping
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql)
        return response

    def query_transaction_record_by_id(self, transaction_id: int) -> Optional[sqlite3.Row]:
        """
        Queries a single transaction record from the database by its ID.

        :param transaction_id: int: The ID of the transaction record to query.
        :return: Optional[sqlite3.Row]: The transaction record if found, None otherwise.
        """
        # Formulate the SQL
        sql = """
            SELECT * FROM bookkeeping
            WHERE id = ?
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql, params=(transaction_id,))
        return response[0] if response else None

    def query_latest_transaction_records(self, number: int) -> List[sqlite3.Row]:
        """
        Queries the most recent transaction records from the database ordered by modified time.

        :param number: int: The number of transaction records to query.
        :return: List[sqlite3.Row]: A list of the most recent transaction records.
        """
# Formulate the SQL
        sql = """
            SELECT * FROM bookkeeping
            ORDER BY modified_time DESC
            LIMIT ?
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql, params=(number,))
        return response   

    def query_transaction_records_by_criteria(
        self, 
        transaction_ids: Optional[List[int]] = None, 
        transaction_date_start: Optional[datetime.date] = None,
        transaction_date_end: Optional[datetime.date] = None,
        transaction_types: Optional[List[str]] = None,
        transaction_categories: Optional[List[str]] = None,
        transaction_sites: Optional[List[str]] = None,
        comment: Optional[str] = None,
    ) -> List[sqlite3.Row]:
        """
        Queries the transaction records from the database.

        :param transaction_ids: List[int]: A list of transaction IDs to query.
        :param transaction_date_start: datetime.date: The start date of the transaction records to query.
        :param transaction_date_end: datetime.date: The end date of the transaction records to query.
        :param transaction_types: List[str]: The type of the transaction records to query.
        :param transaction_categories: List[str]: The category of the transaction records to query.
        :param transaction_sites: List[str]: The sites of the transaction records to query.
        :param comment: str: The comment of the transaction records to query.
        :return: List: A list of transaction records.
        """
        # Validate the input parameters
        ## Check that not all of the parameters are None
        if not any([transaction_ids, transaction_date_start, transaction_date_end, transaction_categories, transaction_sites, comment]):
            raise ValueError("At least one parameter must be provided for the query.")
        ## Verify the transaction_date_start and transaction_date_end are valid dates
        if transaction_date_start and transaction_date_end:
            if transaction_date_start > transaction_date_end:
                raise ValueError("transaction_date_start must be less than transaction_date_end.")

        # Formulate the SQL
        ## SQL base
        sql = """
            SELECT * FROM bookkeeping WHERE 
        """

        ## Check each of the parameters and append condition statements to the SQL
        if transaction_ids:
            sql += "id IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_ids)
            )
        if transaction_date_start:
            sql += "transaction_date >= '{}' AND ".format(
                transaction_date_start.strftime("%Y-%m-%d")
            )
        if transaction_date_end:
            sql += "transaction_date <= '{}' AND ".format(
                transaction_date_end.strftime("%Y-%m-%d")
            )
        if transaction_types:
            sql += "transaction_type IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_types)
            )
        if transaction_categories:
            sql += "transaction_category IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_categories)
            )
        if transaction_sites:
            sql += "site IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_sites)
            )
        if comment:
            sql += "comment LIKE '%{}%' AND ".format(comment)

        # Remove trailing ' AND '
        sql = sql.rstrip(" AND ")

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql)

        return response     

    def delete_transaction_record_by_id(self, transaction_id: int) -> List:
        """
        Deletes a transaction record from the database by its ID.

        :param transaction_id: int: The ID of the transaction record to delete.
        :return: List: A list of the deleted transaction records.
        """
        # Formulate the SQL
        sql = """
            DELETE FROM bookkeeping 
            WHERE id = ?
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql, params=(transaction_id,))

        return response

    def delete_transaction_records_by_ids(self, transaction_ids: List[int]) -> List:
        """
        Deletes multiple transaction records from the database by their IDs.

        :param transaction_ids: List[int]: A list of IDs of the transaction records to delete.
        :return: List: A list of the deleted transaction records.
        """
        # Formulate the SQL
        sql = f"""
            DELETE FROM bookkeeping 
            WHERE id IN ({self.get_db_provider().generate_markers(size=len(transaction_ids), marker="?")})
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql, params=tuple(transaction_ids))

        return response

    def delete_transaction_records_by_criteria(
        self, 
        transaction_ids: Optional[List[int]] = None, 
        transaction_date_start: Optional[datetime.date] = None,
        transaction_date_end: Optional[datetime.date] = None,
        transaction_types: Optional[List[str]] = None,
        transaction_categories: Optional[List[str]] = None,
        transaction_sites: Optional[List[str]] = None,
        comment: Optional[str] = None,
    ) -> List:
        """
        Queries the transaction records from the database.

        :param transaction_ids: List[int]: A list of transaction IDs to query.
        :param transaction_date_start: datetime.date: The start date of the transaction records to query.
        :param transaction_date_end: datetime.date: The end date of the transaction records to query.
        :param transaction_types: List[str]: The type of the transaction records to query.
        :param transaction_categories: List[str]: The category of the transaction records to query.
        :param transaction_sites: List[str]: The sites of the transaction records to query.
        :param comment: str: The comment of the transaction records to query.
        :return: List: A list of transaction records.
        """
        # Validate the input parameters
        ## Check that not all of the parameters are None
        if not any([transaction_ids, transaction_date_start, transaction_date_end, transaction_categories, transaction_sites, comment]):
            raise ValueError("At least one parameter must be provided for the query.")
        ## Verify the transaction_date_start and transaction_date_end are valid dates
        if transaction_date_start and transaction_date_end:
            if transaction_date_start > transaction_date_end:
                raise ValueError("transaction_date_start must be less than transaction_date_end.")

        # Formulate the SQL
        ## SQL base
        sql = """
            DELETE * FROM bookkeeping WHERE
        """

        ## Check each of the parameters and append condition statements to the SQL
        if transaction_ids:
            sql += "id IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_ids)
            )
        if transaction_date_start:
            sql += "transaction_date >= '{}' AND ".format(
                transaction_date_start.strftime("%Y-%m-%d")
            )
        if transaction_date_end:
            sql += "transaction_date <= '{}' AND ".format(
                transaction_date_end.strftime("%Y-%m-%d")
            )
        if transaction_types:
            sql += "transaction_type IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_types)
            )
        if transaction_categories:
            sql += "transaction_category IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_categories)
            )
        if transaction_sites:
            sql += "site IN ({}) AND ".format(
                self.get_db_provider().stringify_a_list_of_items_with_apostrophe(item_list=transaction_sites)
            )
        if comment:
            sql += "comment LIKE '%{}%' AND ".format(comment)

        # Remove trailing ' AND '
        sql = sql.rstrip(" AND ")

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql)

        return response     

    def update_transaction_record(self, transaction_id: int, transaction_record: Dict) -> List:
        """
        Updates a transaction record in the database.

        :param transaction_id: int: The ID of the transaction record to update.
        :param transaction_record: Dict: The transaction record to update.
        :return: None
        """
        # Formulate the SQL
        sql = f"""
            UPDATE bookkeeping 
            SET 
                user = :user, 
                transaction_date = :transaction_date, 
                amount = :amount, 
                currency = :currency,
                transaction_type = :transaction_type,
                transaction_category = :transaction_category, 
                site = :site, 
                comment = :comment,
                modified_time = datetime('now','localtime')
            WHERE id = {transaction_id}
        """

        # Execute the SQL
        response = self.get_db_provider().execute(sql=sql, params=transaction_record)

        return response

    def update_transaction_records(self, transaction_records: Dict[int, Dict]) -> List:
        """
        Updates multiple transaction records in the database.

        :param transaction_records: Dict[int, Dict]: A dictionary of transaction records to update.
        :return: None
        """
        for transaction_id, transaction_record in transaction_records.items():
            self.update_transaction_record(transaction_id=transaction_id, transaction_record=transaction_record)

    ###################################################################
    # Utility Methods
    ###################################################################
    def validate_db_file_path(self, db_file_path: str) -> bool:
        """
        Validates whether the database file path exists and is a valid SQLite database file.

        :param db_file_path: The path to the database file to validate.
        :type db_file_path: str
        :return: True if the path exists and is a file, False otherwise.
        :rtype: bool
        """
        return (
            os.path.exists(db_file_path) and 
            os.path.isfile(db_file_path) and 
            db_file_path.endswith(".db")
        )

