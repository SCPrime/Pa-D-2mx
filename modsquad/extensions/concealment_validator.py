"""
PaiiD-2mx Trading Platform
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Concealment Validator Extension
Validates all concealment measures are in place.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict


def check_license_file(repo_root: Path) -> Dict[str, Any]:
    """Check if LICENSE file exists and has correct copyright."""
    license_path = repo_root / "LICENSE"
    result = {"check": "license_file", "status": "pass", "message": "", "details": {}}

    if not license_path.exists():
        result["status"] = "fail"
        result["message"] = "LICENSE file not found"
        return result

    content = license_path.read_text(encoding="utf-8")

    # Check for required elements
    checks = {
        "has_copyright": "Copyright" in content and "Dr. SC Prime" in content,
        "has_paiid_2mx": "PaiiD-2mx" in content,
        "has_proprietary": "PROPRIETARY" in content or "CONFIDENTIAL" in content,
        "has_dmca": "DMCA" in content or "takedown" in content.lower(),
    }

    if not all(checks.values()):
        result["status"] = "fail"
        result["message"] = (
            f"LICENSE file missing required elements: {[k for k, v in checks.items() if not v]}"
        )
        result["details"] = checks
        return result

    result["message"] = "LICENSE file valid"
    result["details"] = checks
    return result


def check_robots_txt(repo_root: Path) -> Dict[str, Any]:
    """Check if robots.txt exists and blocks all crawlers."""
    robots_path = repo_root / "robots.txt"
    result = {"check": "robots_txt", "status": "pass", "message": "", "details": {}}

    if not robots_path.exists():
        result["status"] = "fail"
        result["message"] = "robots.txt file not found"
        return result

    content = robots_path.read_text(encoding="utf-8")

    # Check for required elements
    checks = {
        "has_disallow": "Disallow: /" in content,
        "has_user_agent": "User-agent:" in content or "User-agent" in content,
        "has_copyright": "Copyright" in content or "PaiiD-2mx" in content,
    }

    if not checks["has_disallow"]:
        result["status"] = "fail"
        result["message"] = (
            "robots.txt does not block all crawlers (missing 'Disallow: /')"
        )
        result["details"] = checks
        return result

    result["message"] = "robots.txt valid"
    result["details"] = checks
    return result


def check_html_files(repo_root: Path) -> Dict[str, Any]:
    """Check HTML files for copyright headers and robots meta tags."""
    html_files = []
    for pattern in ["**/*.html"]:
        html_files.extend(repo_root.glob(pattern))

    # Exclude node_modules, .next, __pycache__, etc.
    excluded_dirs = {"node_modules", ".next", "__pycache__", "dist", "build", ".git"}
    html_files = [
        f
        for f in html_files
        if not any(excluded in str(f) for excluded in excluded_dirs)
    ]

    results = {
        "check": "html_files",
        "status": "pass",
        "message": "",
        "details": {
            "total_files": len(html_files),
            "files_with_headers": 0,
            "files_with_robots": 0,
            "missing_headers": [],
            "missing_robots": [],
        },
    }

    for html_file in html_files:
        try:
            content = html_file.read_text(encoding="utf-8")

            # Check for copyright header
            has_header = ("PaiiD-2mx" in content or "Copyright" in content) and (
                "PROPRIETARY" in content or "CONFIDENTIAL" in content
            )

            # Check for robots meta tag
            has_robots = 'name="robots"' in content and (
                "noindex" in content or "nofollow" in content
            )

            if has_header:
                results["details"]["files_with_headers"] += 1
            else:
                results["details"]["missing_headers"].append(
                    str(html_file.relative_to(repo_root))
                )

            if has_robots:
                results["details"]["files_with_robots"] += 1
            else:
                results["details"]["missing_robots"].append(
                    str(html_file.relative_to(repo_root))
                )

        except Exception:
            # Skip files that can't be read
            continue

    # Determine overall status
    if results["details"]["missing_headers"] or results["details"]["missing_robots"]:
        results["status"] = "fail"
        results["message"] = (
            f"Found {len(results['details']['missing_headers'])} files missing headers, {len(results['details']['missing_robots'])} missing robots tags"
        )
    else:
        results["message"] = (
            f"All {results['details']['total_files']} HTML files have headers and robots tags"
        )

    return results


def check_source_files(repo_root: Path) -> Dict[str, Any]:
    """Check key source files for copyright headers."""
    key_files = [
        repo_root / "backend" / "app" / "main.py",
        repo_root / "backend" / "app" / "core" / "config.py",
        repo_root / "frontend" / "pages" / "index.tsx",
    ]

    results = {
        "check": "source_files",
        "status": "pass",
        "message": "",
        "details": {"checked_files": [], "missing_headers": []},
    }

    for file_path in key_files:
        if not file_path.exists():
            continue

        results["details"]["checked_files"].append(
            str(file_path.relative_to(repo_root))
        )

        try:
            content = file_path.read_text(encoding="utf-8")

            # Check for copyright header (first 500 chars)
            header_check = content[:500]
            has_header = (
                "PaiiD-2mx" in header_check or "Copyright" in header_check
            ) and ("PROPRIETARY" in header_check or "CONFIDENTIAL" in header_check)

            if not has_header:
                results["details"]["missing_headers"].append(
                    str(file_path.relative_to(repo_root))
                )

        except Exception:
            continue

    if results["details"]["missing_headers"]:
        results["status"] = "fail"
        results["message"] = (
            f"Found {len(results['details']['missing_headers'])} key files missing copyright headers"
        )
    else:
        results["message"] = (
            f"All {len(results['details']['checked_files'])} key source files have copyright headers"
        )

    return results


def check_readme_warning(repo_root: Path) -> Dict[str, Any]:
    """Check if README.md has warning section."""
    readme_path = repo_root / "README.md"
    result = {"check": "readme_warning", "status": "pass", "message": "", "details": {}}

    if not readme_path.exists():
        result["status"] = "fail"
        result["message"] = "README.md not found"
        return result

    content = readme_path.read_text(encoding="utf-8")

    # Check for warning section (first 500 chars)
    header_check = content[:500]
    checks = {
        "has_proprietary": "PROPRIETARY" in header_check
        or "CONFIDENTIAL" in header_check,
        "has_copyright": "Copyright" in header_check,
        "has_monitored": "MONITORED" in header_check
        or "monitored" in header_check.lower(),
    }

    if not all(checks.values()):
        result["status"] = "fail"
        result["message"] = (
            f"README.md missing warning section elements: {[k for k, v in checks.items() if not v]}"
        )
        result["details"] = checks
        return result

    result["message"] = "README.md has warning section"
    result["details"] = checks
    return result


def run_concealment_validation(repo_root: Path = None) -> Dict[str, Any]:
    """Run all concealment validation checks."""
    if repo_root is None:
        repo_root = Path(__file__).parent.parent.parent

    timestamp = datetime.now(timezone.utc).isoformat()

    checks = [
        check_license_file(repo_root),
        check_robots_txt(repo_root),
        check_html_files(repo_root),
        check_source_files(repo_root),
        check_readme_warning(repo_root),
    ]

    failed_checks = [c for c in checks if c["status"] == "fail"]

    result = {
        "status": "pass" if not failed_checks else "fail",
        "timestamp": timestamp,
        "errors": [],
        "warnings": [],
        "info": [],
        "timings": {},
        "p95_ms": 0,
        "details": {
            "checks": checks,
            "summary": {
                "total_checks": len(checks),
                "passed": len(checks) - len(failed_checks),
                "failed": len(failed_checks),
            },
        },
    }

    if failed_checks:
        result["errors"] = [c["message"] for c in failed_checks]

    return result


if __name__ == "__main__":
    """CLI entry point for standalone execution."""
    import sys

    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None

    result = run_concealment_validation(repo_root)

    # Output JSON for MOD SQUAD integration
    print(json.dumps(result, indent=2))

    # Exit with error code if validation failed
    sys.exit(1 if result["status"] == "fail" else 0)
