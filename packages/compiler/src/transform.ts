import babel from '@babel/core';
import typescript from '@babel/preset-typescript';
import transformReactJSX from '@babel/plugin-transform-react-jsx';

export interface TransformOptions {
  sourceMap?: boolean;
  jsxRuntime?: 'automatic' | 'classic';
  jsxImportSource?: string;
}

export interface TransformResult {
  code: string;
  map?: string;
  diagnostics: Diagnostic[];
}

export interface Diagnostic {
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
}

export async function transformTSX(
  code: string,
  filename: string,
  options: TransformOptions = {}
): Promise<TransformResult> {
  const diagnostics: Diagnostic[] = [];

  try {
    const result = await babel.transformAsync(code, {
      filename,
      presets: [
        [
          typescript,
          {
            isTSX: true,
            allExtensions: true,
          },
        ],
      ],
      plugins: [
        [
          transformReactJSX,
          {
            runtime: options.jsxRuntime || 'automatic',
            importSource: options.jsxImportSource || '@speedjs/dom',
          },
        ],
      ],
      sourceMaps: options.sourceMap ?? true,
      configFile: false,
    });

    if (!result) {
      diagnostics.push({
        message: 'Failed to transform TSX',
        severity: 'error',
      });
      return { code: '', diagnostics };
    }

    return {
      code: result.code || '',
      map: result.map ? JSON.stringify(result.map) : undefined,
      diagnostics,
    };
  } catch (error) {
    diagnostics.push({
      message: error instanceof Error ? error.message : 'Unknown error',
      severity: 'error',
    });
    return { code: '', diagnostics };
  }
}

export function analyzeStaticRegions(code: string): {
  staticRegions: Array<{ start: number; end: number }>;
  dynamicRegions: Array<{ start: number; end: number }>;
} {
  // Placeholder for static/dynamic region analysis
  // In future, this would use Oxc/Rust for accurate analysis
  const staticRegions: Array<{ start: number; end: number }> = [];
  const dynamicRegions: Array<{ start: number; end: number }> = [];

  // Simple heuristic: anything with signal() or useState() is dynamic
  if (code.includes('signal(') || code.includes('useState(')) {
    dynamicRegions.push({ start: 0, end: code.length });
  } else {
    staticRegions.push({ start: 0, end: code.length });
  }

  return { staticRegions, dynamicRegions };
}
