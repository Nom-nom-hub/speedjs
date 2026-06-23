import { signal, effect } from '@speedjs/core'

export function CommandCenter() {
  const step = signal(0)
  const commands = [
    { line: '<span class="highlight">$</span> <span class="value">npm create speedjs@latest my-app</span>', delay: 300 },
    { line: '<span class="highlight">></span> <span class="value">Creating project...</span>', delay: 400 },
    { line: '<span class="highlight">\u2713</span> <span class="value">Project created in 1.2s</span>', delay: 300 },
    { line: '&nbsp;', delay: 200 },
    { line: '<span class="highlight">$</span> <span class="value">cd my-app && npm run dev</span>', delay: 300 },
    { line: '<span class="highlight">></span> <span class="value">Vite dev server ready</span>', delay: 400 },
    { line: '<span class="value">  Local: http://localhost:5173</span>', delay: 300 },
  ]

  const benchStep = signal(0)
  const benchLines = [
    { line: '<span class="label">Initial JS</span>    <span class="value">82.8kb</span>  <span class="fail">\u2717</span>', delay: 200 },
    { line: '<span class="label">Build</span>         <span class="value">990ms</span>   <span class="pass">\u2713</span>', delay: 200 },
    { line: '<span class="label">Route render</span>  <span class="value">0ms</span>     <span class="pass">\u2713</span>', delay: 200 },
    { line: '<span class="label">Hydration</span>     <span class="value">0ms</span>     <span class="pass">\u2713</span>', delay: 200 },
    { line: '<span class="label">Budget</span>        <span class="value">Failed</span>    <span class="fail">\u2717</span>', delay: 300 },
  ]

  effect(() => {
    let totalDelay = 2000
    for (const b of benchLines) {
      const t = totalDelay
      setTimeout(() => { if (benchStep.value < 20) benchStep.value += 1 }, t)
      totalDelay += b.delay
    }
  })

  effect(() => {
    let totalDelay = 2000
    for (const b of benchLines) {
      const t = totalDelay
      setTimeout(() => { if (benchStep.value < 20) benchStep.value += 1 }, t)
      totalDelay += b.delay
    }
  })

  return (
    <div class="command-center" style={{ marginTop: 32 }}>
      <div class="command-center-panel">
        <div class="command-center-label">Setup</div>
        {commands.slice(0, Math.min(step.value + 1, commands.length)).map((c, i) => (
          <div class="command-center-line" style={{ animation: 'fadeIn 0.15s ease forwards' }} innerHTML={c.line} />
        ))}
        {step.value >= commands.length ? <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', animation: 'type-cursor 1s step-end infinite' }}>|</span> : null}
      </div>
      <div class="command-center-panel">
        <div class="command-center-label">Benchmarks</div>
        {benchLines.slice(0, Math.min(benchStep.value + 1, benchLines.length)).map((b, i) => (
          <div class="command-center-line" style={{ animation: 'fadeIn 0.15s ease forwards' }} innerHTML={b.line} />
        ))}
        {benchStep.value >= benchLines.length ? (
          <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
            Budget failed — 82.8kb exceeds 40kb limit
          </div>
        ) : <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', animation: 'type-cursor 1s step-end infinite' }}>|</span>}
      </div>
    </div>
  )
}
