import { scanRoutes } from '@speedjs/compiler';
import { join } from 'path';

export async function routes(): Promise<void> {
  const routesDir = join(process.cwd(), 'src/routes');
  const appDir = join(process.cwd(), 'src');

  console.log('Scanning routes...');

  const { routes, errors } = scanRoutes({ routesDir, appDir });

  if (errors.length > 0) {
    console.error('Errors:');
    errors.forEach((err) => console.error(`  ${err}`));
  }

  if (routes.length === 0) {
    console.log('No routes found');
  } else {
    console.log(`\nFound ${routes.length} route${routes.length === 1 ? '' : 's'}:\n`);

    routes.forEach((route) => {
      console.log(`  ${route.path.padEnd(30)} -> ${route.file}`);
    });
  }
}
