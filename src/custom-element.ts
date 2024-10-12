import { setInnerHTML } from './html-helpers';
import { createSignal } from './signals';

export const customElement = (render) => {
	return class extends HTMLElement {
		#attrSignals = {};
		#attributeChangedFns = new Set<(name: string, oldValue: string | null, newValue: string | null) => void>();
		#connectedFns = new Set<() => void>();
		#disconnectedFns = new Set<() => void>();
		#shadowRoot = this.attachShadow({ mode: 'closed' });
		#internals = this.attachInternals();
		#observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				const attrName = mutation.attributeName;
				if (mutation.type !== 'attributes' || attrName === null) continue;
				const [value, setValue] = this.#attrSignals[attrName];
				const _oldValue = value();
				const oldValue = _oldValue === null ? null : String(_oldValue);
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
		constructor() {
			super();
			for (const attr of this.attributes) {
				this.#attrSignals[attr.name] = createSignal(attr.value);
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
	};
};

export const customFormElement = (render) => {
	return class extends customElement(render) {
		static get formAssociated() {
			return true;
		}
	};
};
