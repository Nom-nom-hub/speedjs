import { Signal } from '@speedjs/core';

export type JSXElement =
  | string
  | number
  | boolean
  | null
  | undefined
  | Signal<any>
  | JSXElement[]
  | { [key: string]: any };

export interface JSXNode {
  type: string | symbol | Function;
  props: { [key: string]: any };
  key?: string | number;
}

export const Fragment = Symbol.for('speed.fragment');

export function jsx(
  type: string | symbol | Function,
  props: any,
  key?: string | number
): JSXNode {
  if (key !== undefined) {
    props.key = key;
  }
  return { type, props };
}

export function jsxs(type: string | symbol | Function, props: any, key?: string | number): JSXNode {
  return jsx(type, props, key);
}

export const jsxDEV = jsx;
