import { html, css, customElement } from 'thunderous';
import { theme } from '../_styles/theme';

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

export const CodeBlock = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(codeBlockStyles);
	return html`<pre><code><slot></slot></code></pre>`;
});

const codeBlockStyles = css`
	pre {
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 0.5em;
		padding: 1em;
		margin: 0;
		overflow-x: auto;
	}
`;
