# Compiler

The Speed.js compiler transforms TSX to optimized JavaScript and analyzes your code for performance optimizations.

## How it Works

The compiler pipeline:

1. **Parse** - Read TSX files and parse AST
2. **Transform** - Convert JSX to function calls
3. **Analyze** - Identify static and dynamic regions
4. **Optimize** - Apply optimizations based on analysis
5. **Generate** - Output optimized JavaScript

## TSX Transformation

The compiler converts JSX to function calls:

```tsx
// Input
const element = <div>Hello</div>;

// Output
import { jsx } from '@speedjs/dom';
const element = jsx('div', { children: 'Hello' });
```

## Static Analysis

The compiler identifies static and dynamic regions:

```tsx
// Static - can be optimized to HTML string
const Static = () => <div>Hello World</div>;

// Dynamic - requires runtime
const Dynamic = () => {
  const count = signal(0);
  return <div>Count: {count}</div>;
};
```

## Source Maps

The compiler generates source maps for debugging:

```typescript
import { transformTSX } from '@speedjs/compiler';

const result = await transformTSX(code, filename, {
  sourceMap: true,
});

console.log(result.map); // Source map
```

## Diagnostics

The compiler provides diagnostics for errors and warnings:

```typescript
const result = await transformTSX(code, filename);

result.diagnostics.forEach((diag) => {
  console.log(`${diag.severity}: ${diag.message}`);
});
```

## Custom JSX Runtime

Configure a custom JSX runtime:

```typescript
const result = await transformTSX(code, filename, {
  jsxRuntime: 'automatic',
  jsxImportSource: '@speedjs/dom',
});
```

## Route Metadata Extraction

The compiler extracts route metadata:

```typescript
import { scanRoutes } from '@speedjs/compiler';

const { routes, errors } = scanRoutes({
  routesDir: './src/routes',
  appDir: './src',
});

console.log(routes);
// [
//   { id: 'index', path: '/', file: 'src/routes/index.tsx' },
//   { id: 'about', path: '/about', file: 'src/routes/about.tsx' }
// ]
```

## Future Optimizations

The compiler is designed for future optimization phases:

- **Oxc Integration** - Replace Babel with Oxc/Rust for faster compilation
- **Tree Shaking** - Remove unused code automatically
- **Code Splitting** - Automatic route-based splitting
- **Dead Code Elimination** - Remove unreachable code
- **Inline Helpers** - Inline small functions for performance

## Best Practices

- Write type-safe TypeScript
- Use signals for reactive state
- Keep components simple
- Avoid complex logic in JSX
- Use static regions where possible
- Enable source maps for debugging

## Compiler API

```typescript
import { transformTSX, analyzeStaticRegions } from '@speedjs/compiler';

// Transform TSX
const result = await transformTSX(code, filename);

// Analyze regions
const analysis = analyzeStaticRegions(code);
console.log(analysis.staticRegions);
console.log(analysis.dynamicRegions);
```
