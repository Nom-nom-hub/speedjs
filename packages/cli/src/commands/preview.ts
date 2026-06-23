import { spawn } from 'child_process';

export async function preview(options: { port: string }): Promise<void> {
  console.log('Previewing production build...');

  const vite = spawn('vite', ['preview', '--port', options.port], {
    stdio: 'inherit',
    shell: true,
  });

  vite.on('error', (err) => {
    console.error('Failed to preview:', err);
    process.exit(1);
  });

  vite.on('exit', (code) => {
    process.exit(code || 0);
  });
}
