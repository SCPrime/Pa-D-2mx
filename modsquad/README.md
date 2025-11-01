# MOD SQUAD Framework

## ⚠️ PROPRIETARY AND CONFIDENTIAL

**Copyright © 2025 Dr. SC Prime - MOD SQUAD Framework. All Rights Reserved.**

This framework contains proprietary and confidential information. Unauthorized copying, modification, or distribution is strictly prohibited and will be prosecuted to the fullest extent of the law.

🚨 **THIS CODE IS MONITORED:** We employ advanced fingerprinting and tracking systems to detect unauthorized use. Violators WILL be found.

For licensing inquiries: contact@paiid.com

---

This directory houses the development-time orchestration stack used to run non-interfering batches, maintenance cycles, and model routing for PaiiD.

## Layout

- `config/` — YAML configuration consumed by runners/workflows.
  - `modsquad.yaml` — core settings (models, budgets, quality gates, analytics).
  - `maintenance_schedule.yaml` — cadence for 3× daily autonomous maintenance.
  - `model_routing.yaml` — maps tasks/workflows to default model selections.
  - `quality_gates.yaml` — defines repo-wide gates enforced before merges/deploys.
  - `extensions.yaml` — settings for the notifier, metrics streamer, secrets watchdog, and strategy verifier.
- `extensions/` — Python helpers used by extension jobs (notifier, metrics streamer, secrets watchdog, strategy verifier).
- `scripts/modsquad/after-maintenance.ps1|.sh` — invoke the extension suite after each maintenance window.
- `workflows/` (future) — curated task blueprints (feature, bugfix, refactor, etc.).

## Usage

1. Update configs as requirements change.
2. The GitHub Action `.github/workflows/mod-squad.yml` loads these defaults.
3. After each maintenance batch, run `scripts/modsquad/after-maintenance.{ps1|sh}` to trigger extensions sequentially.

The configs created here reflect the "MOD SQUAD ORCHESTRA" plan — multiple agents (DeepSeek, Codex, Claude) coordinated by the conductor with guardrails, maintenance, extensions, and quality gates.
