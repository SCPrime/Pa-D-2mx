# MOD SQUAD Batches (Non‑interfering)

This folder contains non‑interfering, sequential batch scaffolding to run stability tasks without touching production workflows.

- run.ps1: orchestrator with dry‑run by default
- config.example.json: define batches and steps

Usage (Windows PowerShell):

```
cd scripts/mod-squad
./run.ps1 -ConfigPath ./config.example.json -DryRun $true
```

Notes:
- No code paths are modified by default; scripts call HTTP endpoints or no‑op placeholders.
- Use DryRun=$false only after validating locally.
