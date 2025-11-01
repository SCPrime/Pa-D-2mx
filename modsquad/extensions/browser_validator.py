"""
MOD SQUAD Framework - Browser Validator Extension
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Browser validation extension for MOD SQUAD.
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime

from .utils import CONFIG_PATH, dump_jsonl, load_extension_config

ARTIFACT_DIR = CONFIG_PATH.parent.parent / "logs" / "run-history" / "browser_validator"


def run() -> None:
    """Execute browser validation checks sequentially."""

    config = load_extension_config()
    guardrails = config.get("browser_guardrails")
    if not guardrails:
        return

    results = []

    # Accessibility check (axe-core)
    if guardrails.get("accessibility", {}).get("tool") == "axe-core":
        axe_result = _run_axe_core(guardrails["accessibility"])
        results.append(axe_result)

    # Performance check (Lighthouse)
    if guardrails.get("performance", {}).get("tool") == "lighthouse":
        lighthouse_result = _run_lighthouse(guardrails["performance"])
        results.append(lighthouse_result)

    dump_jsonl(
        ARTIFACT_DIR / "browser_validator.jsonl",
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "results": results,
        },
    )


def _run_axe_core(config: dict) -> dict:
    """Run axe-core accessibility scan."""
    try:
        cmd = ["npx", "axe", "http://localhost:3000", "--exit"]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        score = 100 if completed.returncode == 0 else 0
        return {
            "check": "accessibility",
            "tool": "axe-core",
            "score": score,
            "min_score": config.get("min_score", 90),
            "passed": score >= config.get("min_score", 90),
            "output": completed.stdout[:500],
        }
    except Exception as exc:  # pragma: no cover - subprocess safety
        return {
            "check": "accessibility",
            "tool": "axe-core",
            "score": 0,
            "passed": False,
            "error": str(exc),
        }


def _run_lighthouse(config: dict) -> dict:
    """Run Lighthouse performance audit."""
    try:
        cmd = [
            "npx",
            "lighthouse",
            "http://localhost:3000",
            "--output=json",
            "--quiet",
            "--chrome-flags=--headless",
        ]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if completed.returncode == 0:
            report = json.loads(completed.stdout)
            perf_score = int(report["categories"]["performance"]["score"] * 100)
        else:
            perf_score = 0

        return {
            "check": "performance",
            "tool": "lighthouse",
            "score": perf_score,
            "min_score": config.get("min_score", 85),
            "passed": perf_score >= config.get("min_score", 85),
        }
    except Exception as exc:  # pragma: no cover - subprocess safety
        return {
            "check": "performance",
            "tool": "lighthouse",
            "score": 0,
            "passed": False,
            "error": str(exc),
        }


def cli() -> None:
    run()
