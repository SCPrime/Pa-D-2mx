"""
Run Database Migration - Add KYC Fields to User Table

This script runs the Alembic migration to add all KYC fields
to the users table in the database.

Usage:
  python run-migration.py
"""

import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from alembic.config import Config
from alembic import command
from app.core.logging_utils import get_secure_logger

logger = get_secure_logger(__name__)


def run_migration():
    """Run pending database migrations"""
    
    try:
        logger.info("🔄 Starting database migration...")
        
        # Configure Alembic
        alembic_cfg = Config("alembic.ini")
        
        # Run migration to latest version
        command.upgrade(alembic_cfg, "head")
        
        logger.info("✅ Database migration completed successfully!")
        logger.info("📊 KYC fields added to users table:")
        logger.info("   - phone_number, date_of_birth, ssn_last_4")
        logger.info("   - address_line1, address_line2, city, state, zip_code, country")
        logger.info("   - citizenship, employment_status, occupation, employer_name")
        logger.info("   - annual_income, net_worth, investment_experience, funding_source")
        logger.info("   - agreed_to_terms, agreed_to_data_sharing")
        logger.info("   - kyc_verified, kyc_verified_at")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        logger.error("💡 Check that:")
        logger.error("   1. PostgreSQL is running")
        logger.error("   2. DATABASE_URL is set correctly")
        logger.error("   3. Database user has permission to ALTER TABLE")
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

