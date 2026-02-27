import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execaCommand } from 'execa';

function projectDir() {
  return process.cwd();
}

export async function installService() {
  const p = os.platform();
  const cwd = projectDir();

  if (p === 'darwin') {
    const src = path.join(cwd, 'deploy/macos/com.openclaw.watchdog.plist.example');
    const dst = path.join(os.homedir(), 'Library/LaunchAgents/com.openclaw.watchdog.plist');
    let content = fs.readFileSync(src, 'utf-8').replace('cd $HOME/openclaw-watchdog && npm start', `cd ${cwd} && npm start`);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, 'utf-8');
    await execaCommand(`launchctl unload ${dst}`, { shell: true }).catch(() => {});
    await execaCommand(`launchctl load -w ${dst}`, { shell: true });
    await execaCommand('launchctl start com.openclaw.watchdog', { shell: true }).catch(() => {});
    return `Installed launchd service: ${dst}`;
  }

  if (p === 'linux') {
    const src = path.join(cwd, 'deploy/linux/openclaw-watchdog.service.example');
    const dst = path.join(os.homedir(), '.config/systemd/user/openclaw-watchdog.service');
    let content = fs.readFileSync(src, 'utf-8').replace('WorkingDirectory=%h/openclaw-watchdog', `WorkingDirectory=${cwd}`);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, content, 'utf-8');
    await execaCommand('systemctl --user daemon-reload', { shell: true });
    await execaCommand('systemctl --user enable --now openclaw-watchdog', { shell: true });
    return `Installed systemd user service: ${dst}`;
  }

  if (p === 'win32') {
    const script = path.join(cwd, 'deploy/windows/install-task.ps1');
    await execaCommand(`powershell -ExecutionPolicy Bypass -File "${script}" -ProjectDir "${cwd}"`, { shell: true });
    return 'Installed Windows Scheduled Task: OpenClawWatchdog';
  }

  return 'Unsupported OS for automatic install.';
}

export async function uninstallService() {
  const p = os.platform();
  const cwd = projectDir();

  if (p === 'darwin') {
    const dst = path.join(os.homedir(), 'Library/LaunchAgents/com.openclaw.watchdog.plist');
    await execaCommand(`launchctl unload ${dst}`, { shell: true }).catch(() => {});
    fs.existsSync(dst) && fs.unlinkSync(dst);
    return `Removed launchd service: ${dst}`;
  }

  if (p === 'linux') {
    const dst = path.join(os.homedir(), '.config/systemd/user/openclaw-watchdog.service');
    await execaCommand('systemctl --user disable --now openclaw-watchdog', { shell: true }).catch(() => {});
    fs.existsSync(dst) && fs.unlinkSync(dst);
    await execaCommand('systemctl --user daemon-reload', { shell: true }).catch(() => {});
    return `Removed systemd user service: ${dst}`;
  }

  if (p === 'win32') {
    const script = path.join(cwd, 'deploy/windows/uninstall-task.ps1');
    await execaCommand(`powershell -ExecutionPolicy Bypass -File "${script}"`, { shell: true });
    return 'Removed Windows Scheduled Task: OpenClawWatchdog';
  }

  return 'Unsupported OS for automatic uninstall.';
}
