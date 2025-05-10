import { css, component, html } from 'thunderous';

export const ErrorMessage = component(({ props, adoptStyleSheet }) => {
	const heading = props['heading'];
	adoptStyleSheet(styles);
	return html`
		<div>
			<h1>${heading}</h1>
			<slot></slot>
		</div>
	`;
}, {
  props: ['heading', String]
});

const styles = css`
	:host {
		display: flex;
		place-content: center;
		place-items: center;
		text-align: center;
		padding: 2em;
		padding-bottom: 4em;
		height: 100%;
		box-sizing: border-box;
	}
	h1 {
		font-size: 4em;
		margin: 0;
	}
`;
