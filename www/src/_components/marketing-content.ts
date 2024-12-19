import { html, css, customElement } from 'thunderous';
import { theme } from '../_styles/theme';

export const MarketingContent = customElement(({ adoptStyleSheet, connectedCallback, elementRef, refs }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	connectedCallback(() => {
		const isNested = elementRef.parentElement?.closest('th-marketing-content') !== null;
		if (isNested && refs['marketing-content'] !== null) {
			refs['marketing-content'].classList.add('nested');
		}
	});
	return html`<div ref="marketing-content" class="marketing-content"><slot></slot></div>`;
});

const styles = css`
	.marketing-content {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1em;
		max-width: 50em;
		margin: 0 auto;
	}
	.marketing-content:not(.nested) {
		max-width: 100em;
		padding: 2em;
	}
	@media (min-width: 60em) {
		.marketing-content:not(.nested) {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 2em;
			padding: 2em 4em;
		}
	}
`;
