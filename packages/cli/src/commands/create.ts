import fs from 'fs-extra';
import path from 'path';

export async function create(name: string, options: { template?: string }): Promise<void> {
  console.log(`Creating Speed.js app: ${name}`);

  const targetDir = path.resolve(process.cwd(), name);

  if (await fs.pathExists(targetDir)) {
    console.error(`Directory ${name} already exists`);
    process.exit(1);
  }

  await fs.ensureDir(targetDir);

  // Create package.json
  const packageJson = {
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
    },
    dependencies: {
      '@speedjs/core': 'latest',
      '@speedjs/dom': 'latest',
      '@speedjs/router': 'latest',
      '@speedjs/server': 'latest',
      '@speedjs/vite': 'latest',
    },
    devDependencies: {
      vite: '^5.1.0',
      typescript: '^5.4.0',
      vitest: '^1.4.0',
    },
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });

  // Create directory structure
  await fs.ensureDir(path.join(targetDir, 'src'));
  await fs.ensureDir(path.join(targetDir, 'src/routes'));

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.tsx"></script>
</body>
</html>`;

  await fs.writeFile(path.join(targetDir, 'index.html'), indexHtml);

  // Create app.tsx
  const appTsx = `import { mount } from '@speedjs/dom';
import { navigate } from '@speedjs/router';

mount(() => {
  return (
    <div>
      <h1>Welcome to Speed.js</h1>
      <p>Edit src/routes/index.tsx to get started</p>
    </div>
  );
}, document.getElementById('app')!);`;

  await fs.writeFile(path.join(targetDir, 'src/app.tsx'), appTsx);

  // Create index route
  const indexRoute = `export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>This is the home page</p>
    </div>
  );
}`;

  await fs.writeFile(path.join(targetDir, 'src/routes/index.tsx'), indexRoute);

  // Create vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import { speed } from '@speedjs/vite';

export default defineConfig({
  plugins: [speed()],
});`;

  await fs.writeFile(path.join(targetDir, 'vite.config.ts'), viteConfig);

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      jsxImportSource: '@speedjs/dom',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  };

  await fs.writeJson(path.join(targetDir, 'tsconfig.json'), tsconfig, { spaces: 2 });

  console.log(`\n✓ Created ${name}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${name}`);
  console.log(`  pnpm install`);
  console.log(`  pnpm dev`);
}
