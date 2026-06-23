import { signal } from '@speedjs/core';

export default function Counter() {
  const count = signal(0);

  return (
    <div>
      <h1>Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => count.value--}>Decrement</button>
    </div>
  );
}
