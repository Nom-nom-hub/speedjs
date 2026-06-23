import { highlightHtml } from '../lib/code-highlight'

export function CodeWindow({ title = 'example.tsx', code, children }: { title?: string; code?: string; children?: any }) {
  return (
    <div class="code-window">
      <div class="terminal-header">
        <span class="terminal-dot" /><span class="terminal-dot" /><span class="terminal-dot" />
        {title}
      </div>
      <div class="code-window-body">
        {code ? <pre><code innerHTML={highlightHtml(code)} /></pre> : null}
        {children}
      </div>
    </div>
  )
}

export function TerminalWindow({ title = 'terminal', children }: { title?: string; children: any }) {
  return (
    <div class="terminal">
      <div class="terminal-header">
        <span class="terminal-dot" /><span class="terminal-dot" /><span class="terminal-dot" />
        {title}
      </div>
      <div class="terminal-body">
        {children}
      </div>
    </div>
  )
}
