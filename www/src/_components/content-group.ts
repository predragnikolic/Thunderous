import { html, css, customElement } from 'thunderous';
import { theme } from '../_styles/theme';

export const ContentGroup = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`<div><slot></slot></div>`;
});

const styles = css`
	div {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1em;
		padding: 2em 4em;
		max-width: 50em;
	}
`;
