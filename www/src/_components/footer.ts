import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Footer = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<footer>
			<small>© 2024 Thunder Solutions LLC</small>
		</footer>
	`;
});

const styles = css`
	footer {
		background-color: var(--color-site-1-1);
		color: var(--color-site-1-c);
		padding: 1rem;
		text-align: center;
	}
`;
