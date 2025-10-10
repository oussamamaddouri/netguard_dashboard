# backend/app/create_db.py

import sys
import time
from sqlalchemy.exc import OperationalError

# Import your core database objects and models
from app.database import engine, Base
from app import models

# --- Configuration for the retry logic ---
# Total number of times we will try to connect
MAX_RETRIES = 15
# How many seconds to wait between each failed attempt
RETRY_DELAY_SECONDS = 4

def initialize_database():
    """
    Connects to the database and creates all necessary tables.
    Includes a retry loop to wait for the database container to be fully ready.
    """
    print("--- Automated Database Initializer ---")
    
    # Loop for a fixed number of retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Attempt to connect to the database. The 'create_all' command
            # requires a successful connection to proceed.
            print(f"Attempting to connect to database... (Attempt {attempt}/{MAX_RETRIES})")
            Base.metadata.create_all(bind=engine)
            
            # If we reach this line, the connection was successful.
            print("✅ Database connection successful. Tables are verified/created.")
            return # Exit the function successfully.

        except OperationalError:
            # This is the specific error SQLAlchemy gives when it can't connect.
            print("⚠️ Database connection failed. It might still be starting up.")
            if attempt < MAX_RETRIES:
                print(f"   Retrying in {RETRY_DELAY_SECONDS} seconds...")
                time.sleep(RETRY_DELAY_SECONDS)
            else:
                # If we've used all our retries, print a final error and exit.
                print("❌ Max retries reached. Could not connect to the database.", file=sys.stderr)
                # Re-raise the exception to make the script exit with a failure code.
                raise

# This part runs when you execute `python -m app.create_db`
if __name__ == "__main__":
    try:
        initialize_database()
    except OperationalError:
        # The function already printed the detailed error. We just need to ensure exit code is non-zero.
        sys.exit(1)
    except Exception as e:
        print(f"❌ An unexpected critical error occurred during initialization: {e}", file=sys.stderr)
        sys.exit(1)