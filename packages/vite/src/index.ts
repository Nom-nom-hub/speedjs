import { Plugin } from 'vite';
import { scanRoutes, generateRouteManifest, transformTSX } from '@speedjs/compiler';
import { join } from 'path';

export interface SpeedOptions {
  routesDir?: string;
  appDir?: string;
}

export function speed(options: SpeedOptions = {}): Plugin {
  const { routesDir = './src/routes', appDir = './src' } = options;
  let routesManifest: string = '';

  return {
    name: '@speedjs/vite',
    enforce: 'pre',

    config(config) {
      // Configure JSX
      return {
        esbuild: {
          jsx: 'automatic',
          jsxImportSource: '@speedjs/dom',
        },
      };
    },

    async configResolved(config) {
      // Scan routes and generate manifest
      const routesPath = join(config.root, routesDir);
      const appPath = join(config.root, appDir);
      const { routes, errors } = scanRoutes({ routesDir: routesPath, appDir: appPath });

      if (errors.length > 0) {
        console.warn('Route scanning errors:', errors);
      }

      console.log(`Found ${routes.length} routes`);
      routesManifest = generateRouteManifest(routes);
    },

    resolveId(id) {
      // Handle virtual module for routes
      if (id === 'virtual:speed/routes') {
        return '\0virtual:speed/routes';
      }
    },

    load(id) {
      // Provide virtual module content
      if (id === '\0virtual:speed/routes') {
        return routesManifest;
      }
    },

    async transform(code, id) {
      // Transform TSX files
      if (/\.(tsx|jsx)$/.test(id) && !id.includes('node_modules')) {
        const result = await transformTSX(code, id);
        if (result.diagnostics.length > 0) {
          result.diagnostics.forEach((diag) => {
            this.warn(diag.message);
          });
        }
        return {
          code: result.code,
          map: result.map,
        };
      }
    },

    handleHotUpdate({ file, server }) {
      // Reload routes when route files change
      if (file.includes(routesDir)) {
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: 'full-reload' });
      }
    },
  };
}
