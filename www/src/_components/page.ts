import { css, component, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const Page = component(({ adoptStyleSheet, props }) => {
	const _splash = props['splash'];
	const splash = _splash() !== null;
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<div class="page ${splash ? 'splash' : ''}">
			<div><slot name="header"></slot></div>
			<div class="page__content"><slot></slot></div>
			<div><slot name="footer"></slot></div>
		</div>
	`;
},{
  props: ['splash', String]
});

const styles = css`
	.page {
		height: 100%;
		background-color: var(--color-site-1);
		color: var(--color-site-1-c);
		overflow: auto;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}
	.splash .page__content {
		display: grid;
		padding: 4em 0;
		gap: 2em;
	}
`;
