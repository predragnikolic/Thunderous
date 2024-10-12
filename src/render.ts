import { parseFragment } from './html-helpers';
import { createEffect } from './signals';

export const html = (strings, ...values) => {
	let innerHTML = '';
	const signalMap = new Map();
	strings.forEach((string, i) => {
		let value = values[i] ?? '';
		if (typeof value === 'function') {
			const uniqueKey = crypto.randomUUID();
			signalMap.set(uniqueKey, value);
			value = `{{signal:${uniqueKey}}}`;
		}
		innerHTML += string + value;
	});
	const fragment = parseFragment(innerHTML);
	const signalBindingRegex = /(\{\{signal:.+\}\})/;
	const parseChildren = (element) => {
		for (const child of element.childNodes) {
			if (child instanceof Text && signalBindingRegex.test(child.data)) {
				const textList = child.data.split(signalBindingRegex);
				textList.forEach((text, i) => {
					const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, '$1');
					const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
					const newText = signal !== null ? signal() : text;
					const newNode = new Text(newText);
					if (i === 0) {
						child.replaceWith(newNode);
					} else {
						element.insertBefore(newNode, child.nextSibling);
					}
					if (signal !== null) {
						createEffect(() => {
							newNode.data = signal();
						});
					}
				});
			}
			if (child instanceof Element) {
				for (const attr of child.attributes) {
					if (signalBindingRegex.test(attr.value)) {
						const textList = attr.value.split(signalBindingRegex);
						createEffect(() => {
							let newText = '';
							for (const text of textList) {
								const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, '$1');
								const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
								newText += signal !== null ? signal() : text;
							}
							child.setAttribute(attr.name, newText);
						});
					}
				}
				parseChildren(child);
			}
		}
	};
	parseChildren(fragment);
	return fragment;
};

export const css = (strings, ...values) => {
	let cssText = '';
	const signalMap = new Map();
	const signalBindingRegex = /(\{\{signal:.+\}\})/;
	strings.forEach((string, i) => {
		let value = values[i] ?? '';
		if (typeof value === 'function') {
			const uniqueKey = crypto.randomUUID();
			signalMap.set(uniqueKey, value);
			value = `{{signal:${uniqueKey}}}`;
		}
		cssText += string + value;
	});
	const stylesheet = new CSSStyleSheet();
	const textList = cssText.split(signalBindingRegex);
	createEffect(() => {
		const newCSSTextList: string[] = [];
		for (const text of textList) {
			const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, '$1');
			const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
			const newText = signal !== null ? signal() : text;
			newCSSTextList.push(newText);
		}
		const newCSSText = newCSSTextList.join('');
		stylesheet.replace(newCSSText);
	});
	return stylesheet;
};
