import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Header = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<header>
			<h2>
				<slot></slot>
			</h2>
		</header>
	`;
});

const styles = css`
	header {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 0.8em;
		margin: 1em;
	}
	h2 {
		margin: 0;
	}
`;
