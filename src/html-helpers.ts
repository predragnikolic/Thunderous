export type ElementParent = Element | DocumentFragment | ShadowRoot;

export const clearHTML = (element: ElementParent) => {
	while (element.childNodes.length > 0) {
		element.childNodes[0].remove();
	}
};

export const parseFragment = (htmlStr: string): DocumentFragment => {
	const range = document.createRange();
	range.selectNode(document.body); // required in Safari
	return range.createContextualFragment(htmlStr);
};

export const setInnerHTML = (element: ElementParent, html: string | DocumentFragment) => {
	clearHTML(element);
	const fragment = typeof html === 'string' ? parseFragment(html) : html;
	element.append(fragment);
};
