import fs from 'fs-extra';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function doctor(): Promise<void> {
  console.log('Speed.js Doctor\n');
  console.log('Checking environment...\n');

  let hasIssues = false;

  // Check Node version
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      console.log(`✓ Node.js ${version}`);
    } else {
      console.log(`✗ Node.js ${version} (requires 18+)`);
      hasIssues = true;
    }
  } catch {
    console.log('✗ Node.js not found');
    hasIssues = true;
  }

  // Check pnpm
  try {
    const { stdout } = await execAsync('pnpm --version');
    console.log(`✓ pnpm ${stdout.trim()}`);
  } catch {
    console.log('✗ pnpm not found');
    hasIssues = true;
  }

  // Check project structure
  console.log('\nChecking project structure...');

  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'src/app.tsx',
    'src/routes',
  ];

  for (const file of requiredFiles) {
    const exists = await fs.pathExists(join(process.cwd(), file));
    if (exists) {
      console.log(`✓ ${file}`);
    } else {
      console.log(`✗ ${file} not found`);
      hasIssues = true;
    }
  }

  // Check dependencies
  console.log('\nChecking dependencies...');

  try {
    const packageJson = await fs.readJson(join(process.cwd(), 'package.json'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const requiredDeps = ['@speedjs/core', '@speedjs/dom', '@speedjs/router', '@speedjs/server', '@speedjs/vite'];

    for (const dep of requiredDeps) {
      if (deps[dep]) {
        console.log(`✓ ${dep}`);
      } else {
        console.log(`✗ ${dep} not installed`);
        hasIssues = true;
      }
    }
  } catch {
    console.log('✗ Could not read package.json');
    hasIssues = true;
  }

  console.log('\n' + (hasIssues ? '⚠ Issues found' : '✓ Everything looks good'));
}
