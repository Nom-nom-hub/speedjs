#!/usr/bin/env node
import { Command } from 'commander';
import { create } from './commands/create';
import { dev } from './commands/dev';
import { build } from './commands/build';
import { preview } from './commands/preview';
import { routes } from './commands/routes';
import { bench, benchSave, benchServe, benchUpdate } from './commands/bench';
import { doctor } from './commands/doctor';

const program = new Command();

program
  .name('speed')
  .description('Speed.js CLI - A compiler-first, full-stack TypeScript framework')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new Speed.js app')
  .argument('<name>', 'App name')
  .option('--template', 'Template to use')
  .action(create);

program
  .command('dev')
  .description('Start development server')
  .option('--port <port>', 'Port to run on', '3000')
  .action(dev);

program
  .command('build')
  .description('Build for production')
  .action(build);

program
  .command('preview')
  .description('Preview production build')
  .option('--port <port>', 'Port to run on', '4173')
  .action(preview);

program
  .command('routes')
  .description('List discovered routes')
  .action(routes);

const benchCmd = program
  .command('bench')
  .description('Run benchmarks and measure performance');

benchCmd
  .command('run')
  .description('Run standard benchmarks')
  .option('--save', 'Save results to .benchmarks/')
  .option('--json', 'Output JSON')
  .option('--compare', 'Compare with previous results')
  .option('--fail', 'Fail if performance budgets exceeded')
  .action(bench);

benchCmd
  .command('save')
  .description('Run benchmarks and save results')
  .action(benchSave);

benchCmd
  .command('serve')
  .description('Start local benchmark API server')
  .action(benchServe);

benchCmd
  .command('update')
  .description('Run benchmarks and update public benchmark data')
  .action(benchUpdate);

benchCmd
  .action((opts) => bench({ save: false, json: false, compare: false, fail: false, ...opts }));

program
  .command('doctor')
  .description('Check environment and configuration')
  .action(doctor);

program.parse();
