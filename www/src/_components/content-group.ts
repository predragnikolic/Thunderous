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
		gap: 1em;
		padding: 2em;
	}
`;
