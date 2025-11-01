"""
MOD SQUAD Framework - Utility Helpers
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

Utility helpers for MOD SQUAD extensions.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

try:
    import yaml
except (
    ModuleNotFoundError
) as exc:  # pragma: no cover - should not happen in production env
    raise RuntimeError(
        "PyYAML is required to load MOD SQUAD extension configuration."
    ) from exc


CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "extensions.yaml"


@dataclass
class ExtensionConfig:
    """Wrapper around the extensions configuration map."""

    raw: Dict[str, Any]

    @property
    def enabled_extensions(self) -> List[str]:
        return [
            name
            for name, cfg in self.raw.get("extensions", {}).items()
            if cfg.get("enabled", False)
        ]

    def get(self, name: str) -> Dict[str, Any]:
        return self.raw.get("extensions", {}).get(name, {})


def load_extension_config() -> ExtensionConfig:
    """Load the MOD SQUAD extension configuration YAML."""

    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Extension configuration not found at {CONFIG_PATH}")
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return ExtensionConfig(raw=data)


def dump_jsonl(path: Path, payload: Dict[str, Any]) -> None:
    """Append an object to a JSONL file, ensuring parent directories exist."""

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload, ensure_ascii=False) + os.linesep)
