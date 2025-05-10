import { DEFAULT_RENDER_OPTIONS } from './constants';
import { isCSSStyleSheet, renderState } from './render';
import { isServer, serverDefine } from './server-side';
import { signal, effect } from './signals';
import type {
	AttributeChangedCallback,
	AttrProp,
	CustomElementProps,
	ElementResult,
	RegistryResult,
	RenderArgs,
	RenderFunction,
	RenderOptions,
	ServerRenderFunction,
	Signal,
	DisconnectedCallback
} from './types';

/**
 * Create a custom element that can be defined for use in the DOM.
 * @example
 * ```ts
 * const MyElement = customElement(() => {
 *   return html`<h1>Hello, World!</h1>`;
 * });
 * MyElement.define('my-element');
 * ```
 */
export const customElement = <Props extends CustomElementProps>(
	render: RenderFunction<Props>,
	options?: Partial<RenderOptions>,
): ElementResult => {
	const _options = { ...DEFAULT_RENDER_OPTIONS, ...options };

	const {
		formAssociated,
		observedAttributes: _observedAttributes,
		attributesAsProperties,
		attachShadow,
		shadowRootOptions: _shadowRootOptions,
	} = _options;

	const shadowRootOptions = { ...DEFAULT_RENDER_OPTIONS.shadowRootOptions, ..._shadowRootOptions };

	const allOptions = { ..._options, shadowRootOptions };

	if (isServer) {
		const serverRender = render as unknown as ServerRenderFunction;
		let _tagName: string | undefined;
		let _registry: RegistryResult | undefined;
		const scopedRegistry = (() => {
			if (
				shadowRootOptions.registry !== undefined &&
				'scoped' in shadowRootOptions.registry &&
				shadowRootOptions.registry.scoped
			) {
				return shadowRootOptions.registry;
			}
		})();
		return {
			define(tagName) {
				_tagName = tagName;
				serverDefine({
					tagName,
					serverRender,
					options: allOptions,
					scopedRegistry,
					parentRegistry: _registry,
					elementResult: this,
				});
				return this;
			},
			register(registry) {
				if (_tagName !== undefined && 'eject' in registry && registry.scoped) {
					console.error('Must call `register()` before `define()` for scoped registries.');
					return this;
				}
				if ('eject' in registry) {
					_registry = registry;
				} else {
					console.error('Registry must be created with `createRegistry()` for SSR.');
				}
				return this;
			},
			eject() {
				const error = new Error('Cannot eject a custom element on the server.');
				console.error(error);
				throw error;
			},
		};
	}

	shadowRootOptions.registry = shadowRootOptions.customElements =
		shadowRootOptions.registry instanceof CustomElementRegistry
			? shadowRootOptions.registry
			: shadowRootOptions.registry?.eject();

	// must set observedAttributes prior to defining the class
	const observedAttributesSet = new Set(_observedAttributes);
	const attributesAsPropertiesMap = new Map<string, AttrProp>();
	for (const [attrName, coerce] of attributesAsProperties) {
		observedAttributesSet.add(attrName);
		attributesAsPropertiesMap.set(attrName, {
			// convert kebab-case attribute names to camelCase property names
			prop: attrName
				.replace(/^([A-Z]+)/, (_, letter: string) => letter.toLowerCase())
				.replace(/(-|_| )([a-zA-Z])/g, (_, letter: string) => letter.toUpperCase()),
			coerce,
			value: null,
		});
	}
	const observedAttributes = Array.from(observedAttributesSet);

	class CustomElement extends HTMLElement {
		#attributesAsPropertiesMap = new Map(attributesAsPropertiesMap);
		#attrs: Record<string, Signal<string | null> | undefined> = {};
		#props = {} as {
			[K in keyof Props]: Signal<Props[K] | undefined>;
		};
		#attributeChangedFns = new Set<AttributeChangedCallback>();
		#connectedFns = new Set<() => void | DisconnectedCallback>();
		#disconnectedFns = new Set<() => void>();
		#adoptedCallbackFns = new Set<() => void>();
		#formAssociatedCallbackFns = new Set<() => void>();
		#formDisabledCallbackFns = new Set<() => void>();
		#formResetCallbackFns = new Set<() => void>();
		#formStateRestoreCallbackFns = new Set<() => void>();
		#clientCallbackFns = new Set<() => void>();
		#shadowRoot = attachShadow ? this.attachShadow(shadowRootOptions as ShadowRootInit) : null;
		#internals = this.attachInternals();
		#observer =
			options?.observedAttributes !== undefined
				? null
				: new MutationObserver((mutations) => {
						for (const mutation of mutations) {
							const attrName = mutation.attributeName;
							if (mutation.type !== 'attributes' || attrName === null) continue;
							if (!(attrName in this.#attrs)) this.#attrs[attrName] = signal<string | null>(null);
							const sig = this.#attrs[attrName]!;
							const oldValue = sig();
							const newValue = this.getAttribute(attrName);
							sig.set(newValue);
							for (const fn of this.#attributeChangedFns) {
								fn(attrName, oldValue, newValue);
							}
						}
					});
		#render() {
			const root = this.#shadowRoot ?? this;
			renderState.currentShadowRoot = this.#shadowRoot;
			const fragment = render({
				elementRef: this,
				root,
				internals: this.#internals,
				attributeChangedCallback: (fn) => this.#attributeChangedFns.add(fn),
				connectedCallback: (fn) => this.#connectedFns.add(fn),
				disconnectedCallback: (fn) => this.#disconnectedFns.add(fn),
				adoptedCallback: (fn) => this.#adoptedCallbackFns.add(fn),
				formAssociatedCallback: (fn) => this.#formAssociatedCallbackFns.add(fn),
				formDisabledCallback: (fn) => this.#formDisabledCallbackFns.add(fn),
				formResetCallback: (fn) => this.#formResetCallbackFns.add(fn),
				formStateRestoreCallback: (fn) => this.#formStateRestoreCallbackFns.add(fn),
				clientCallback: (fn) => this.#clientCallbackFns.add(fn),
				customCallback: (fn) => {
					const key = crypto.randomUUID();
					this.__customCallbackFns?.set(key, fn);
					return `this.getRootNode().host.__customCallbackFns.get('${key}')(event)`;
				},
				attrs: new Proxy(
					{},
					{
						get: (_, prop: string) => {
							if (!(prop in this.#attrs)) this.#attrs[prop] = signal<string | null>(null);
							const sig = this.#attrs[prop]!;
							effect(() => {
								this.setAttribute(prop, sig() ?? '');
							})
							return sig;
						},
						set: () => {
							console.error('Signals must be assigned via setters.');
							return false;
						},
					},
				),
				props: new Proxy({} as RenderArgs<Props>['props'], {
					get: (_, prop: Extract<keyof Props, string>) => {
						if (!(prop in this.#props)) this.#props[prop] = signal<Props[typeof prop] | undefined>();
						const sig = this.#props[prop];
						Object.defineProperty(this, prop, {
							get: sig,
							set: (newValue: Props[typeof prop]) => {
								sig.set(newValue);
							},
						});

						effect(()=> {
							// @ts-expect-error 
							this[prop] = sig();
						})
						return sig;
					},
					set: () => {
						console.error('Signals must be assigned via setters.');
						return false;
					},
				}),
				refs: new Proxy(
					{},
					{
						get: (_, prop: string) => root.querySelector<HTMLElement>(`[ref=${prop}]`),
						set: () => {
							console.error('Refs are readonly and cannot be assigned.');
							return false;
						},
					},
				),
				adoptStyleSheet: (stylesheet) => {
					if (!attachShadow) {
						console.warn(
							'Styles are only encapsulated when using shadow DOM. The stylesheet will be applied to the global document instead.',
						);
					}
					if (isCSSStyleSheet(stylesheet)) {
						if (this.#shadowRoot === null) {
							for (const rule of stylesheet.cssRules) {
								if (rule instanceof CSSStyleRule && rule.selectorText.includes(':host')) {
									console.error('Styles with :host are not supported when not using shadow DOM.');
								}
							}
							document.adoptedStyleSheets.push(stylesheet);
							return;
						}
						this.#shadowRoot.adoptedStyleSheets.push(stylesheet);
					} else {
						requestAnimationFrame(() => {
							root.appendChild(stylesheet);
						});
					}
				},
			});
			fragment.host = this;

			for (const fn of this.#clientCallbackFns) {
				fn();
			}

			root.replaceChildren(fragment);
		}
		static get formAssociated() {
			return formAssociated;
		}
		static get observedAttributes() {
			return observedAttributes;
		}
		constructor() {
			try {
				super();
			} catch (error) {
				const _error = new Error(
					'Error instantiating element:\nThis usually occurs if you have errors in the function body of your component. Check prior logs for possible causes.\n',
					{ cause: error },
				);
				console.error(_error);
				throw _error;
			}
			if (!Object.prototype.hasOwnProperty.call(this, '__customCallbackFns')) {
				this.__customCallbackFns = new Map<string, () => void>();
			}
			for (const [attrName, attr] of this.#attributesAsPropertiesMap) {
				this.#attrs[attrName] = signal<string | null>(null);
				Object.defineProperty(this, attr.prop, {
					get: () => {
						if (!(attrName in this.#attrs)) this.#attrs[attrName] = signal<string | null>(null);
						const sig = this.#attrs[attrName]!;
						const raw = sig();
						const rawOnly = raw !== null && attr.value === null;
						const value = rawOnly ? attr.coerce(raw) : attr.value; // avoid coercion when possible
						return value === null ? null : value;
					},
					set: (newValue) => {
						const oldValue = attr.value;
						attr.value = newValue;
						if (!(attrName in this.#attrs)) this.#attrs[attrName] = signal<string | null>(null);
						const attrSignal = this.#attrs[attrName]!;
						const propSignal = this.#props[attrName] as Signal;
						const attrValue = newValue === null ? null : String(newValue);
						if (String(oldValue) === attrValue) return;
						attrSignal.set(attrValue);
						propSignal.set(newValue);
						if (attrValue === null) this.removeAttribute(attrName);
						else this.setAttribute(attrName, attrValue);
					},
					configurable: true,
					enumerable: true,
				});
			}
			for (const attr of this.attributes) {
				this.#attrs[attr.name] = signal<string | null>(attr.value);
			}
			this.#render();
		}
		connectedCallback() {
			if (this.#observer !== null) {
				this.#observer.observe(this, { attributes: true });
			}
			for (const fn of this.#connectedFns) {
				let disconnectedCallback = fn();
				if (disconnectedCallback) this.#disconnectedFns.add(disconnectedCallback)
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
			// @ts-expect-error 
			const {set: attrSetter} = this.#attrs[name] ?? [];
			attrSetter?.(newValue);
			const prop = this.#attributesAsPropertiesMap.get(name);
			if (prop !== undefined) {
				// @ts-expect-error // TODO: look into this
				this[prop.prop] = newValue === null ? null : prop.coerce(newValue);
			}
			for (const fn of this.#attributeChangedFns) {
				fn(name, oldValue, newValue);
			}
		}
		adoptedCallback() {
			for (const fn of this.#adoptedCallbackFns) {
				fn();
			}
		}
		formAssociatedCallback() {
			for (const fn of this.#formAssociatedCallbackFns) {
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
	let _tagName: string | undefined;
	let _registry: RegistryResult | CustomElementRegistry | undefined;
	const elementResult: ElementResult = {
		define(tagName, options) {
			const registry = _registry ?? customElements;
			const nativeRegistry = 'eject' in registry ? registry.eject() : registry;
			if (nativeRegistry.get(tagName) !== undefined) {
				console.warn(`Custom element "${tagName}" was already defined. Skipping...`);
				return this;
			}
			registry.define(tagName, CustomElement, options);
			_tagName = tagName;
			return this;
		},
		register(registry) {
			if (_tagName !== undefined && 'eject' in registry && registry.scoped) {
				console.error('Must call `register()` before `define()` for scoped registries.');
				return this;
			}
			_registry = registry;
			return this;
		},
		eject: () => CustomElement,
	};
	return elementResult;
};
