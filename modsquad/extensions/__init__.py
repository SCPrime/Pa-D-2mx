"""
MOD SQUAD Framework - Extension Suite
Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
Unauthorized copying, modification, or distribution is strictly prohibited.
🚨 THIS CODE IS MONITORED: Violators WILL be found.

MOD SQUAD extension suite - Universal preloaded extensions for all projects.
"""

# Core extensions (pre-existing)
# Validation extensions
# Infrastructure & health
# Scheduling & orchestration
# Reporting & analysis
# Testing & simulation
# Coordination
# Concealment extensions (PaiiD-2mx specific)
from . import (
    browser_validator,
    concealment_reporter,
    concealment_validator,
    contract_enforcer,
    copyright_scanner,
    dependency_tracker,
    infra_health,
    integration_validator,
    maintenance_notifier,
    metrics_streamer,
    runner,
    secrets_watchdog,
    strategy_verifier,
    stream_coordinator,
    utils,
    visibility_lockdown,
)
from .utils import ExtensionConfig, load_extension_config

__all__ = [
    # Utilities
    "ExtensionConfig",
    "load_extension_config",
    # Core extensions
    "maintenance_notifier",
    "metrics_streamer",
    "secrets_watchdog",
    "strategy_verifier",
    # Validation extensions
    "browser_validator",
    "contract_enforcer",
    "integration_validator",
    # Infrastructure & health
    "infra_health",
    "dependency_tracker",
    # Coordination
    "stream_coordinator",
    # Concealment extensions (PaiiD-2mx specific)
    "concealment_validator",
    "copyright_scanner",
    "visibility_lockdown",
    "concealment_reporter",
    # Runner and utils
    "runner",
    "utils",
]
