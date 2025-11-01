"""
PaiiD-2mx Trading Platform
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Concealment Reporter Extension
Generates comprehensive concealment compliance reports.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from .utils import ExtensionConfig, dump_jsonl, load_extension_config

# Import other concealment extensions
try:
    from .concealment_validator import run_concealment_validation
except ImportError:
    run_concealment_validation = None

try:
    from .copyright_scanner import run_copyright_scan
except ImportError:
    run_copyright_scan = None

try:
    from .visibility_lockdown import run_visibility_lockdown
except ImportError:
    run_visibility_lockdown = None

try:
    from .secrets_watchdog import audit as secrets_audit
except ImportError:
    secrets_audit = None


def load_previous_results(extension_name: str, logs_dir: Path) -> Dict[str, Any] | None:
    """Load the most recent result from an extension's log file."""
    log_file = logs_dir / "run-history" / f"{extension_name}.jsonl"
    if not log_file.exists():
        return None

    try:
        # Read last line (most recent result)
        with log_file.open("r", encoding="utf-8") as f:
            lines = f.readlines()
            if lines:
                last_line = lines[-1].strip()
                if last_line:
                    return json.loads(last_line)
    except Exception:
        pass

    return None


def generate_concealment_report(
    repo_root: Path = None, config: ExtensionConfig = None
) -> Dict[str, Any]:
    """Generate comprehensive concealment compliance report."""
    if repo_root is None:
        repo_root = Path(__file__).parent.parent.parent

    if config is None:
        try:
            config = load_extension_config()
        except:
            config = None

    timestamp = datetime.now(timezone.utc).isoformat()

    logs_dir = Path(__file__).parent.parent / "logs"

    # Collect results from all concealment extensions
    results = {
        "concealment_validator": None,
        "copyright_scanner": None,
        "visibility_lockdown": None,
        "secrets_watchdog": None,
    }

    # Try to get fresh results, fall back to cached if available
    if run_concealment_validation:
        try:
            results["concealment_validator"] = run_concealment_validation(repo_root)
        except Exception:
            # Try loading from log file
            results["concealment_validator"] = load_previous_results(
                "concealment_validator", logs_dir
            )

    if run_copyright_scan:
        try:
            results["copyright_scanner"] = run_copyright_scan(repo_root, config)
        except Exception:
            results["copyright_scanner"] = load_previous_results(
                "copyright_scan", logs_dir
            )

    if run_visibility_lockdown:
        try:
            results["visibility_lockdown"] = run_visibility_lockdown(repo_root, config)
        except Exception:
            results["visibility_lockdown"] = load_previous_results(
                "visibility_lockdown", logs_dir
            )

    # Secrets watchdog runs its own audit function
    if secrets_audit:
        try:
            secrets_audit()
            results["secrets_watchdog"] = load_previous_results(
                "secrets_watchdog", logs_dir
            )
        except Exception:
            results["secrets_watchdog"] = load_previous_results(
                "secrets_watchdog", logs_dir
            )

    # Calculate overall compliance score
    compliance_score = 0.0
    total_checks = 0
    passed_checks = 0

    for ext_name, ext_result in results.items():
        if ext_result and isinstance(ext_result, dict):
            if ext_result.get("status") == "pass":
                passed_checks += 1
            total_checks += 1

            # Also check nested checks if available
            if "details" in ext_result and "checks" in ext_result["details"]:
                for check in ext_result["details"]["checks"]:
                    if isinstance(check, dict) and check.get("status") == "pass":
                        passed_checks += 1
                    total_checks += 1

    if total_checks > 0:
        compliance_score = (passed_checks / total_checks) * 100

    # Determine overall status
    overall_status = "pass"
    if compliance_score < 80:
        overall_status = "fail"
    elif compliance_score < 100:
        overall_status = "warn"

    # Compile summary
    summary = {
        "compliance_score": round(compliance_score, 2),
        "total_checks": total_checks,
        "passed_checks": passed_checks,
        "failed_checks": total_checks - passed_checks,
        "overall_status": overall_status,
    }

    # Extract key metrics
    key_metrics = {}
    if results["concealment_validator"]:
        validator_details = results["concealment_validator"].get("details", {})
        if "summary" in validator_details:
            key_metrics["concealment_validation"] = validator_details["summary"]

    if results["copyright_scanner"]:
        scanner_details = results["copyright_scanner"].get("details", {})
        if "coverage_percentage" in scanner_details:
            key_metrics["copyright_coverage"] = scanner_details["coverage_percentage"]

    if results["visibility_lockdown"]:
        lockdown_details = results["visibility_lockdown"].get("details", {})
        if "summary" in lockdown_details:
            key_metrics["visibility_status"] = lockdown_details["summary"]

    result = {
        "status": overall_status,
        "timestamp": timestamp,
        "errors": [],
        "warnings": [],
        "info": [],
        "timings": {},
        "p95_ms": 0,
        "details": {
            "summary": summary,
            "key_metrics": key_metrics,
            "extension_results": {
                k: {
                    "status": v.get("status") if v else "unknown",
                    "timestamp": v.get("timestamp") if v else None,
                }
                for k, v in results.items()
            },
            "full_results": results,
        },
    }

    # Collect errors and warnings from all extensions
    for ext_name, ext_result in results.items():
        if ext_result and isinstance(ext_result, dict):
            if ext_result.get("errors"):
                result["errors"].extend(
                    [f"{ext_name}: {e}" for e in ext_result["errors"]]
                )
            if ext_result.get("warnings"):
                result["warnings"].extend(
                    [f"{ext_name}: {w}" for w in ext_result["warnings"]]
                )

    # Add summary info
    result["info"].append(f"Compliance Score: {compliance_score:.1f}%")
    result["info"].append(f"Checks Passed: {passed_checks}/{total_checks}")

    return result


def audit() -> None:
    """Run concealment report and log results."""
    config = load_extension_config()
    reporter_config = config.get("concealment_reporter")

    if not reporter_config.get("enabled", False):
        return

    result = generate_concealment_report(config=config)

    # Write to log file
    output_path = Path(__file__).parent.parent / reporter_config.get(
        "output", "logs/run-history/concealment_report.jsonl"
    )
    dump_jsonl(output_path, result)


def cli() -> None:
    """CLI entry point."""
    import sys

    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None

    result = generate_concealment_report(repo_root)

    # Output JSON for MOD SQUAD integration
    print(json.dumps(result, indent=2))

    # Exit with error code if compliance is low
    sys.exit(1 if result["status"] == "fail" else 0)


if __name__ == "__main__":
    cli()
