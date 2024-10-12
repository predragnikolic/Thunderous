import { setInnerHTML } from './html-helpers';
import { createSignal, Signal } from './signals';

type AttributeChangedCallback = (name: string, oldValue: string | null, newValue: string | null) => void;

export type RenderProps = {
	elementRef: HTMLElement;
	root: ShadowRoot;
	internals: ElementInternals;
	attributeChangedCallback: (fn: AttributeChangedCallback) => void;
	connectedCallback: (fn: () => void) => void;
	disconnectedCallback: (fn: () => void) => void;
	adoptedCallback: (fn: () => void) => void;
	formDisabledCallback: (fn: () => void) => void;
	formResetCallback: (fn: () => void) => void;
	formStateRestoreCallback: (fn: () => void) => void;
	attrSignals: Record<string, Signal<string | null>>;
	refs: Record<string, HTMLElement | null>;
	adoptStyleSheet: (stylesheet: CSSStyleSheet) => void;
};

type RenderOptions = {
	formAssociated?: boolean;
};

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
	formAssociated: false,
};

export type RenderFunction = (props: RenderProps) => DocumentFragment;

export const customElement = (render: RenderFunction, options?: RenderOptions) => {
	const { formAssociated } = { ...DEFAULT_RENDER_OPTIONS, ...options };
	class CustomElement extends HTMLElement {
		#attrSignals: Record<string, Signal<string | null>> = {};
		#attributeChangedFns = new Set<AttributeChangedCallback>();
		#connectedFns = new Set<() => void>();
		#disconnectedFns = new Set<() => void>();
		#adoptedCallbackFns = new Set<() => void>();
		#formDisabledCallbackFns = new Set<() => void>();
		#formResetCallbackFns = new Set<() => void>();
		#formStateRestoreCallbackFns = new Set<() => void>();
		#shadowRoot = this.attachShadow({ mode: 'closed' });
		#internals = this.attachInternals();
		#observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				const attrName = mutation.attributeName;
				if (mutation.type !== 'attributes' || attrName === null) continue;
				const [value, setValue] = this.#attrSignals[attrName];
				const _oldValue = value();
				const oldValue = _oldValue === null ? null : _oldValue;
				const newValue = this.getAttribute(attrName);
				setValue(newValue);
				for (const fn of this.#attributeChangedFns) {
					fn(attrName, oldValue, newValue);
				}
			}
		});
		#render() {
			const fragment = render({
				elementRef: this,
				root: this.#shadowRoot,
				internals: this.#internals,
				attributeChangedCallback: (fn) => this.#attributeChangedFns.add(fn),
				connectedCallback: (fn) => this.#connectedFns.add(fn),
				disconnectedCallback: (fn) => this.#disconnectedFns.add(fn),
				adoptedCallback: (fn) => this.#adoptedCallbackFns.add(fn),
				formDisabledCallback: (fn) => this.#formDisabledCallbackFns.add(fn),
				formResetCallback: (fn) => this.#formResetCallbackFns.add(fn),
				formStateRestoreCallback: (fn) => this.#formStateRestoreCallbackFns.add(fn),
				attrSignals: new Proxy(
					{},
					{
						get: (_, prop: string) => {
							const [getter] = this.#attrSignals[prop];
							const setter = (newValue: string) => this.setAttribute(prop, newValue);
							return [getter, setter];
						},
						set: () => {
							console.error('Signals must be assigned via setters.');
							return false;
						},
					},
				),
				refs: new Proxy(
					{},
					{
						get: (_, prop: string) => this.#shadowRoot.querySelector(`[ref=${prop}]`),
						set: () => {
							console.error('Refs are readonly and cannot be assigned.');
							return false;
						},
					},
				),
				adoptStyleSheet: (stylesheet) => {
					this.#shadowRoot.adoptedStyleSheets.push(stylesheet);
				},
			});
			setInnerHTML(this.#shadowRoot, fragment);
		}
		static get formAssociated() {
			return formAssociated;
		}
		constructor() {
			super();
			for (const attr of this.attributes) {
				this.#attrSignals[attr.name] = createSignal<string | null>(attr.value);
			}
			this.#render();
		}
		connectedCallback() {
			this.#observer.observe(this, { attributes: true });
			for (const fn of this.#connectedFns) {
				fn();
			}
		}
		disconnectedCallback() {
			this.#observer.disconnect();
			for (const fn of this.#disconnectedFns) {
				fn();
			}
		}
		adoptedCallback() {
			for (const fn of this.#adoptedCallbackFns) {
				fn();
			}
		}
		formDisabledCallback() {
			for (const fn of this.#formDisabledCallbackFns) {
				fn();
			}
		}
		formResetCallback() {
			for (const fn of this.#formResetCallbackFns) {
				fn();
			}
		}
		formStateRestoreCallback() {
			for (const fn of this.#formStateRestoreCallbackFns) {
				fn();
			}
		}
	}
	return {
		eject: () => CustomElement,
		define: (tagname: `${string}-${string}`) => {
			if (customElements.get(tagname) !== undefined) {
				console.warn(`Custom element "${tagname}" was already defined. Skipping...`);
				return;
			}
			customElements.define(tagname, CustomElement);
		},
	};
};
