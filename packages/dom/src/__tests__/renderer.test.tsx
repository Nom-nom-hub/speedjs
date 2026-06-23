import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { mount } from '../renderer';
import { signal } from '@speedjs/core';

describe('DOM Renderer', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;
  });

  it('should mount simple component', () => {
    const root = document.createElement('div');
    mount(() => <div>Hello World</div>, root);
    expect(root.innerHTML).toBe('<div>Hello World</div>');
  });

  it('should handle signal-based text binding', () => {
    const root = document.createElement('div');
    const count = signal(0);
    mount(() => <div>Count: {count}</div>, root);
    expect(root.innerHTML).toBe('<div>Count: 0</div>');
    count.value = 1;
    expect(root.innerHTML).toBe('<div>Count: 1</div>');
  });

  it('should only update changed text node', () => {
    const root = document.createElement('div');
    const count = signal(0);
    mount(() => (
      <div>
        <span>Static</span>
        <span>Count: {count}</span>
        <span>End</span>
      </div>
    ), root);

    const firstSpan = root.querySelector('span:first-child');
    const lastSpan = root.querySelector('span:last-child');

    count.value = 1;

    // Static nodes should remain unchanged
    expect(firstSpan?.textContent).toBe('Static');
    expect(lastSpan?.textContent).toBe('End');
    // Only the signal-bound text should update
    expect(root.innerHTML).toContain('Count: 1');
  });

  it('should handle event handlers', () => {
    const root = document.createElement('div');
    const handleClick = vi.fn();
    mount(() => <button onClick={handleClick}>Click me</button>, root);

    const button = root.querySelector('button');
    button?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle conditional rendering with signals', () => {
    const root = document.createElement('div');
    const show = signal(true);
    mount(() => (show.value ? <div>Visible</div> : <div>Hidden</div>), root);

    expect(root.innerHTML).toBe('<div>Visible</div>');
    show.value = false;
    expect(root.innerHTML).toBe('<div>Hidden</div>');
  });

  it('should handle attribute binding with signals', () => {
    const root = document.createElement('div');
    const disabled = signal(false);
    mount(() => <button disabled={disabled}>Button</button>, root);

    const button = root.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(false);

    disabled.value = true;
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  it('should handle class binding', () => {
    const root = document.createElement('div');
    mount(() => <div className="active">Test</div>, root);
    expect(root.querySelector('div')?.className).toBe('active');
  });

  it('should handle style binding', () => {
    const root = document.createElement('div');
    mount(() => <div style={{ color: 'red', fontSize: '14px' }}>Test</div>, root);

    const div = root.querySelector('div');
    expect(div?.style.color).toBe('red');
    expect(div?.style.fontSize).toBe('14px');
  });

  it('should handle list rendering', () => {
    const root = document.createElement('div');
    const items = signal([1, 2, 3]);
    mount(() => (
      <ul>
        {items.value.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ), root);

    expect(root.querySelectorAll('li').length).toBe(3);
  });

  it('should handle fragments', () => {
    const root = document.createElement('div');
    const Fragment = Symbol.for('speed.fragment');
    mount(() => (
      <div>
        <Fragment>
          <span>A</span>
          <span>B</span>
        </Fragment>
      </div>
    ), root);

    expect(root.querySelectorAll('span').length).toBe(2);
  });

  it('should handle nested components', () => {
    const root = document.createElement('div');

    function Inner() {
      return <span>Inner</span>;
    }

    function Outer() {
      return (
        <div>
          <Inner />
        </div>
      );
    }

    mount(Outer, root);
    expect(root.innerHTML).toBe('<div><span>Inner</span></div>');
  });

  it('should not rerender entire component on signal change', () => {
    const root = document.createElement('div');
    const count = signal(0);
    let renderCount = 0;

    function Counter() {
      renderCount++;
      return (
        <div>
          <span>Rendered: {renderCount}</span>
          <span>Count: {count}</span>
        </div>
      );
    }

    mount(Counter, root);
    expect(renderCount).toBe(1);

    count.value = 1;
    // Component should not re-render, only the signal binding should update
    expect(renderCount).toBe(1);
    expect(root.innerHTML).toContain('Count: 1');
  });
});
