import { describe, it, expect } from 'vitest';
import { renderToString } from '../render';

describe('renderToString', () => {
  it('should render simple element', () => {
    const html = renderToString(<div>Hello</div>);
    expect(html).toBe('<div>Hello</div>');
  });

  it('should render nested elements', () => {
    const html = renderToString(
      <div>
        <span>Text</span>
      </div>
    );
    expect(html).toBe('<div><span>Text</span></div>');
  });

  it('should render attributes', () => {
    const html = renderToString(<div id="test" className="active">Hello</div>);
    expect(html).toBe('<div id="test" class="active">Hello</div>');
  });

  it('should render styles', () => {
    const html = renderToString(<div style={{ color: 'red', fontSize: '14px' }}>Hello</div>);
    expect(html).toContain('color:red');
    expect(html).toContain('font-size:14px');
  });

  it('should escape HTML', () => {
    const html = renderToString(<div>{'<script>'}</div>);
    expect(html).toBe('<div>&lt;script&gt;</div>');
  });

  it('should render self-closing tags', () => {
    const html = renderToString(<img src="test.jpg" />);
    expect(html).toBe('<img src="test.jpg">');
  });

  it('should render fragments', () => {
    const Fragment = Symbol.for('speed.fragment');
    const html = renderToString(
      <div>
        <Fragment>
          <span>A</span>
          <span>B</span>
        </Fragment>
      </div>
    );
    expect(html).toBe('<div><span>A</span><span>B</span></div>');
  });

  it('should handle null and undefined', () => {
    const html = renderToString(<div>{null}{undefined}</div>);
    expect(html).toBe('<div></div>');
  });

  it('should handle booleans', () => {
    const html = renderToString(<div>{true}{false}</div>);
    expect(html).toBe('<div></div>');
  });

  it('should handle arrays', () => {
    const html = renderToString(
      <div>{[<span>A</span>, <span>B</span>, <span>C</span>]}</div>
    );
    expect(html).toBe('<div><span>A</span><span>B</span><span>C</span></div>');
  });
});
