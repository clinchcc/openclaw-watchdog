param(
  [string]$ProjectDir = "$env:USERPROFILE\openclaw-watchdog"
)

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command \"cd '$ProjectDir'; npm start\""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName "OpenClawWatchdog" -Action $action -Trigger $trigger -Settings $settings -Description "OpenClaw watchdog runner" -Force
Write-Host "Scheduled Task created: OpenClawWatchdog"
