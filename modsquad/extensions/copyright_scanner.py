"""
PaiiD-2mx Trading Platform
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Copyright Scanner Extension
Scans all files and reports missing copyright headers.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set

from .utils import ExtensionConfig, dump_jsonl, load_extension_config


def scan_files_for_copyright(
    repo_root: Path, file_patterns: List[str], exclude_patterns: List[str]
) -> Dict[str, Any]:
    """Scan files for copyright headers."""

    # Collect all files matching patterns
    files_to_check: List[Path] = []

    for pattern in file_patterns:
        # Handle ** glob patterns
        if "**" in pattern:
            # Remove ** prefix if present
            clean_pattern = pattern.replace("**/", "")
            files_to_check.extend(repo_root.rglob(clean_pattern))
        else:
            files_to_check.extend(repo_root.glob(pattern))

    # Filter out excluded paths
    excluded_dirs: Set[str] = set()
    for pattern in exclude_patterns:
        if "**" in pattern:
            # Extract directory name
            parts = pattern.split("/")
            if parts:
                excluded_dirs.add(parts[0])

    # Standard exclusions
    excluded_dirs.update(
        {
            "node_modules",
            ".next",
            "__pycache__",
            "dist",
            "build",
            ".git",
            "venv",
            ".venv",
        }
    )

    filtered_files = []
    for file_path in files_to_check:
        # Check if file is in excluded directory
        path_str = str(file_path)
        if any(excluded in path_str for excluded in excluded_dirs):
            continue
        if file_path.is_file():
            filtered_files.append(file_path)

    # Check each file for copyright header
    results = {
        "total_files": len(filtered_files),
        "files_with_headers": 0,
        "files_missing_headers": 0,
        "missing_files": [],
    }

    copyright_keywords = ["Copyright", "PaiiD-2mx", "PROPRIETARY", "CONFIDENTIAL"]

    for file_path in filtered_files:
        try:
            # Read first 1000 characters (where headers typically are)
            content = file_path.read_text(encoding="utf-8", errors="ignore")[:1000]

            # Check for copyright indicators
            has_copyright = any(keyword in content for keyword in copyright_keywords)

            if has_copyright:
                results["files_with_headers"] += 1
            else:
                results["files_missing_headers"] += 1
                results["missing_files"].append(str(file_path.relative_to(repo_root)))

        except Exception:
            # Skip files that can't be read
            continue

    return results


def run_copyright_scan(
    repo_root: Path = None, config: ExtensionConfig = None
) -> Dict[str, Any]:
    """Run copyright header scan."""
    if repo_root is None:
        repo_root = Path(__file__).parent.parent.parent

    if config is None:
        try:
            config = load_extension_config()
        except:
            # Use defaults if config not available
            config = None

    timestamp = datetime.now(timezone.utc).isoformat()

    # Get settings from config or use defaults
    if config:
        scanner_config = config.get("copyright_scanner")
        file_patterns = scanner_config.get(
            "file_patterns", ["**/*.py", "**/*.tsx", "**/*.ts", "**/*.js", "**/*.html"]
        )
        exclude_patterns = scanner_config.get(
            "exclude_patterns",
            ["**/node_modules/**", "**/__pycache__/**", "**/.next/**"],
        )
    else:
        file_patterns = ["**/*.py", "**/*.tsx", "**/*.ts", "**/*.js", "**/*.html"]
        exclude_patterns = ["**/node_modules/**", "**/__pycache__/**", "**/.next/**"]

    scan_results = scan_files_for_copyright(repo_root, file_patterns, exclude_patterns)

    # Calculate coverage percentage
    coverage_pct = 0.0
    if scan_results["total_files"] > 0:
        coverage_pct = (
            scan_results["files_with_headers"] / scan_results["total_files"]
        ) * 100

    result = {
        "status": "pass" if scan_results["files_missing_headers"] == 0 else "fail",
        "timestamp": timestamp,
        "errors": [],
        "warnings": [],
        "info": [],
        "timings": {},
        "p95_ms": 0,
        "details": {
            "scan_results": scan_results,
            "coverage_percentage": round(coverage_pct, 2),
            "file_patterns": file_patterns,
            "exclude_patterns": exclude_patterns,
        },
    }

    if scan_results["files_missing_headers"] > 0:
        result["warnings"].append(
            f"Found {scan_results['files_missing_headers']} files missing copyright headers "
            f"({scan_results['files_with_headers']}/{scan_results['total_files']} have headers)"
        )
        result["info"].append(f"Coverage: {coverage_pct:.1f}%")
    else:
        result["info"].append(
            f"All {scan_results['total_files']} files have copyright headers (100% coverage)"
        )

    return result


def audit() -> None:
    """Run copyright scan and log results."""
    config = load_extension_config()
    scanner_config = config.get("copyright_scanner")

    if not scanner_config.get("enabled", False):
        return

    result = run_copyright_scan(config=config)

    # Write to log file
    report_path = (
        Path(__file__).parent.parent / "logs" / "run-history" / "copyright_scan.jsonl"
    )
    dump_jsonl(report_path, result)


def cli() -> None:
    """CLI entry point."""
    import sys

    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    check_only = "--check-only" in sys.argv

    result = run_copyright_scan(repo_root)

    # Output JSON for MOD SQUAD integration
    print(json.dumps(result, indent=2))

    # Exit with error code if scan found missing headers (unless check-only mode)
    if not check_only and result["status"] == "fail":
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    cli()
