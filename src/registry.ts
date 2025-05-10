import { isServer } from './server-side';
import type { TagName, ElementResult, RegistryArgs, RegistryResult } from './types';

/**
 * Create a registry for custom elements.
 *
 * This allows you to delegate custom element definitions to the consumer of your library,
 * by using their associated classes to look up tag names dynamically.
 *
 * This can be useful when you need to select a custom element whose tag name is variable.
 * @example
 * ```ts
 * const registry = createRegistry();
 * registry.register('my-element', MyElement);
 * const tagName = registry.getTagName(MyElement);
 * console.log(tagName); // 'MY-ELEMENT'
 * ```
 */
export const createRegistry = (args?: RegistryArgs): RegistryResult => {
	const { scoped = false } = args ?? {};
	const customElementMap = new Map<CustomElementConstructor, TagName>();
	const elementResultMap = new Map<ElementResult, TagName>();
	const customElementTags = new Set<TagName>();
	const nativeRegistry = (() => {
		if (isServer) return;
		if (scoped) {
			try {
				return new CustomElementRegistry();
			} catch {
				console.error(
					'The scoped custom elements polyfill was not found. Falling back to global registry.\n\nCheck `RegistryResult.scoped` at https://thunderous.dev/docs/registries for more information.',
				);
			}
		}
		return customElements;
	})();
	return {
		__serverCss: new Map(),
		__serverRenderOpts: new Map(),
		define(tagName, ElementResult, options) {
			const isResult = 'eject' in ElementResult;
			const upperCaseTagName = tagName.toUpperCase() as TagName;

			if (customElementTags.has(upperCaseTagName)) {
				console.warn(`Custom element tag name "${upperCaseTagName}" was already defined. Skipping...`);
				return this;
			}
			if (isResult) {
				if (elementResultMap.has(ElementResult)) {
					console.warn(`${upperCaseTagName} was already defined. Skipping...`);
					return this;
				}
			}
			if (!isServer) {
				const component = isResult ? ElementResult.eject() : ElementResult;
				if (customElementMap.has(component)) {
					console.warn(`Custom element class "${component.constructor.name}" was already defined. Skipping...`);
					return this;
				}
				customElementMap.set(component, upperCaseTagName);
			}
			if (isResult) elementResultMap.set(ElementResult, upperCaseTagName);
			customElementTags.add(upperCaseTagName);

			if (isServer) {
				// offload the server definition to the element, as it's responsible for scoped registries and rendering.
				if (isResult) ElementResult.register(this).define(tagName, options);
				return this;
			}

			// define the custom element on the client
			const component = isResult ? ElementResult.eject() : ElementResult;
			nativeRegistry?.define(tagName, component, options);
			return this;
		},
		getTagName: (ElementResult) => {
			const isResult = 'eject' in ElementResult;

			if (isServer) {
				// only ElementResult types are supported on the server
				if (isResult) return elementResultMap.get(ElementResult);
				return;
			}
			const component = isResult ? ElementResult.eject() : ElementResult;
			return customElementMap.get(component);
		},
		getAllTagNames: () => Array.from(customElementTags),
		eject: () => {
			if (nativeRegistry === undefined) {
				const error = new Error('Cannot eject a registry on the server.');
				console.error(error);
				throw error;
			}
			return nativeRegistry;
		},
		scoped,
	};
};
