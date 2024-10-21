import { createSignal, derived, css, html, customElement, createRegistry, Signal } from 'thunderous';

const MyElement = customElement(
	({ attrSignals, propSignals, customCallback, internals, adoptStyleSheet }) => {
		const [count, setCount] = propSignals.count as Signal<number>;
		setCount(0);
		const [heading] = attrSignals.heading;

		const redValue = derived(() => {
			const value = count() * 10;
			return value > 255 ? 255 : value;
		});

		internals.setFormValue(String(count()));

		const increment = customCallback(() => {
			setCount(count() + 1);
			internals.setFormValue(String(count()));
		});

		adoptStyleSheet(css`
			:host {
				display: grid;
				gap: 0.5rem;
				padding: 1rem;
				margin: 1rem 0;
				background-color: rgb(${redValue}, 0, 0);
				color: white;
				font-size: 2rem;
				font-family: sans-serif;
			}
			h1 {
				margin: 0;
			}
			button {
				font: inherit;
				padding: 0.5rem;
			}
		`);

		return html`
			<div><h1>${heading}</h1></div>
			<button onclick="${increment}">increment</button>
			<output>count: ${count}</output>
			<div>
				<slot></slot>
			</div>
		`;
	},
	{ formAssociated: true, observedAttributes: ['heading'], attributesAsProperties: [['count', Number]] },
);

const registry = createRegistry();

MyElement.define('my-element').register(registry);

console.log(registry.getTagName(MyElement.eject()));

const myElement = document.querySelector('my-element')!;

document.querySelector('button')!.addEventListener('click', () => {
	const prev = myElement.getAttribute('heading');
	myElement.setAttribute('heading', prev === 'title A' ? 'title B' : 'title A');
});
