from __future__ import annotations

import json
from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def _utc_now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


@dataclass
class JSONLLogger:
    """Append-only JSONL writer for runs, positions, and rationale logs.

    This is a lightweight utility; rotation and compression can be layered later.
    """

    file_path: Path
    auto_mkdir: bool = True
    _fp: Any | None = field(default=None, init=False, repr=False)

    def _ensure_open(self) -> None:
        if self._fp is not None:
            return
        if self.auto_mkdir:
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
        # Use append with UTF-8 and line buffering
        self._fp = open(self.file_path, "a", encoding="utf-8", buffering=1)

    def append(self, record: dict[str, Any]) -> None:
        """Append a single JSON object as a line with an ISO timestamp if missing."""
        self._ensure_open()
        if "timestamp" not in record:
            record["timestamp"] = _utc_now_iso()
        self._fp.write(json.dumps(record, separators=(",", ":")) + "\n")

    def extend(self, records: Iterable[dict[str, Any]]) -> None:
        for rec in records:
            self.append(rec)

    def flush(self) -> None:
        if self._fp is not None:
            self._fp.flush()

    def close(self) -> None:
        if self._fp is not None:
            try:
                self._fp.flush()
            finally:
                self._fp.close()
                self._fp = None


# Convenience factory for standard paths under backend/data
def make_run_logger(run_id: str, kind: str = "log") -> JSONLLogger:
    base = Path(__file__).resolve().parents[2] / "data" / "agent_data" / run_id
    if kind == "position":
        path = base / "position.jsonl"
    else:
        # default: generic log.jsonl
        path = base / "log.jsonl"
    return JSONLLogger(path)


