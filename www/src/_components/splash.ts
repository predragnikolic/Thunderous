import { css, customElement, html } from 'thunderous';
import logo from '../thunder-solutions-logo-light.svg';

export const Splash = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(styles);
	return html`
		<main>
			<header>
				<h1><img src="${logo}" alt="Thunder Solutions Logo" /><span>Thunderous</span></h1>
				<h2>Building web components has never been easier.</h2>
			</header>
			<p>Thunderous is a functional-style web component authoring library, supercharged with signals!</p>
			<th-link-button href="/docs/">Get Started</th-link-button>
		</main>
	`;
});

const styles = css`
	main {
		display: grid;
		gap: 3em;
		align-content: center;
		place-items: center;
		height: 100vh;
		background-image: linear-gradient(135deg, var(--color-site-3), var(--color-site-2));
		text-align: center;
		padding-bottom: 6em;
		box-sizing: border-box;
	}
	img {
		height: 1em;
		width: 1em;
	}
	h1 {
		font-size: 6em;
		display: flex;
		gap: 0.3em;
		align-items: center;
		margin: 0;
	}
	h2 {
		margin: 0;
	}
	p {
		margin: 0;
	}
	a {
		color: blue;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
	a:active {
		color: green;
	}
`;
