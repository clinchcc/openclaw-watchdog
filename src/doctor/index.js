import os from 'node:os';

export function runDoctor() {
  const p = os.platform();
  console.log('OpenClaw Watchdog Doctor');
  console.log('Platform:', p);

  if (p === 'darwin') {
    console.log('\nUse launchd template: deploy/macos/com.openclaw.watchdog.plist.example');
  } else if (p === 'linux') {
    console.log('\nUse systemd template: deploy/linux/openclaw-watchdog.service.example');
  } else if (p === 'win32') {
    console.log('\nUse Task Scheduler script: deploy/windows/install-task.ps1');
  } else {
    console.log('\nUnsupported platform. Run with a process manager (PM2/Docker).');
  }

  console.log('\nChecklist:');
  console.log('1) npm run init');
  console.log('2) npm run check');
  console.log('3) enable OS service');
}
