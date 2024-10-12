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

Below is a basic usage of the functions available.

```ts
import { customElement, html, css, createSignal } from 'thunderous';

const MyElement = customElement(({ attrSignals, connectedCallback, refs, adoptStyleSheet }) => {
	const [heading] = attrSignals.heading;
	const [count, setCount] = createSignal(0);
	connectedCallback(() => {
		refs.increment.addEventListener('click', () => {
			setCount(count() + 1);
		});
	});
	adoptStyleSheet(css`
		:host {
			display: block;
			font-family: sans-serif;
		}
	`);
	return html`
		<h2>${heading}</h2>
		<button ref="increment">Increment</button>
		<output>${count}</output>
	`;
});

MyElement.define('my-element');
```

If you should need to access the class directly for some reason, you can use the `eject` method.

```ts
const MyElementClass = MyElement.eject();
```

[more examples to be updated...]

## Development

### Local Server

To see it in action, start the demo server with:

```sh
npm run demo
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
