import { css, component, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Text = component(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`<p><slot></slot></p>`;
});

const styles = css`
	p {
		margin: 0;
	}
`;
