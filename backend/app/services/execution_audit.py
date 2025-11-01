"""Execution audit logging helpers."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


AUDIT_DIR = Path("data/executions")
AUDIT_DIR.mkdir(parents=True, exist_ok=True)
AUDIT_FILE = AUDIT_DIR / "history.jsonl"


def append_execution_audit(record: dict[str, Any]) -> None:
    """Append an execution record to the audit log."""

    entry = {
        "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        **record,
    }
    with AUDIT_FILE.open("a", encoding="utf-8") as handle:
        json.dump(entry, handle)
        handle.write("\n")


__all__ = ["AUDIT_FILE", "append_execution_audit"]
