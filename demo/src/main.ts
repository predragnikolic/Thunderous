import {
	derived,
	css,
	html,
	customElement,
	createRegistry,
	onServerDefine,
	insertTemplates,
	clientOnlyCallback,
	signal,
	effect,
	HTMLCustomElement,
} from 'thunderous';

declare global {
	interface HTMLElementTagNameMap {
		'my-element': HTMLCustomElement<MyElementProps>;
	}
}

type MyElementProps = {
	count: number;
};

type NestedElementProps = {
	count: number;
};

const mockHTML = /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<my-element heading="title A"></my-element>
	<button>toggle heading</button>
</body>
</html>
`;

onServerDefine((tagName, htmlString) => {
	console.log('onServerDefine:', tagName);
	console.log(insertTemplates(tagName, htmlString, mockHTML));
});

const globalRegistry = createRegistry();

const NestedElement = customElement<NestedElementProps>(
	({ attrs: { text }, props: { count } }) => {
		count.init(0);
		return html`<strong>${text}</strong> <span>count: ${count}</span>`;
	},
	{
		shadowRootOptions: { mode: 'open' },
	},
);

const registry = createRegistry({ scoped: true });
registry.define('nested-element', NestedElement);

const MyElement = customElement<MyElementProps>(
	({ attrs, props: {count}, getter, internals, clientOnlyCallback, adoptStyleSheet }) => {
		count.init(0);
		effect(() => {
			console.log('count changed:', count());
		});
		const heading = attrs.heading;
		const list = signal([
			{ id: 1, name: 'item 1' },
			{ id: 2, name: 'item 2' },
			{ id: 3, name: 'item 3' },
		]);

		const redValue = derived(() => {
			const value = count() * 10;
			return value > 255 ? 255 : value;
		});

		clientOnlyCallback(() => {
			internals.setFormValue(String(count()));
		});

		const increment = () => {
			count.set(count() + 1);
			clientOnlyCallback(() => {
				internals.setFormValue(String(count()));
			});
		};

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
			[onclick] {
				cursor: pointer;
			}
		`);

		let i = 1;
		const addListItem = () => {
			const _list = list().map((item) => ({ id: item.id, name: `updated: ${item.name.replace('updated: ', '')}` }));
			list.set([..._list, { id: i + 3, name: 'new item ' + i++ }]);
		};

		const removeListItem = (id: number) => {
			const _list = list();
			_list.splice(
				_list.findIndex((item) => item.id === id),
				1,
			);
			list.set(_list);
		};

		return html`
			<div><h1>${heading}</h1></div>
			<button onclick="${increment}">increment</button>
			<output>count: ${count}</output>
			<div>
				<slot></slot>
			</div>
			<span>this is a scoped element:</span>
			<nested-element text="test" prop:count="${count}"></nested-element>
			<h2>nested templates and loops:</h2>
			<ul>
				${html`<li onclick="${addListItem}">item</li>`}
				${derived(() =>
					list().map((item) => html`<li key="${item.id}" onclick="${() => removeListItem(item.id)}">${item.name}</li>`),
				)}
				${list().map((item) => html`<li key="${item.id}">${item.name} after</li>`)}
			</ul>
			<button onclick="${addListItem}">Add List Item</button>
			<h2>Test</h2>
			<div><span>test custom getter: </span>${getter(() => 'TESTING CUSTOM GETTER')}</div>
		`;
	},
	{
		formAssociated: true,
		observedAttributes: ['heading'],
		shadowRootOptions: { registry },
	},
).register(globalRegistry);

MyElement.define('my-element');

clientOnlyCallback(() => {
	requestAnimationFrame(() => {
		const tagName = globalRegistry.getTagName(MyElement);
		console.log(tagName);
	});

	const myElement = document.querySelector('my-element')!;

	document.querySelector('button')!.addEventListener('click', () => {
		const prev = myElement.getAttribute('heading');
		myElement.setAttribute('heading', prev === 'title A' ? 'title B' : 'title A');
	});
	document.querySelector('#outer-count')!.addEventListener('click', () => {
		myElement.count = myElement.count + 1;
		// myElement.setAttribute('count', String(myElement.count + 1));
	});
});
