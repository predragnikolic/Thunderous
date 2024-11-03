import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Page = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<div class="page">
			<slot></slot>
		</div>
	`;
});

const styles = css`
	.page {
		height: 100%;
		background-color: var(--color-site-1);
		color: var(--color-site-1-c);
		overflow: auto;
	}
`;
