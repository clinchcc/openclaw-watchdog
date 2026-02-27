#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { runLoop, runOnce } from '../core/monitor.js';
import { runInit } from './init.js';
import { logger } from '../utils/logger.js';

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

program.parseAsync(process.argv).catch((e) => {
  logger.error({ err: e.message }, 'fatal');
  process.exit(1);
});
