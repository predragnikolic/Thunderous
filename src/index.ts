export { customElement, createRegistry } from './custom-element.js';
export { createEffect, createSignal, derived } from './signals.js';
export { html, css } from './render.js';

export type {
	RenderFunction,
	RenderArgs,
	/**
	 * @deprecated Use `RenderArgs` instead.
	 */
	RenderArgs as RenderProps,
} from './custom-element.js';
export type { Signal, SignalGetter, SignalSetter } from './signals.js';
