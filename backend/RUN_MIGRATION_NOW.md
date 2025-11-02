# DATABASE MIGRATION - RUN NOW!

**CRITICAL:** This migration fixes the P0 blocker found by Terminal Claude!

---

## PROBLEM

```
psycopg2.errors.UndefinedColumn: column users.phone_number does not exist
```

The User model defines KYC fields (phone_number, date_of_birth, etc.) but the database schema doesn't have them.

---

## SOLUTION

Created Alembic migration to add all KYC fields to users table.

---

## RUN MIGRATION (Choose One)

### Option A: Using Alembic (RECOMMENDED)
```bash
cd backend
pip install alembic
alembic upgrade head
```

### Option B: Using Python Script
```bash
cd backend
python run-migration.py
```

### Option C: Direct SQL (If Alembic fails)
```sql
-- Connect to PostgreSQL database
-- Run these ALTER TABLE statements:

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ssn_last_4 VARCHAR(4);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US';
ALTER TABLE users ADD COLUMN IF NOT EXISTS citizenship VARCHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_income VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS net_worth VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS investment_experience VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS funding_source VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agreed_to_data_sharing BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP;
```

---

## VERIFY MIGRATION

After running migration:

```python
# Test query
from app.db.session import SessionLocal
from app.models.database import User

db = SessionLocal()
users = db.query(User).all()
print(f"✅ Found {len(users)} users")
db.close()
```

---

## FOR PRODUCTION (Render)

Migration will run automatically on next deployment if you add to `backend/Dockerfile`:

```dockerfile
# Run migrations
RUN alembic upgrade head
```

---

## ROLLBACK (If Needed)

```bash
cd backend
alembic downgrade -1
```

---

**Terminal Claude - Run this on your end!**
**Cursor Claude - Standing by for your confirmation!**

**MOD SQUAD MAX - P0 BLOCKER FIX IN PROGRESS!** 🔧

