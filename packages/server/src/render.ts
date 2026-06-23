import { JSXElement } from '@speedjs/dom';

export function renderToString(node: JSXElement): string {
  return renderNode(node);
}

function renderNode(value: JSXElement): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return escapeHtml(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(renderNode).join('');
  }

  if (typeof value === 'object' && 'value' in value) {
    // Signal - render initial value
    return renderNode((value as any).value);
  }

  if (typeof value === 'object' && 'type' in value && 'props' in value) {
    return renderElement(value);
  }

  return '';
}

function renderElement(node: any): string {
  const { type, props } = node;

  if (type === Symbol.for('speed.fragment')) {
    const children = props.children;
    if (children === undefined || children === null) return '';
    const childArray = Array.isArray(children) ? children : [children];
    return childArray.map(renderNode).join('');
  }

  if (typeof type === 'function') {
    const result = type(props);
    return renderNode(result);
  }

  // HTML element
  let html = `<${type}`;

  // Attributes
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || key === 'key') continue;
    if (key.startsWith('on') && key.length > 2) continue; // Skip event handlers
    if (key === 'ref') continue; // Skip refs
    if (key === 'className') {
      if (value) html += ` class="${escapeHtml(String(value))}"`;
    } else if (key === 'style' && value !== null && typeof value === 'object') {
      const styles = Object.entries(value)
        .map(([k, v]) => `${camelToKebab(k)}:${v}`)
        .join(';');
      html += ` style="${styles}"`;
    } else if (typeof value === 'boolean') {
      if (value) html += ` ${key}`;
    } else if (value !== null && value !== undefined) {
      html += ` ${key}="${escapeHtml(String(value))}"`;
    }
  }

  html += '>';

  // Children
  const children = props.children;
  if (children !== undefined && children !== null) {
    const childArray = Array.isArray(children) ? children : [children];
    html += childArray.map(renderNode).join('');
  }

  // Self-closing tags
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  if (!voidElements.has(type as string)) {
    html += `</${type}>`;
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function renderToStream(node: JSXElement): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const html = renderToString(node);
      controller.enqueue(encoder.encode(html));
      controller.close();
    },
  });
}
