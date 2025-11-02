"""Add KYC fields to User table

Revision ID: 001_kyc_fields
Revises: 
Create Date: 2025-11-02 22:00:00

Adds phone_number, date_of_birth, SSN, address, and employment fields
to User model for KYC compliance and commercial parity.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_kyc_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add KYC fields to users table"""
    
    # Add phone and identity fields
    op.add_column('users', sa.Column('phone_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('ssn_last_4', sa.String(4), nullable=True))
    
    # Add address fields
    op.add_column('users', sa.Column('address_line1', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('address_line2', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(2), nullable=True))
    op.add_column('users', sa.Column('zip_code', sa.String(10), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(2), nullable=True, server_default='US'))
    
    # Add identity and employment fields
    op.add_column('users', sa.Column('citizenship', sa.String(2), nullable=True))
    op.add_column('users', sa.Column('employment_status', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('occupation', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('employer_name', sa.String(255), nullable=True))
    
    # Add financial info fields
    op.add_column('users', sa.Column('annual_income', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('net_worth', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('investment_experience', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('funding_source', sa.String(100), nullable=True))
    
    # Add agreement and verification fields
    op.add_column('users', sa.Column('agreed_to_terms', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('users', sa.Column('agreed_to_data_sharing', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('users', sa.Column('kyc_verified', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('users', sa.Column('kyc_verified_at', sa.DateTime(), nullable=True))


def downgrade():
    """Remove KYC fields from users table"""
    
    # Remove all added columns in reverse order
    op.drop_column('users', 'kyc_verified_at')
    op.drop_column('users', 'kyc_verified')
    op.drop_column('users', 'agreed_to_data_sharing')
    op.drop_column('users', 'agreed_to_terms')
    
    op.drop_column('users', 'funding_source')
    op.drop_column('users', 'investment_experience')
    op.drop_column('users', 'net_worth')
    op.drop_column('users', 'annual_income')
    
    op.drop_column('users', 'employer_name')
    op.drop_column('users', 'occupation')
    op.drop_column('users', 'employment_status')
    op.drop_column('users', 'citizenship')
    
    op.drop_column('users', 'country')
    op.drop_column('users', 'zip_code')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address_line2')
    op.drop_column('users', 'address_line1')
    
    op.drop_column('users', 'ssn_last_4')
    op.drop_column('users', 'date_of_birth')
    op.drop_column('users', 'phone_number')

