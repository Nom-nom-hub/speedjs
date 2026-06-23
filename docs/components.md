# Components

Speed.js components are simple functions that return JSX. Unlike React, they execute once where possible.

## Basic Components

```tsx
function Greeting({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}
```

## Using Signals in Components

```tsx
import { signal } from '@speedjs/core';

function Counter() {
  const count = signal(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

**Important**: The component function only runs once. The signal binding updates the DOM directly without re-rendering the component.

## Props

Components receive props as function arguments:

```tsx
interface Props {
  title: string;
  onAction?: () => void;
}

function Card({ title, onAction }: Props) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
}
```

## Fragments

Use fragments to group multiple elements:

```tsx
import { Fragment } from '@speedjs/dom';

function List() {
  return (
    <Fragment>
      <span>Item 1</span>
      <span>Item 2</span>
      <span>Item 3</span>
    </Fragment>
  );
}
```

## Lists and Keys

When rendering lists, provide keys:

```tsx
function TodoList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

## Conditional Rendering

```tsx
function Conditional({ show }: { show: boolean }) {
  return (
    <div>
      {show && <div>Visible</div>}
      {show ? <div>A</div> : <div>B</div>}
    </div>
  );
}
```

## Attributes

```tsx
function Button({ disabled, style }: { disabled: boolean; style?: object }) {
  return (
    <button disabled={disabled} style={style}>
      Click me
    </button>
  );
}
```

## Event Handlers

```tsx
function Form() {
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Refs

```tsx
function FocusInput() {
  let inputRef: HTMLInputElement | undefined;

  return (
    <input
      ref={(el) => { inputRef = el; }}
      onClick={() => inputRef?.focus()}
    />
  );
}
```

## Best Practices

- Components execute once - avoid expensive work in component bodies
- Use signals for state - they update DOM directly
- Provide keys for lists
- Use fragments when needed
- Keep components small and focused

## Comparison with React

| React | Speed.js |
|-------|----------|
| Component re-renders on state change | Component runs once |
| Virtual DOM diffing | Fine-grained DOM updates |
| `useRef` for refs | Callback ref pattern |
| `useMemo` to avoid recomputation | Computed values |
| Large component trees can be slow | Component trees stay fast |
