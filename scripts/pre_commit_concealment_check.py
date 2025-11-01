"""
PaiiD-2mx Trading Platform
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Pre-commit Concealment Check Script
Runs concealment validation before commits.
"""

import sys
from pathlib import Path

# Add modsquad extensions to path
repo_root = Path(__file__).parent.parent
sys.path.insert(0, str(repo_root / "modsquad" / "extensions"))

try:
    from concealment_validator import run_concealment_validation

    result = run_concealment_validation(repo_root)

    if result["status"] == "fail":
        print("\n" + "=" * 60)
        print("❌ CONCEALMENT VALIDATION FAILED")
        print("=" * 60)
        print("\nErrors found:")
        for error in result.get("errors", []):
            print(f"  - {error}")
        print("\n⚠️  Commit blocked: Concealment measures must be in place")
        print("\nTo bypass (NOT recommended):")
        print("  git commit --no-verify")
        print("=" * 60 + "\n")
        sys.exit(1)
    else:
        print("✅ Concealment validation passed")
        sys.exit(0)

except ImportError as e:
    print(f"⚠️  Warning: Could not import concealment_validator: {e}")
    print("Skipping concealment check (extension may not be installed)")
    sys.exit(0)
except Exception as e:
    print(f"⚠️  Warning: Concealment check failed: {e}")
    print("Skipping concealment check (non-blocking)")
    sys.exit(0)
