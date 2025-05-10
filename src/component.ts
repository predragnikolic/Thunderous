import { DEFAULT_RENDER_OPTIONS } from './constants';
import { isCSSStyleSheet, renderState } from './render';
import { isServer, serverDefine } from './server-side';
import { signal, effect } from './signals';
import type {
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
 * const MyElement = component(() => {
 *   return html`<h1>Hello, World!</h1>`;
 * });
 * MyElement.define('my-element');
 * ```
 */
export const component = <Props extends CustomElementProps>(
	render: RenderFunction<Props>,
	options?: Partial<RenderOptions>,
): ElementResult => {
	const _options = { ...DEFAULT_RENDER_OPTIONS, ...options };

	const {
		formAssociated,
		props,
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
	const propsMap = new Map<string, AttrProp>();
	for (const [attrName, coerce] of props) {
		propsMap.set(attrName, {
			// convert kebab-case attribute names to camelCase property names
			prop: attrName
				.replace(/^([A-Z]+)/, (_, letter: string) => letter.toLowerCase())
				.replace(/(-|_| )([a-zA-Z])/g, (_, letter: string) => letter.toUpperCase()),
			coerce,
			value: null,
		});
	}

	class component extends HTMLElement {
		propsMap = new Map(propsMap);
		#props = {} as {
			[K in keyof Props]: Signal<Props[K] | undefined>;
		};
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
		#observer = new MutationObserver((mutations) => {
						for (const mutation of mutations) {
							const attrName = mutation.attributeName;
							if (mutation.type !== 'attributes' || attrName === null) continue;
							const prop = this.#props[attrName];
							const attr = this.propsMap.get(attrName);
							const newValue = this.getAttribute(attrName);
							if (attr) {
								// @ts-expect-error this is fine
								prop.set(newValue === null ? null : attr.coerce(newValue));
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
				connectedCallback: (fn) => this.#connectedFns.add(fn),
				adoptedCallback: (fn) => this.#adoptedCallbackFns.add(fn),
				formAssociatedCallback: (fn) => this.#formAssociatedCallbackFns.add(fn),
				formDisabledCallback: (fn) => this.#formDisabledCallbackFns.add(fn),
				formResetCallback: (fn) => this.#formResetCallbackFns.add(fn),
				formStateRestoreCallback: (fn) => this.#formStateRestoreCallbackFns.add(fn),
				clientCallback: (fn) => this.#clientCallbackFns.add(fn),
				props: new Proxy({} as RenderArgs<Props>['props'], {
					get: (_, prop: Extract<keyof Props, string>) => {
						if (!(prop in this.#props)) this.#props[prop] = signal<Props[typeof prop] | undefined>();
						const sig = this.#props[prop];
						Object.defineProperty(this, prop, {
							get: sig,
							set: (newValue: Props[typeof prop]) => {
								let oldValue = sig()
								sig.set(newValue);

								const attr = this.propsMap.get(prop);
								if (attr && oldValue != newValue) {
									this.setAttribute(attr.prop, String(newValue))
								}
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
			registry.define(tagName, component, options);
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
		eject: () => component,
	};
	return elementResult;
};
