declare global {
	interface DocumentFragment {
		host: HTMLElement;
	}
	interface Node {
		__customCallbackFns?: Map<string, AnyFn>;
	}
	interface CustomElementRegistry {
		__tagNames: Set<string>;
	}
	interface ShadowRoot {
		// missing from typescript but present in the spec
		importNode: <T = Node>(node: T, deep: boolean) => T;
	}
}

export type TagName = `${string}-${string}`;

export type ElementResult = {
	define: (tagName: TagName, options?: ElementDefinitionOptions) => ElementResult;
	register: (registry: RegistryResult | CustomElementRegistry) => ElementResult;
	eject: () => CustomElementConstructor;
};

export type AttributeChangedCallback = (name: string, oldValue: string | null, newValue: string | null) => void;

export type CustomElementProps = Record<PropertyKey, unknown>;

export type RenderArgs<Props extends CustomElementProps> = {
	elementRef: HTMLElement;
	root: ShadowRoot | HTMLElement;
	internals: ElementInternals;
	attributeChangedCallback: (fn: AttributeChangedCallback) => void;
	connectedCallback: (fn: () => void) => void;
	disconnectedCallback: (fn: () => void) => void;
	adoptedCallback: (fn: () => void) => void;
	formDisabledCallback: (fn: () => void) => void;
	formResetCallback: (fn: () => void) => void;
	formStateRestoreCallback: (fn: () => void) => void;
	formAssociatedCallback: (fn: () => void) => void;
	clientOnlyCallback: (fn: () => void) => void;
	getter: <T>(fn: () => T) => SignalGetter<T>;
	/**
	 * @deprecated You can now pass callback functions directly to templates.
	 */
	customCallback: (fn: () => void) => `this.getRootNode().host.__customCallbackFns.get('${string}')(event)` | '';
	attrs: Record<string, Signal<string | null>>;
	props: {
		[K in keyof Props]: SignalWithInit<Props[K]>;
	};
	refs: Record<string, HTMLElement | null>;
	adoptStyleSheet: (stylesheet: Styles) => void;
};

export type Coerce<T = unknown> = (value: string) => T;

export type RenderOptions = {
	formAssociated: boolean;
	observedAttributes: string[];
	attributesAsProperties: [string, Coerce][];
	attachShadow: boolean;
	shadowRootOptions: Partial<ShadowRootInit> & {
		customElements?: CustomElementRegistry; // necessary with the polyfill
		registry?: CustomElementRegistry | RegistryResult; // current state of the proposal
		clonable?: boolean; // missing from typescript but present in the spec
	};
};

export type AttrProp<T = unknown> = {
	prop: string;
	coerce: Coerce<T>;
	value: T | null;
};

export type RenderFunction<Props extends CustomElementProps> = (args: RenderArgs<Props>) => DocumentFragment;

export type ServerRenderFunction = (args: RenderArgs<CustomElementProps>) => string;

export type ServerRenderOptions = { serverRender: ServerRenderFunction } & RenderOptions;

export type ServerDefineArgs = {
	tagName: TagName;
	serverRender: ServerRenderFunction;
	options: RenderOptions;
	elementResult: ElementResult;
	scopedRegistry?: RegistryResult;
	parentRegistry?: RegistryResult;
};

export type ServerDefineFn = (tagName: TagName, htmlString: string) => void;

export type WrapTemplateArgs = {
	tagName: TagName;
	serverRender: ServerRenderFunction;
	options: RenderOptions;
};

export type RegistryResult = {
	__serverCss: Map<TagName, string[]>;
	__serverRenderOpts: Map<TagName, ServerRenderOptions>;
	define: (
		tagName: TagName,
		CustomElement: CustomElementConstructor | ElementResult,
		options?: ElementDefinitionOptions,
	) => RegistryResult;
	getTagName: (CustomElement: CustomElementConstructor | ElementResult) => TagName | undefined;
	getAllTagNames: () => TagName[];
	eject: () => CustomElementRegistry;
	scoped: boolean;
};

export type RegistryArgs = {
	scoped: boolean;
};

export type ElementParent = Element | DocumentFragment | ShadowRoot;

export type Styles = CSSStyleSheet | HTMLStyleElement;

export type SignalOptions = { debugMode: boolean; label?: string };
export type SignalGetter<T> = {
	(options?: SignalOptions): T;
	getter: true;
};
export type SignalSetter<T> = (newValue: T, options?: SignalOptions) => void;
export type SignalNew<T> = {
	(options?: SignalOptions): T;
	set(newValue: T, options?: SignalOptions) : void;
	getter: true;
};
export type Signal<T = unknown> = SignalNew<T>;

// TODO: add `| undefined` to the uninitialized signal.
// The reason I didn't do it yet is that it's a breaking change. I'll wait for the next major version.
export type SignalWithInit<T = unknown> = Signal<T> & { init: (value: T) => SignalNew<T> };

// Flexible typing is necessary to support generic functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => any;

export type HTMLCustomElement<T extends Record<PropertyKey, unknown>> = Omit<HTMLElement, keyof T> & T;
