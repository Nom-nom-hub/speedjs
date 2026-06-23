import { JSDOM } from 'jsdom';
import { mount } from '@speedjs/dom';

export interface RenderOptions {
  container?: HTMLElement;
}

export function render(component: () => any, options: RenderOptions = {}): { container: HTMLElement } {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const container = options.container || dom.window.document.body;

  mount(component, container);

  return { container };
}

export function cleanup(): void {
  // Cleanup any mounted components
}
