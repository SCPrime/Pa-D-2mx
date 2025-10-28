Param(
  [string]$ConfigPath = "./config.example.json",
  [switch]$DryRun
)

Write-Host "[MOD SQUAD] Starting batches" -ForegroundColor Cyan
if (-not (Test-Path $ConfigPath)) {
  Write-Error "Config not found: $ConfigPath"
  exit 1
}

$json = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$batches = $json.batches
if (-not $batches) { Write-Warning "No batches defined."; exit 0 }

foreach ($batch in $batches) {
  Write-Host ("`n== Batch: {0} ==" -f $batch.name) -ForegroundColor Yellow
  foreach ($step in $batch.steps) {
    $name = $step.name
    $type = $step.type
    Write-Host ("-- Step: {0} [{1}]" -f $name, $type)

    if ($DryRun) {
      Write-Host "   (dry-run)" -ForegroundColor DarkGray
      continue
    }

    switch ($type) {
      'http' {
        $method = $step.method
        $url = $step.url
        try {
          $resp = Invoke-WebRequest -Uri $url -Method $method -TimeoutSec 15 -UseBasicParsing
          Write-Host ("   [{0}] {1}" -f $resp.StatusCode, $url) -ForegroundColor Green
        } catch {
          Write-Warning ("   HTTP failed: {0}" -f $_.Exception.Message)
        }
      }
      default {
        Write-Host "   noop" -ForegroundColor DarkGray
      }
    }
  }
}

Write-Host "`n[MOD SQUAD] Done." -ForegroundColor Cyan


