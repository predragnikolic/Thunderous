import { customElement, html, css } from 'thunderous';
import { theme } from '../_styles/theme';

export const BlockQuote = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<blockquote>
			<slot></slot>
		</blockquote>
	`;
});

const styles = css`
	blockquote {
		padding: 0.3em 0;
		padding-left: 1em;
		border-left: 4px solid var(--color-site-2);
		margin: 0.5em 1em;
	}
`;
