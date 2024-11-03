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
		padding-left: 1em;
		border-left: 4px solid var(--color-site-2);
	}
`;
