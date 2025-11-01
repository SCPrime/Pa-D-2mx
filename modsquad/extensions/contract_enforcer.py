"""
MOD SQUAD Framework - Contract Enforcer Extension
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

API contract enforcement extension for MOD SQUAD.
"""

from __future__ import annotations

import subprocess
from datetime import datetime

from .utils import CONFIG_PATH, dump_jsonl, load_extension_config

ARTIFACT_DIR = CONFIG_PATH.parent.parent / "logs" / "run-history" / "contract_enforcer"


def run() -> None:
    """Execute API contract validation."""

    config = load_extension_config()
    contract_config = config.get("contract_enforcer")
    if not contract_config or not contract_config.get("enabled", False):
        return

    spec_path = contract_config.get("spec_path", "backend/docs/openapi.yaml")
    results = _run_dredd(spec_path)

    dump_jsonl(
        ARTIFACT_DIR / "contract_enforcer.jsonl",
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "spec_path": spec_path,
            "results": results,
        },
    )


def _run_dredd(spec_path: str) -> dict:
    """Run Dredd contract tests."""
    try:
        cmd = ["dredd", spec_path, "http://localhost:8011"]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        passed = completed.returncode == 0
        return {
            "tool": "dredd",
            "passed": passed,
            "returncode": completed.returncode,
            "output": completed.stdout[:1000],
            "stderr": completed.stderr[:500] if completed.stderr else "",
        }
    except FileNotFoundError:
        return {
            "tool": "dredd",
            "passed": False,
            "error": "dredd not installed (npm install -g dredd)",
        }
    except Exception as exc:  # pragma: no cover - subprocess safety
        return {
            "tool": "dredd",
            "passed": False,
            "error": str(exc),
        }


def cli() -> None:
    run()
