# Thunderous

Thunderous is a library for writing web components in a functional style, reducing the boilerplate, while signals make it better for managing and sharing state.

Each component renders only once, then binds signals to DOM nodes for direct updates with _thunderous_ efficiency.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [License](#license)

## Installation

Install Thunderous via npm:

```sh
npm install thunderous
```

## Usage

Thunderous makes it easy to define smaller components with less noise.

<!-- prettier-ignore-start -->
```ts
import { customElement, html, css, createSignal } from 'thunderous';

const myStyleSheet = css`
  :host {
    display: block;
    font-family: sans-serif;
  }
`;

const MyElement = customElement(({ customCallback, refs, adoptStyleSheet }) => {
  const [count, setCount] = createSignal(0);
  const increment = customCallback(() => setCount(count() + 1));
  adoptStyleSheet(myStyleSheet);
  return html`
    <button onclick="${increment}">Increment</button>
    <output>${count}</output>
  `;
});

MyElement.define('my-element');
```
<!-- prettier-ignore-end -->

### The Native Features

Everything the native class definition can do, this function can do too. You'll find that these things are not far removed from the native approach, so they ought to be familiar.

#### Lifecycle Methods

Any lifecycle method you may need can be accessed from the params of your render function. The only difference is that these are callback registrations, so the same callback you would normally write is just passed in instead.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement((params) => {
  const {
    adoptedCallback,
    connectedCallback,
    disconnectedCallback,
    attributeChangedCallback,
  } = params;
  /* ... */
});
```
<!-- prettier-ignore-end -->

If you need to support forms, pass an options object as the second argument to `customElement`.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement((params) => {
  const {
    formDisabledCallback,
    formResetCallback,
    formStateRestoreCallback,
  } = params;
  /* ... */
}, { formAssociated: true });
```
<!-- prettier-ignore-end -->

#### Roots and Element Internals

You can always define the internals the same as you usually would, and if for some reason you need access to either the element itself or the shadow root, you can do so as illustrated below.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement(({ internals, elementRef, root }) => {
  internals.ariaRequired = 'true';
  const childLink = elementRef.querySelector('a[href]'); // light DOM
  const innerLink = root.querySelector('a[href]'); // shadow DOM
  /* ... */
}, { formAssociated: true });
```
<!-- prettier-ignore-end -->

#### Adopted Style Sheets

This one diverges from native slightly, since the native approach is a bit manual. For convenience, you can use the `adoptStyleSheet()` function.

> If you prefer the manual approach, `root.adoptedStyleSheets = []`, you can always do that with the `root` property listed above.

The `css` tagged template function will construct a `CSSStyleSheet` object that can be adopted by documents and shadow roots.

<!-- prettier-ignore-start -->
```ts
import { customElement, css } from 'thunderous';

const myStyleSheet = css`
  :host {
    display: block;
    font-family: sans-serif;
  }
`;

const MyElement = customElement(({ adoptStyleSheet }) => {
  adoptStyleSheet(myStyleSheet);
  /* ... */
});
```
<!-- prettier-ignore-end -->

### Non-Native extras

In addition to the native features, there are a few features that supercharge your web components. Most notably, signals.

#### Signals

Creating signals should look pretty familiar to most modern developers.

<!-- prettier-ignore-start -->
```ts
import { createSignal } from 'thunderous';

const [count, setCount] = createSignal(0);
console.log(count()); // 0
setCount(1);
console.log(count()) // 1
```
<!-- prettier-ignore-end -->

##### Binding Signals to Templates

To bind signals to a template, use the provided `html` tagged template function to pass them in.

<!-- prettier-ignore-start -->
```ts
import { createSignal, customElement, html } from 'thunderous';

const MyElement = customElement(() => {
  const [count, setCount] = createSignal(0);
  // presumably setCount() gets called
  return html`<output>${count}</output>`;
});
```
<!-- prettier-ignore-end -->

> NOTICE: we are not running the signal's getter above. This is intentional, as we delegate that to the template to run for proper binding.

By binding signals to templates, you allow fine-grained updates to be made directly to DOM nodes every time the signal changes, without requiring any diffing or re-rendering.

> This also works for `css`, but bear in mind that passing signals to a shared `CSSStyleSheet` may not have the effect you expect. Sharing Style Sheets across many component instances is best for performance, but signals will update every instance of each component with that approach. The suggested alternative is to write static CSS and toggle classes in the HTML instead.

##### Attribute Signals

By default, each element is observed with a `MutationObserver` watching all attributes. Changes to _any_ attribute trigger the `attributeChangedCallback` and you can access all attributes as signals. This makes it much less cumbersome to write reactive attributes.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement(({ attrSignals }) => {
  const [heading, setHeading] = attrSignals['my-heading'];
  // setHeading() will also update the attribute in the DOM.
  return html`<h2>${heading}</h2>`;
});
```
<!-- prettier-ignore-end -->

However, the `MutationObserver` does impose a small performance tradeoff that may add up if you render a lot of elements. To better optimize for performance, you can pass `observedAttributes` to the options. Doing so will disable the `MutationObserver`, and only the observed attributes will trigger the `attributeChangedCallback`.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement(({ attrSignals }) => {
  const [heading, setHeading] = attrSignals['my-heading'];
  return html`<h2>${heading}</h2>`;
}, { observedAttributes: ['my-heading'] });
```
<!-- prettier-ignore-end -->

Usage:

```html
<my-element my-heading="My Element's Title"></my-element>
```

> NOTICE: Since `attrSignals` is a `Proxy` object, _any_ property will return a signal and auto-bind it to the attribute it corresponds with.

##### Derived Signals

If you want to calculate a value based on another signal's value, you should use the `derived()` function. This signal will trigger its subscribers each time the signals inside change.

```ts
import { derived, createSignal } from 'thunderous';

const [count, setCount] = createSignal(0);
const timesTen = derived(() => count() * 10);
console.log(timesTen()); // 0
setCount(10);
console.log(timesTen()); // 100
```

##### Effects

To run a callback each time a signal is changed, use the `createEffect()` function. Any signal used inside will trigger the callback when they're changed.

```ts
import { createEffect } from 'thunderous';

/* ... */
createEffect(() => {
  console.log(count());
});
```

#### Refs

The refs property exists for convenience to avoid manually querying the DOM. Since the DOM is only available after rendering, refs will only work in and after the `connectedCallback` method.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement(({ connectedCallback, refs }) => {
  connectedCallback(() => {
    console.log(refs.heading.textContent); // hello world
  });
  return html`<h2 ref="heading">hello world</h2>`;
});
```
<!-- prettier-ignore-end -->

#### Event Binding

While you could bind events in the `connectedCallback()` with `refs.button.addEventListener('click', handleClick)` for example, it may be more convenient to register a custom callback and bind it to the template.

<!-- prettier-ignore-start -->
```ts
const MyElement = customElement(({ customCallback }) => {
  const [count, setCount] = createSignal(0);
  const increment = customCallback(() => setCount(count() + 1));
  return html`
    <button onclick="${increment}">Increment</button>
    <output>${count}</output>
  `;
});
```
<!-- prettier-ignore-end -->

> NOTICE: This uses the native HTML inline event-binding syntax. There is no special syntax for `on` attributes, because it simply renders a reference to `this.getRootNode().host` and extracts the callback from there.

### Defining Custom Elements

The `customElement()` function allows you to author a web component, returning an `ElementResult` that has some helpful methods like `define()` and `eject()`.

- `ElementResult.define()` is a little safer than `customElements.define()` because it first checks if the component was already defined, without throwing an error. It will, however, log a warning. There's no need to pass the class since it already has that context.

  ```ts
  const MyElement = customElement(() => html`<slot></slot>`);

  MyElement.define('my-element');
  ```

- `ElementResult.eject()` is useful in case you need to access the underlying class for some reason; perhaps you want to extend it and/or set static properties.

  ```ts
  const MyElementClass = MyElement.eject();

  class MyOtherElement extends MyElementClass {
    /* ... */
  }
  ```

These may also be chained together, like `MyElement.define('my-element').eject()`.

## Contributing

### Local Server

To see it in action, start the demo server with:

```sh
npm run demo
```

The demo's `package.json` points to the parent directory with the `file:` prefix. To preview the updated library code, you must run `npm run build` at the top level.

Please open a corresponding issue for any pull request you'd like to raise.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
