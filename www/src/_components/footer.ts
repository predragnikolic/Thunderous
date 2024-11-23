import { css, customElement, derived, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Footer = customElement(({ adoptStyleSheet, attrSignals }) => {
	const [splash] = attrSignals['splash'];
	const splashClass = derived(() => (splash() === '' ? 'splash' : ''));
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<footer class="${splashClass}">
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
	.splash {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}
`;
