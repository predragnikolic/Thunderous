import { customElement, html } from 'thunderous';

export const Splash = customElement(() => {
	return html`
		<div>
			<h1>Welcome to Thunderous!</h1>
			<p>Thunderous is a simple, fast, and lightweight web component library.</p>
			<a href="/docs/">Get Started</a>
		</div>
	`;
});
