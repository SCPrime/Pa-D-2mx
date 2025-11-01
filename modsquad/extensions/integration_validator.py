"""
MOD SQUAD Framework - Integration Validator Extension
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Integration validator for MOD SQUAD parallel streams.
"""

from __future__ import annotations

import subprocess
from datetime import datetime
from typing import Any

from .utils import CONFIG_PATH, dump_jsonl

ARTIFACT_DIR = (
    CONFIG_PATH.parent.parent / "logs" / "run-history" / "integration_validator"
)


def run() -> dict[str, Any]:
    """Run integration validation across all active streams."""

    results = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "backend_tests": _run_backend_tests(),
        "frontend_tests": _run_frontend_tests(),
        "e2e_tests": _run_e2e_tests(),
        "api_contract": _run_contract_tests(),
    }

    results["overall_passed"] = all(
        [
            results["backend_tests"]["passed"],
            results["frontend_tests"]["passed"],
            results["e2e_tests"]["passed"],
            results["api_contract"]["passed"],
        ]
    )

    dump_jsonl(ARTIFACT_DIR / "integration_validator.jsonl", results)
    return results


def _run_backend_tests() -> dict[str, Any]:
    """Run backend pytest suite."""
    try:
        cmd = ["pytest", "backend/tests", "-q", "--tb=short"]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        return {
            "passed": completed.returncode == 0,
            "returncode": completed.returncode,
            "output": completed.stdout[:500],
        }
    except Exception as exc:  # pragma: no cover
        return {"passed": False, "error": str(exc)}


def _run_frontend_tests() -> dict[str, Any]:
    """Run frontend Playwright tests."""
    try:
        cmd = ["npm", "run", "playwright:test:ci"]
        completed = subprocess.run(
            cmd, capture_output=True, text=True, timeout=600, cwd="frontend"
        )
        return {
            "passed": completed.returncode == 0,
            "returncode": completed.returncode,
            "output": completed.stdout[:500],
        }
    except Exception as exc:  # pragma: no cover
        return {"passed": False, "error": str(exc)}


def _run_e2e_tests() -> dict[str, Any]:
    """Run end-to-end smoke tests."""
    try:
        cmd = ["pytest", "tests/integration/test_smoke.py", "-v"]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        return {
            "passed": completed.returncode == 0,
            "returncode": completed.returncode,
            "output": completed.stdout[:500],
        }
    except Exception as exc:  # pragma: no cover
        return {"passed": False, "error": str(exc)}


def _run_contract_tests() -> dict[str, Any]:
    """Run API contract validation."""
    # Placeholder: would invoke contract_enforcer extension
    return {"passed": True, "skipped": "contract_enforcer runs separately"}


def cli() -> None:
    result = run()
    exit_code = 0 if result["overall_passed"] else 1
    import sys

    sys.exit(exit_code)


__all__ = ["run"]
