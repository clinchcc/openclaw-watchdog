$taskName = "OpenClawWatchdog"
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "Removed task: $taskName"
} else {
  Write-Host "Task not found: $taskName"
}
