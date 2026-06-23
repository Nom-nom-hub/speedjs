import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow } from '../../components/code-window'

export default function SignalsDocs(props: any) {
  return (
    <DocsLayout currentPath="/docs/signals">
      <div class="section-label">Docs / Signals</div>
      <h1>Signals</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Fine-grained reactivity is the heart of Speed.js. Signals are observable values that drive automatic DOM updates — no virtual DOM, no diffing.
      </p>

      <h2>Creating a signal</h2>
      <CodeWindow title="create">{`import { signal } from '@speedjs/core'

const count = signal(0)          // number
const name = signal('Speed')     // string
const items = signal<string[]>([]) // generic

count.value  // read
count.value = 1 // write`}</CodeWindow>

      <h2>Computed</h2>
      <CodeWindow title="computed">{`import { signal, computed } from '@speedjs/core'

const a = signal(1)
const b = signal(2)
const sum = computed(() => a.value + b.value)

sum.value // 3
a.value = 10
sum.value // 12 (auto-updated)`}</CodeWindow>

      <h2>Effect</h2>
      <CodeWindow title="effect">{`import { signal, effect } from '@speedjs/core'

const count = signal(0)

effect(() => {
  console.log('Count is: ' + count.value)
})
// Logs "Count is: 0"
count.value++
// Logs "Count is: 1"`}</CodeWindow>

      <h2>How it works</h2>
      <p>When a component renders JSX that reads <code>signal.value</code>, the DOM renderer registers a dependency. When that signal is written to, only the specific DOM nodes that depend on it are patched — the entire component does not re-render.</p>
      <p>This is the key difference from React, where <code>useState</code> re-renders the entire component and its children. Speed.js signals target specific DOM nodes, making updates O(1) instead of O(component tree).</p>

      <h2>Rules</h2>
      <ul>
        <li>Always read <code>signal.value</code> inside the component's return (JSX) to register reactive dependencies.</li>
        <li>Use <code>computed</code> for derived values. Avoid manually recomputing in effects.</li>
        <li>Signal writes are batched — multiple writes in the same tick trigger a single update.</li>
        <li>Use <code>untrack(fn)</code> to read signals without creating a dependency.</li>
      </ul>

      <h2>API reference</h2>
      <CodeWindow title="@speedjs/core exports">{`signal<T>(value: T): Signal<T>
computed<T>(fn: () => T): Computed<T>
effect(fn: () => void | (() => void)): DisposeFn
isSignal(val: unknown): val is Signal<unknown>
untrack<T>(fn: () => T): T`}</CodeWindow>
    </DocsLayout>
  )
}
