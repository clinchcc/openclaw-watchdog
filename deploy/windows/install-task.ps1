param(
  [string]$ProjectDir = "$env:USERPROFILE\openclaw-watchdog"
)

if (-not $PSVersionTable) {
  Write-Error "PowerShell runtime is not available. Please install PowerShell and retry."
  exit 1
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Error "Node.js is not found in PATH. Install Node.js first: https://nodejs.org/"
  exit 1
}

$nodePath = $nodeCmd.Source
if (-not (Test-Path $ProjectDir)) {
  Write-Error "ProjectDir not found: $ProjectDir"
  exit 1
}

$taskName = "OpenClawWatchdog"
# Use powershell -WindowStyle Hidden for older PowerShell compatibility
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"cd '$ProjectDir'; & '$nodePath' src/cli/index.js run`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "OpenClaw watchdog runner" -Force

# Start once immediately so users can verify notifications without re-login
Start-ScheduledTask -TaskName $taskName
Write-Host "Scheduled Task created and started: $taskName"
