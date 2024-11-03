import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const PageHeader = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(pageHeaderStyles);
	return html`
		<header>
			<h2>
				<slot></slot>
			</h2>
		</header>
	`;
});

const pageHeaderStyles = css`
	header {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 0.8em;
		margin: 1em;
		margin-bottom: 0;
	}
	h2 {
		margin: 0;
	}
`;

export const ContentHeader = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(contentHeaderStyles);
	return html`
		<header>
			<h3>
				<slot></slot>
			</h3>
		</header>
	`;
});

const contentHeaderStyles = css`
	h3 {
		margin: 0;
	}
`;
