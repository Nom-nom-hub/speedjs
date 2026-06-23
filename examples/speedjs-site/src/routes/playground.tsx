import { signal, computed } from '@speedjs/core'
import { CodeWindow } from '../components/code-window'
import { GlowCard } from '../components/glow-card'
import { Badge } from '../components/badge'
import { Button } from '../components/button'

const examples: Record<string, { name: string; code: string; render: () => any }> = {
  counter: {
    name: 'Counter',
    code: `import { signal, computed } from "@speedjs/core"

export default function Counter() {
  const count = signal(0)
  const doubled = computed(() => count.value * 2)

  return (
    <button onClick={() => count.value++}>
      Count: {count} / Doubled: {doubled}
    </button>
  )
}`,
    render: () => {
      const count = signal(0)
      const doubled = computed(() => count.value * 2)
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--cyan)', fontVariantNumeric: 'tabular-nums' }}>{count}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>doubled: <span style={{ color: 'var(--violet)', fontFamily: 'var(--font-mono)' }}>{doubled}</span></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button class="btn btn-primary btn-sm" onClick={() => count.value++}>+1</button>
            <button class="btn btn-secondary btn-sm" onClick={() => count.value--}>-1</button>
            <button class="btn btn-secondary btn-sm" onClick={() => count.value = 0}>Reset</button>
          </div>
        </div>
      )
    }
  },
  todo: {
    name: 'Todo',
    code: `import { signal } from "@speedjs/core"

function TodoList({ items }) {
  return (
    <ul>
      {items.value.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default function Todo() {
  const items = signal([])
  const input = signal("")

  const addItem = () => {
    if (input.value.trim()) {
      items.value = [...items.value, input.value.trim()]
      input.value = ""
    }
  }

  return (
    <div>
      <input value={input}
        onInput={e => input.value = e.target.value} />
      <button onClick={addItem}>Add</button>
      <TodoList items={items} />
    </div>
  )
}`,
    render: () => {
      const items = signal<string[]>([])
      const input = signal('')
      const addItem = () => {
        if (input.value.trim()) {
          items.value = [...items.value, input.value.trim()]
          input.value = ''
        }
      }
      const removeItem = (idx: number) => {
        items.value = items.value.filter((_, i) => i !== idx)
      }
      const TodoList = ({ items: sig }: { items: typeof items }) => {
        return (
          <ul style={{ margin: 0, padding: 0 }}>
            {sig.value.map((item: string, i: number) => (
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                <span style={{ fontSize: '0.85rem' }}>{item}</span>
                <button class="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem' }} onClick={() => removeItem(i)}>X</button>
              </li>
            ))}
          </ul>
        )
      }
      return (
        <div style={{ maxWidth: 320, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={input} placeholder="Add a todo..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)', outline: 'none' }}
              onInput={(e: any) => input.value = (e.target as HTMLInputElement).value}
              onKeyDown={(e: any) => e.key === 'Enter' && addItem()} />
            <button class="btn btn-primary btn-sm" onClick={addItem}>Add</button>
          </div>
          <TodoList items={items} />
        </div>
      )
    }
  },
}

export default function Playground() {
  const active = signal('counter')
  const activeExample = computed(() => examples[active.value])

  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <div class="badge badge-amber">Preview</div>
          <h1>Playground</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, marginTop: 12 }}>
            Experiment with Speed.js signals and computed directly in the browser. No setup required.
          </p>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, ex]) => (
            <button
              class="btn btn-secondary btn-sm"
              style={active.value === key ? { borderColor: 'var(--cyan)', color: 'var(--cyan)' } : undefined}
              onClick={() => active.value = key}>
              {ex.name}
            </button>
          ))}
        </div>

        <div class="playground-layout">
          <CodeWindow title={activeExample.value?.name + '.tsx'} code={activeExample.value?.code ?? ''} />
          <GlowCard accent={false} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            {activeExample.value?.render()}
          </GlowCard>
        </div>

        <div class="callout callout-info" style={{ marginTop: 32, textAlign: 'center' }}>
          This is a preview playground. These examples use the same <code>signal()</code> and <code>computed()</code> primitives from <code>@speedjs/core</code> — no React, no VDOM, just fine-grained reactivity.
        </div>
      </section>
    </div>
  )
}
