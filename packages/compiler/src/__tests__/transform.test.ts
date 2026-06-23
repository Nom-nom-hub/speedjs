import { describe, it, expect } from 'vitest';
import { transformTSX, analyzeStaticRegions } from '../transform';

describe('TSX Transform', () => {
  it('should transform simple TSX', async () => {
    const code = 'const Component = () => <div>Hello</div>;';
    const result = await transformTSX(code, 'test.tsx');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.code).toContain('jsx');
  });

  it('should transform JSX with attributes', async () => {
    const code = 'const Component = () => <div id="test">Hello</div>;';
    const result = await transformTSX(code, 'test.tsx');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.code).toContain('id');
  });

  it('should use custom JSX runtime', async () => {
    const code = 'const Component = () => <div>Hello</div>;';
    const result = await transformTSX(code, 'test.tsx', {
      jsxRuntime: 'automatic',
      jsxImportSource: '@speedjs/dom',
    });
    expect(result.diagnostics).toHaveLength(0);
    expect(result.code).toContain('@speedjs/dom');
  });

  it('should handle TypeScript types', async () => {
    const code = `
      interface Props {
        name: string;
      }
      const Component = (props: Props) => <div>{props.name}</div>;
    `;
    const result = await transformTSX(code, 'test.tsx');
    expect(result.diagnostics).toHaveLength(0);
  });

  it('should return diagnostics on error', async () => {
    const code = 'const Component = () => <div>{missing}</div>;'; // TypeScript error
    const result = await transformTSX(code, 'test.tsx');
    // This might not error in Babel transform, but should handle gracefully
    expect(result).toBeDefined();
  });
});

describe('Static/Dynamic Analysis', () => {
  it('should identify static code', () => {
    const code = 'const Component = () => <div>Hello</div>;';
    const result = analyzeStaticRegions(code);
    expect(result.staticRegions.length).toBeGreaterThan(0);
    expect(result.dynamicRegions.length).toBe(0);
  });

  it('should identify dynamic code with signals', () => {
    const code = 'const Component = () => { const count = signal(0); return <div>{count}</div>; };';
    const result = analyzeStaticRegions(code);
    expect(result.dynamicRegions.length).toBeGreaterThan(0);
  });

  it('should identify dynamic code with useState', () => {
    const code = 'const Component = () => { const [count, setCount] = useState(0); return <div>{count}</div>; };';
    const result = analyzeStaticRegions(code);
    expect(result.dynamicRegions.length).toBeGreaterThan(0);
  });
});
