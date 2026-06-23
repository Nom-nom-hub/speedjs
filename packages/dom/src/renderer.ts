import { Signal, effect } from '@speedjs/core';
import { JSXElement, JSXNode, Fragment } from './jsx-runtime';

export function mount(component: () => JSXElement, root: HTMLElement): void {
  effect(() => {
    root.innerHTML = '';
    root.appendChild(createNode(component()));
  });
}

function createNode(value: JSXElement): Node {
  if (value === null || value === undefined) {
    return document.createTextNode('');
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return document.createTextNode(String(value));
  }

  if (typeof value === 'boolean') {
    return document.createTextNode('');
  }

  if (Array.isArray(value)) {
    const fragment = document.createDocumentFragment();
    for (const item of value) {
      fragment.appendChild(createNode(item));
    }
    return fragment;
  }

  // Signal handling - fine-grained update
  if (isSignal(value)) {
    const textNode = document.createTextNode('');
    effect(() => {
      textNode.textContent = String(value.value);
    });
    return textNode;
  }

  // JSXNode handling
  if (isJSXNode(value)) {
    return createElement(value);
  }

  return document.createTextNode(String(value));
}

function createElement(node: JSXNode): Node {
  if (node.type === Fragment) {
    const fragment = document.createDocumentFragment();
    const children = node.props.children;
    if (children !== undefined && children !== null) {
      const childArray = Array.isArray(children) ? children : [children];
      for (const child of childArray) {
        fragment.appendChild(createNode(child));
      }
    }
    return fragment;
  }

  if (typeof node.type === 'function') {
    // Component function - reactive wrapper
    const placeholder = document.createComment('component');
    let current: Node = placeholder;
    effect(() => {
      const result = (node.type as Function)(node.props);
      const newNode = createNode(result);
      if (current.parentNode) {
        current.parentNode.replaceChild(newNode, current);
      }
      current = newNode;
    });
    return current;
  }

  // HTML element
  const element = document.createElement(node.type as string);

  // Set attributes and event listeners
  for (const [key, value] of Object.entries(node.props)) {
    if (key === 'children' || key === 'key') continue;

    if (key.startsWith('on') && key.length > 2) {
      // Event listener
      const eventName = key.toLowerCase().substring(2);
      element.addEventListener(eventName, value as EventListener);
    } else if (key === 'className') {
      // Class attribute
      if (typeof value === 'string') {
        element.setAttribute('class', value);
      }
    } else if (key === 'style' && typeof value === 'object') {
      // Style object
      Object.assign((element as HTMLElement).style, value);
    } else if (key === 'ref') {
      // Ref callback
      if (typeof value === 'function') {
        value(element);
      }
    } else if (typeof value === 'boolean') {
      // Boolean attribute
      if (value) {
        element.setAttribute(key, '');
      }
    } else if (value !== null && value !== undefined) {
      // Regular attribute
      if (isSignal(value)) {
        // Signal-based attribute binding
        if (key === 'value') {
          effect(() => { (element as any).value = value.value; });
        } else {
          const attrName = key;
          effect(() => {
            const signalValue = value.value;
            if (typeof signalValue === 'boolean') {
              if (signalValue) {
                element.setAttribute(attrName, '');
              } else {
                element.removeAttribute(attrName);
              }
            } else if (signalValue === null || signalValue === undefined) {
              element.removeAttribute(attrName);
            } else {
              element.setAttribute(attrName, String(signalValue));
            }
          });
        }
      } else if (key === 'value') {
        (element as any).value = value;
      } else if (key === 'innerHTML') {
        (element as any).innerHTML = value;
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  // Handle children
  const children = node.props.children;
  if (children !== undefined && children !== null) {
    const childArray = Array.isArray(children) ? children : [children];
    for (const child of childArray) {
      element.appendChild(createNode(child));
    }
  }

  return element;
}

function isSignal(value: any): value is Signal<any> {
  return value !== null && typeof value === 'object' && 'value' in value && 'subscribe' in value;
}

function isJSXNode(value: any): value is JSXNode {
  return value !== null && typeof value === 'object' && 'type' in value && 'props' in value;
}
