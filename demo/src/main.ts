import { createSignal, derived, css, html, customElement, createRegistry } from 'thunderous';

const MyElement = customElement(
	({ attrSignals, refs, connectedCallback, internals, adoptStyleSheet }) => {
		const [count, setCount] = createSignal(0);
		const [heading] = attrSignals.heading;

		const redValue = derived(() => {
			const value = count() * 10;
			return value > 255 ? 255 : value;
		});

		internals.setFormValue(String(count()));

		connectedCallback(() => {
			refs.increment!.addEventListener('click', () => {
				setCount(count() + 1);
				internals.setFormValue(String(count()));
			});
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
			<button ref="increment">increment</button>
			<output>count: ${count}</output>
			<div>
				<slot></slot>
			</div>
		`;
	},
	{ formAssociated: true },
);

const registry = createRegistry();

MyElement.define('my-element').register(registry);

console.log(registry.getTagName(MyElement.eject()));

const myElement = document.querySelector('my-element')!;

document.querySelector('button')!.addEventListener('click', () => {
	const prev = myElement.getAttribute('heading');
	myElement.setAttribute('heading', prev === 'title A' ? 'title B' : 'title A');
});
