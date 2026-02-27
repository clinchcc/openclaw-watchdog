#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { runLoop, runOnce } from '../core/monitor.js';
import { runInit } from './init.js';
import { logger } from '../utils/logger.js';
import { runDoctor } from '../doctor/index.js';
import { installService, uninstallService } from '../doctor/service.js';
import { runRollback } from '../core/rollback.js';

const program = new Command();
program.name('oc-watchdog').description('OpenClaw watchdog').version('0.1.0');

program
  .command('init')
  .description('Interactive setup and .env generation')
  .action(async () => {
    await runInit();
  });

program
  .command('check')
  .description('Run one health check + recovery pass')
  .action(async () => {
    const config = loadConfig();
    await runOnce(config, { failCount: 0 });
  });

program
  .command('run')
  .description('Run watchdog loop')
  .action(async () => {
    const config = loadConfig();
    await runLoop(config);
  });

program
  .command('doctor')
  .description('Show OS-specific deployment guidance')
  .action(() => {
    runDoctor();
  });

program
  .command('service-install')
  .description('Install persistent service for current OS')
  .action(async () => {
    const msg = await installService();
    console.log(msg);
  });

program
  .command('service-uninstall')
  .description('Uninstall persistent service for current OS')
  .action(async () => {
    const msg = await uninstallService();
    console.log(msg);
  });

program
  .command('rollback')
  .description('Run built-in cross-platform rollback flow')
  .option('--auto', 'auto mode, no prompt', false)
  .option('--backup <path>', 'specific backup file path')
  .option('--config-path <path>', 'openclaw.json path override')
  .option('--health-url <url>', 'health URL override', 'http://localhost:18789/health')
  .option('--restart-command <cmd>', 'restart command override', 'openclaw gateway restart')
  .action(async (opts) => {
    const result = await runRollback({
      auto: Boolean(opts.auto),
      backup: opts.backup || '',
      configPath: opts.configPath || '',
      healthUrl: opts.healthUrl,
      restartCommand: opts.restartCommand
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(2);
  });

program.parseAsync(process.argv).catch((e) => {
  logger.error({ err: e.message }, 'fatal');
  process.exit(1);
});
