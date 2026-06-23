declare module '@speedjs/server' {
  export function renderToString(component: any): Promise<string>
  export function renderToStream(component: any): any
}

declare module '@speedjs/dom' {
  export function mount(component: () => any, root: any): void
  export function hydrate(root: any, component: () => any): void
}
