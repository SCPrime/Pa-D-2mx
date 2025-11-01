"""
MOD SQUAD Framework - Infrastructure Health Extension
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Infrastructure health validation for MOD SQUAD.
"""

from __future__ import annotations

import socket
import subprocess
from datetime import datetime

from .utils import CONFIG_PATH, dump_jsonl, load_extension_config

ARTIFACT_DIR = CONFIG_PATH.parent.parent / "logs" / "run-history" / "infra_health"


def run() -> None:
    """Execute infrastructure health checks."""

    config = load_extension_config()
    infra_config = config.get("infra_health")
    if not infra_config or not infra_config.get("enabled", False):
        return

    services = infra_config.get("services", [])
    timeout = infra_config.get("timeout_seconds", 30)

    results = []
    for service in services:
        if service == "postgres":
            results.append(_check_postgres())
        elif service == "redis":
            results.append(_check_redis())
        elif service == "docker":
            results.append(_check_docker_services(timeout))

    dump_jsonl(
        ARTIFACT_DIR / "infra_health.jsonl",
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "services": services,
            "results": results,
        },
    )


def _check_postgres() -> dict:
    """Check Postgres connectivity on default dev port."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(("localhost", 5433))
        sock.close()
        return {
            "service": "postgres",
            "healthy": result == 0,
            "port": 5433,
        }
    except Exception as exc:  # pragma: no cover - network safety
        return {
            "service": "postgres",
            "healthy": False,
            "error": str(exc),
        }


def _check_redis() -> dict:
    """Check Redis connectivity on default dev port."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(("localhost", 6380))
        sock.close()
        return {
            "service": "redis",
            "healthy": result == 0,
            "port": 6380,
        }
    except Exception as exc:  # pragma: no cover - network safety
        return {
            "service": "redis",
            "healthy": False,
            "error": str(exc),
        }


def _check_docker_services(timeout: int) -> dict:
    """Check Docker Compose services status."""
    try:
        cmd = [
            "docker",
            "compose",
            "-f",
            "infrastructure/docker-compose.dev.yml",
            "ps",
            "--format",
            "json",
        ]
        completed = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if completed.returncode == 0:
            services = completed.stdout.strip().split("\n")
            healthy_count = sum(1 for svc in services if '"Status":"running"' in svc)
            return {
                "service": "docker_compose",
                "healthy": healthy_count > 0,
                "running_services": healthy_count,
            }
        return {
            "service": "docker_compose",
            "healthy": False,
            "returncode": completed.returncode,
        }
    except FileNotFoundError:
        return {
            "service": "docker_compose",
            "healthy": False,
            "error": "docker not installed",
        }
    except Exception as exc:  # pragma: no cover - subprocess safety
        return {
            "service": "docker_compose",
            "healthy": False,
            "error": str(exc),
        }


def cli() -> None:
    run()
