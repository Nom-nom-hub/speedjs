import { spawn } from 'child_process';

export async function dev(options: { port: string }): Promise<void> {
  console.log('Starting development server...');

  const vite = spawn('vite', ['--port', options.port], {
    stdio: 'inherit',
    shell: true,
  });

  vite.on('error', (err) => {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  });

  vite.on('exit', (code) => {
    process.exit(code || 0);
  });
}
