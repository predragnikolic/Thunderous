import { setInnerHTML } from './html-helpers';
import { createSignal, Signal } from './signals';

type ElementResult = {
	define: (tagname: `${string}-${string}`) => ElementResult;
	register: (registry: Registry) => ElementResult;
	eject: () => CustomElementConstructor;
};

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
	customCallback: (fn: () => void) => `{{callback:${string}}}`;
	attrSignals: Record<string, Signal<string | null>>;
	refs: Record<string, HTMLElement | null>;
	adoptStyleSheet: (stylesheet: CSSStyleSheet) => void;
};

type RenderOptions = {
	formAssociated: boolean;
	observedAttributes: string[];
};

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
	formAssociated: false,
	observedAttributes: [],
};

export type RenderFunction = (props: RenderProps) => DocumentFragment;

export const customElement = (render: RenderFunction, options?: Partial<RenderOptions>): ElementResult => {
	const { formAssociated, observedAttributes } = { ...DEFAULT_RENDER_OPTIONS, ...options };
	class CustomElement extends HTMLElement {
		#attrSignals: Record<string, Signal<string | null>> = {};
		#attributeChangedFns = new Set<AttributeChangedCallback>();
		#connectedFns = new Set<() => void>();
		#disconnectedFns = new Set<() => void>();
		#adoptedCallbackFns = new Set<() => void>();
		#formDisabledCallbackFns = new Set<() => void>();
		#formResetCallbackFns = new Set<() => void>();
		#formStateRestoreCallbackFns = new Set<() => void>();
		__customCallbackFns = new Map<string, () => void>();
		#shadowRoot = this.attachShadow({ mode: 'closed' });
		#internals = this.attachInternals();
		#observer =
			observedAttributes.length > 0
				? null
				: new MutationObserver((mutations) => {
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
				customCallback: (fn) => {
					const key = crypto.randomUUID();
					this.__customCallbackFns.set(key, fn);
					return `{{callback:${key}}}`;
				},
				attrSignals: new Proxy(
					{},
					{
						get: (_, prop: string) => {
							if (!(prop in this.#attrSignals)) this.#attrSignals[prop] = createSignal<string | null>(null);
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
		static get observedAttributes() {
			return observedAttributes;
		}
		constructor() {
			super();
			for (const attr of this.attributes) {
				this.#attrSignals[attr.name] = createSignal<string | null>(attr.value);
			}
			this.#render();
		}
		connectedCallback() {
			if (this.#observer !== null) {
				this.#observer.observe(this, { attributes: true });
			}
			for (const fn of this.#connectedFns) {
				fn();
			}
		}
		disconnectedCallback() {
			if (this.#observer !== null) {
				this.#observer.disconnect();
			}
			for (const fn of this.#disconnectedFns) {
				fn();
			}
		}
		attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
			const [, setValue] = this.#attrSignals[name];
			setValue(newValue);
			for (const fn of this.#attributeChangedFns) {
				fn(name, oldValue, newValue);
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
	let _tagname: string | null = null;
	return {
		define(tagname) {
			if (customElements.get(tagname) !== undefined) {
				console.warn(`Custom element "${tagname}" was already defined. Skipping...`);
				return this;
			}
			customElements.define(tagname, CustomElement);
			_tagname = tagname;
			return this;
		},
		register(registry) {
			if (_tagname === null) {
				console.error('Custom element must be defined before registering.');
				return this;
			}
			registry.register(_tagname, CustomElement);
			return this;
		},
		eject: () => CustomElement,
	};
};

type Registry = {
	register: (tagName: string, element: CustomElementConstructor) => void;
	getTagName: (element: CustomElementConstructor) => string | undefined;
};

export const createRegistry = (): Registry => {
	const registry = new Map<CustomElementConstructor, string>();
	return {
		register: (tagName: string, element: CustomElementConstructor) => {
			if (registry.has(element)) {
				console.warn(`Custom element class "${element.constructor.name}" was already registered. Skipping...`);
				return;
			}
			registry.set(element, tagName.toUpperCase());
		},
		getTagName: (element: CustomElementConstructor) => registry.get(element),
	};
};
