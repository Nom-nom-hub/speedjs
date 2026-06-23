export function ComparisonTable() {
  const rows = [
    { feature: 'Fine-grained updates', speed: '\u2713', next: '\u2717', astro: '\u2717', solid: '\u2713', svelte: '\u2713' },
    { feature: 'SSR', speed: 'Built-in', next: 'Built-in', astro: 'Built-in', solid: 'Built-in', svelte: 'Built-in' },
    { feature: 'API routes', speed: 'Built-in', next: 'Built-in', astro: 'Built-in', solid: 'Built-in', svelte: 'Built-in' },
    { feature: 'File-based routing', speed: 'Built-in', next: 'Built-in', astro: 'Built-in', solid: 'Available', svelte: 'Built-in' },
    { feature: 'Partial hydration', speed: 'Built-in', next: '\u2717', astro: 'Built-in', solid: 'Available', svelte: 'Available' },
    { feature: 'Perf. budgets (built-in)', speed: 'Built-in', next: '\u2717', astro: '\u2717', solid: '\u2717', svelte: '\u2717' },
    { feature: 'Benchmark command', speed: 'Built-in', next: '\u2717', astro: '\u2717', solid: '\u2717', svelte: '\u2717' },
    { feature: 'Compiler-first', speed: 'Built-in', next: '\u2717', astro: 'Partial', solid: '\u2717', svelte: 'Partial' },
    { feature: 'React dependency', speed: 'None', next: 'Required', astro: 'None', solid: 'None', svelte: 'None' },
    { feature: 'Full-stack support', speed: 'Built-in', next: 'Built-in', astro: 'Partial', solid: 'Partial', svelte: 'Built-in' },
  ]

  return (
    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th class="highlight-col">Speed.js</th>
            <th>Next.js</th>
            <th>Astro</th>
            <th>SolidStart</th>
            <th>SvelteKit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr>
              <td>{r.feature}</td>
              <td class="highlight-col"><span class="check">{r.speed}</span></td>
              <td><span class={r.next === '\u2717' ? 'cross' : r.next === 'Available' ? 'partial' : 'check'}>{r.next}</span></td>
              <td><span class={r.astro === '\u2717' ? 'cross' : r.astro === 'Available' ? 'partial' : 'check'}>{r.astro}</span></td>
              <td><span class={r.solid === '\u2717' ? 'cross' : r.solid === 'Available' ? 'partial' : 'check'}>{r.solid}</span></td>
              <td><span class={r.svelte === '\u2717' ? 'cross' : r.svelte === 'Available' ? 'partial' : 'check'}>{r.svelte}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
