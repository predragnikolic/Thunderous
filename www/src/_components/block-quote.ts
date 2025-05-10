import { component, html, css } from 'thunderous';
import { theme } from '../_styles/theme';

export const BlockQuote = component(({ adoptStyleSheet }) => {
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
		padding: 0.5em 1em;
		background-color: rgba(255, 255, 255, 0.05);
		border-left: 4px solid var(--color-site-2);
		margin: 0.5em 1em;
		color: var(--color-site-1-c-1);
	}
`;
