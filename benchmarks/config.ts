export interface ComparisonApp {
  name: string
  dir: string
  buildCmd: string
  installCmd: string
  framework: string
}

export const comparisonApps: ComparisonApp[] = [
  {
    name: 'speedjs-starter',
    dir: 'benchmarks/apps/speedjs-starter',
    buildCmd: 'npx vite build',
    installCmd: 'pnpm install',
    framework: 'speedjs',
  },
  // Future comparison apps — uncomment when running comparisons
  // {
  //   name: 'nextjs-starter',
  //   dir: 'benchmarks/apps/nextjs-starter',
  //   buildCmd: 'npx next build',
  //   installCmd: 'npm install',
  //   framework: 'nextjs',
  // },
  // {
  //   name: 'react-vite-starter',
  //   dir: 'benchmarks/apps/react-vite-starter',
  //   buildCmd: 'npx vite build',
  //   installCmd: 'npm install',
  //   framework: 'react',
  // },
]

export const comparisonConfig = {
  runs: 7,
  warmups: 2,
  reportedValue: 'median' as const,
  sameMachine: true,
  sameNodeVersion: true,
  productionBuildOnly: true,
  apps: ['speedjs-starter'] as string[],
}

export const comparisonMethodology = {
  notes: [
    'All apps run on the same machine',
    'Same Node.js version across all apps',
    'Production build only (no dev mode measurements)',
    'Same number of runs (7 total: 2 warmup + 5 measured)',
    'Median values reported',
    'Raw logs saved for each run',
    'App source code and lockfiles committed',
  ],
}
