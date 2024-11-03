import { html, css, customElement, createEffect } from 'thunderous';
import { theme } from '../_styles/theme';
import hljs from 'highlight.js';
import { highlight } from '../_styles/highlight';

export const Code = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(codeStyles);
	return html`<code><slot></slot></code>`;
});

const codeStyles = css`
	code {
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 0.5em;
		padding: 0.2em;
	}
`;

export const CodeBlock = customElement(({ adoptStyleSheet, attrSignals, connectedCallback, elementRef, refs }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(highlight);
	adoptStyleSheet(codeBlockStyles);
	const [language] = attrSignals.language;
	connectedCallback(() => {
		const content = elementRef.innerHTML;
		const code = refs.code;
		if (code === null) return;
		code.innerHTML = content;
		createEffect(() => {
			if (language() === null) {
				code.className = 'no-highlight hljs';
			} else {
				code.className = `language-${language()}`;
			}
		});
		hljs.highlightElement(code);
	});
	return html`
		<pre>
			<code ref="code"></code>
		</pre>
		<slot style="display: none"></slot>
	`;
});

const codeBlockStyles = css`
	pre {
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 0.5em;
		margin: 0;
		overflow-x: auto;
		white-space: initial;
	}
	code {
		padding: 1em;
		display: block;
		white-space: pre;
	}
`;
