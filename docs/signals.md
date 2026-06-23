# Signals

Signals are the core of Speed.js's reactivity system. They provide fine-grained updates without virtual DOM diffing.

## What are Signals?

A signal is a value that can change over time and notify subscribers when it does. Unlike React's state, signals don't trigger component re-renders - they only update the specific DOM nodes that depend on them.

## Creating Signals

```tsx
import { signal } from '@speedjs/core';

const count = signal(0);
console.log(count.value); // 0
count.value = 1;
console.log(count.value); // 1
```

## Computed Values

Computed values derive from signals and only recompute when their dependencies change:

```tsx
import { signal, computed } from '@speedjs/core';

const count = signal(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 0
count.value = 1;
console.log(doubled.value); // 2
```

## Effects

Effects run when their dependencies change:

```tsx
import { signal, effect } from '@speedjs/core';

const count = signal(0);

effect(() => {
  console.log('Count changed:', count.value);
});

count.value = 1; // Logs: Count changed: 1
```

## Batch Updates

Batch multiple updates to avoid redundant computations:

```tsx
import { signal, batch } from '@speedjs/core';

const a = signal(1);
const b = signal(2);
const sum = computed(() => a.value + b.value);

batch(() => {
  a.value = 10;
  b.value = 20;
});
// Sum only computed once
```

## Untrack

Read a signal without tracking it as a dependency:

```tsx
import { signal, effect, untrack } from '@speedjs/core';

const count = signal(0);

effect(() => {
  const value = untrack(() => count.value);
  // Changing count won't rerun this effect
});
```

## Resources

Resources handle async operations with loading, success, and error states:

```tsx
import { resource } from '@speedjs/core';

const data = resource(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// Read value (suspends if loading)
const value = data.read();
```

## Best Practices

- Use signals for local state
- Use computed for derived values
- Use effects for side effects
- Batch updates when changing multiple signals
- Untrack reads that shouldn't trigger updates

## Comparison with React

| React | Speed.js |
|-------|----------|
| `useState` | `signal` |
| `useMemo` | `computed` |
| `useEffect` | `effect` |
| Re-renders component | Updates only bound nodes |
| Virtual DOM diffing | Fine-grained updates |
