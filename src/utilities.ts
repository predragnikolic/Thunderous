export const NOOP = () => void 0;

export const assumeObj = (obj: unknown): Record<PropertyKey, unknown> => {
	if (typeof obj !== 'object' || obj === null) {
		throw new Error('Expected an object.');
	}
	return obj as Record<PropertyKey, unknown>;
};

export const queryComment = (node: Node, comment: string) => {
	for (const child of node.childNodes) {
		if (child.nodeType === Node.COMMENT_NODE && child.nodeValue === comment) {
			return child;
		}
	}
	return null;
};
