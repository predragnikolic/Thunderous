export const clearHTML = (element) => {
	while (element.childNodes.length > 0) {
		element.firstChild.remove();
	}
};

export const parseFragment = (htmlStr) => {
	const range = document.createRange();
	range.selectNode(document.body); // required in Safari
	return range.createContextualFragment(htmlStr);
};

export const setInnerHTML = (element, html) => {
	clearHTML(element);
	const fragment = typeof html === 'string' ? parseFragment(html) : html;
	element.append(fragment);
};
