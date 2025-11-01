"""
PaiiD-2mx Trading Platform
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Visibility Lockdown Extension
Validates repository visibility settings and GitHub Pages configuration.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from .utils import ExtensionConfig, dump_jsonl, load_extension_config


def check_repo_visibility(repo_root: Path, repository: str) -> Dict[str, Any]:
    """Check repository visibility status (requires manual verification)."""
    result = {
        "check": "repo_visibility",
        "status": "unknown",
        "message": "Requires manual verification via GitHub",
        "details": {
            "repository": repository,
            "url": f"https://github.com/{repository}/settings",
            "note": "Repository visibility can only be checked via GitHub API or manually",
        },
    }
    return result


def check_github_pages_status(repo_root: Path, repository: str) -> Dict[str, Any]:
    """Check GitHub Pages status (requires manual verification)."""
    result = {
        "check": "github_pages_status",
        "status": "unknown",
        "message": "Requires manual verification via GitHub",
        "details": {
            "repository": repository,
            "url": f"https://github.com/{repository}/settings/pages",
            "note": "GitHub Pages status can only be checked via GitHub API or manually",
        },
    }
    return result


def check_public_urls(repo_root: Path) -> Dict[str, Any]:
    """Check for public deployment URLs in configuration files."""
    result = {
        "check": "public_urls",
        "status": "pass",
        "message": "",
        "details": {"found_urls": [], "checked_files": []},
    }

    # Check common config files for public URLs
    config_files = [
        repo_root / "README.md",
        repo_root / "package.json",
        repo_root / "render.yaml",
        repo_root / ".github" / "workflows" / "*.yml",
    ]

    public_url_patterns = [
        "https://",
        "http://",
        "onrender.com",
        "vercel.app",
        "github.io",
    ]

    for config_pattern in config_files:
        if "*" in str(config_pattern):
            # Handle glob patterns
            for file_path in repo_root.glob(str(config_pattern)):
                if file_path.is_file():
                    result["details"]["checked_files"].append(
                        str(file_path.relative_to(repo_root))
                    )
                    try:
                        content = file_path.read_text(encoding="utf-8", errors="ignore")
                        for pattern in public_url_patterns:
                            if pattern in content:
                                result["details"]["found_urls"].append(
                                    {
                                        "file": str(file_path.relative_to(repo_root)),
                                        "pattern": pattern,
                                    }
                                )
                    except Exception:
                        continue
        else:
            if config_pattern.exists() and config_pattern.is_file():
                result["details"]["checked_files"].append(
                    str(config_pattern.relative_to(repo_root))
                )
                try:
                    content = config_pattern.read_text(
                        encoding="utf-8", errors="ignore"
                    )
                    for pattern in public_url_patterns:
                        if pattern in content:
                            result["details"]["found_urls"].append(
                                {
                                    "file": str(config_pattern.relative_to(repo_root)),
                                    "pattern": pattern,
                                }
                            )
                except Exception:
                    continue

    if result["details"]["found_urls"]:
        result["status"] = "warn"
        result["message"] = (
            f"Found {len(result['details']['found_urls'])} potential public URLs in config files"
        )
    else:
        result["message"] = (
            "No public URLs found in config files (or require manual verification)"
        )

    return result


def check_robots_txt_accessible(repo_root: Path, repository: str) -> Dict[str, Any]:
    """Check if robots.txt is accessible (requires manual verification)."""
    robots_path = repo_root / "robots.txt"
    result = {
        "check": "robots_txt_accessible",
        "status": "pass",
        "message": "",
        "details": {},
    }

    if not robots_path.exists():
        result["status"] = "fail"
        result["message"] = "robots.txt file not found"
        return result

    # Check if robots.txt exists (can't verify GitHub Pages accessibility without API)
    result["message"] = "robots.txt exists locally"
    result["details"] = {
        "local_path": str(robots_path.relative_to(repo_root)),
        "github_pages_url": f"https://{repository.split('/')[0]}.github.io/{repository.split('/')[1]}/robots.txt",
        "note": "Accessibility requires manual verification or GitHub API",
    }

    return result


def check_search_engine_indexing(repo_root: Path, repository: str) -> Dict[str, Any]:
    """Check search engine indexing status (requires manual verification)."""
    result = {
        "check": "search_engine_indexing",
        "status": "unknown",
        "message": "Requires manual verification",
        "details": {
            "google_search": f"site:github.com/{repository}",
            "bing_search": f"site:github.com/{repository}",
            "note": "Search engine indexing requires manual verification via search engines",
        },
    }
    return result


def run_visibility_lockdown(
    repo_root: Path = None, config: ExtensionConfig = None
) -> Dict[str, Any]:
    """Run visibility lockdown validation."""
    if repo_root is None:
        repo_root = Path(__file__).parent.parent.parent

    if config is None:
        try:
            config = load_extension_config()
        except:
            config = None

    timestamp = datetime.now(timezone.utc).isoformat()

    # Get repository name from config or use default
    if config:
        lockdown_config = config.get("visibility_lockdown")
        repository = lockdown_config.get("repository", "SCPrime/Pa-D-2mx")
    else:
        repository = "SCPrime/Pa-D-2mx"

    checks = [
        check_repo_visibility(repo_root, repository),
        check_github_pages_status(repo_root, repository),
        check_public_urls(repo_root),
        check_robots_txt_accessible(repo_root, repository),
        check_search_engine_indexing(repo_root, repository),
    ]

    # Determine overall status
    failed_checks = [c for c in checks if c["status"] == "fail"]
    warn_checks = [c for c in checks if c["status"] == "warn"]

    overall_status = "pass"
    if failed_checks:
        overall_status = "fail"
    elif warn_checks:
        overall_status = "warn"

    result = {
        "status": overall_status,
        "timestamp": timestamp,
        "errors": [],
        "warnings": [],
        "info": [],
        "timings": {},
        "p95_ms": 0,
        "details": {
            "checks": checks,
            "repository": repository,
            "summary": {
                "total_checks": len(checks),
                "passed": len([c for c in checks if c["status"] == "pass"]),
                "warned": len(warn_checks),
                "failed": len(failed_checks),
                "unknown": len([c for c in checks if c["status"] == "unknown"]),
            },
        },
    }

    if failed_checks:
        result["errors"] = [c["message"] for c in failed_checks]
    if warn_checks:
        result["warnings"] = [c["message"] for c in warn_checks]
    if any(c["status"] == "unknown" for c in checks):
        result["info"].append("Some checks require manual verification via GitHub")

    return result


def audit() -> None:
    """Run visibility lockdown check and log results."""
    config = load_extension_config()
    lockdown_config = config.get("visibility_lockdown")

    if not lockdown_config.get("enabled", False):
        return

    result = run_visibility_lockdown(config=config)

    # Write to log file
    report_path = (
        Path(__file__).parent.parent
        / "logs"
        / "run-history"
        / "visibility_lockdown.jsonl"
    )
    dump_jsonl(report_path, result)


def cli() -> None:
    """CLI entry point."""
    import sys

    repo_root = Path(sys.argv[1]) if len(sys.argv) > 1 else None

    result = run_visibility_lockdown(repo_root)

    # Output JSON for MOD SQUAD integration
    print(json.dumps(result, indent=2))

    # Exit with error code if validation failed
    sys.exit(1 if result["status"] == "fail" else 0)


if __name__ == "__main__":
    cli()
