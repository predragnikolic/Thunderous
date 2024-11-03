import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';
import logo from '../thunder-solutions-logo-light.svg';

export const DocPage = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<th-page>
			<div class="doc-page">
				<header>
					<h1 class="site-heading">
						<th-invisible-link href="/">
							<img class="logo" src="${logo}" alt="Thunder Solutions Logo" />
							<span>Thunderous</span>
						</th-invisible-link>
					</h1>
					<nav>
						<ul>
							<li>
								<th-link href="/docs/" class="link">Quick Start</th-link>
							</li>
							<li>
								<h3>Overview</h3>
								<ul>
									<li>
										<th-link href="/docs/lifecycle-methods/" class="link">Lifecycle Methods</th-link>
									</li>
									<li>
										<th-link href="/docs/root-and-internals/" class="link">Root and Element Internals</th-link>
									</li>
									<li>
										<th-link href="/docs/adopted-stylesheets/" class="link">Adopted Stylesheets</th-link>
									</li>
									<li>
										<th-link href="/docs/event-binding/" class="link">Event Binding</th-link>
									</li>
									<li>
										<th-link href="/docs/refs/" class="link">Refs</th-link>
									</li>
									<li>
										<th-link href="/docs/defining-custom-elements/" class="link">Defining Custom Elements</th-link>
									</li>
								</ul>
							</li>
							<li>
								<h3>Signals</h3>
								<ul>
									<li>
										<th-link href="/docs/signals/" class="link">Signals Overview</th-link>
									</li>
									<li>
										<th-link href="/docs/binding-signals/" class="link">Binding Signals</th-link>
									</li>
									<li>
										<th-link href="/docs/attribute-signals/" class="link">Attribute Signals</th-link>
									</li>
									<li>
										<th-link href="/docs/property-signals/" class="link">Property Signals</th-link>
									</li>
									<li>
										<th-link href="/docs/derived-signals/" class="link">Derived Signals</th-link>
									</li>
									<li>
										<th-link href="/docs/effects/" class="link">Effects</th-link>
									</li>
									<li>
										<th-link href="/docs/debugging-signals/" class="link">Debugging Signals</th-link>
									</li>
								</ul>
							</li>
						</ul>
					</nav>
				</header>
				<main>
					<slot></slot>
				</main>
			</div>
		</th-page>
	`;
});

const styles = css`
	.doc-page {
		height: 100%;
		display: grid;
		grid-template-columns: minmax(16em, 1fr) minmax(0, 2fr);
		margin: 0 auto;
	}
	header {
		display: flex;
		flex-direction: column;
		align-items: end;
		background-color: var(--color-site-1-1);
		color: white;
		padding: 1em;
		padding-right: 2em;
	}
	header,
	main {
		overflow: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.1) var(--color-site-1-1);
	}
	.site-heading {
		margin: 0;
		font-size: 1.5em;
		display: flex;
		align-items: center;
		gap: 0.3em;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		padding-bottom: 0.5em;
		width: 100%;
		max-width: 9em;
	}
	.logo {
		height: 1.2em;
		width: 1.2em;
		object-fit: contain;
	}
	main {
		background-color: var(--color-site-1);
	}
	ul {
		list-style: none;
	}
	ul,
	li,
	h3 {
		margin: 0;
		padding: 0;
	}
	ul {
		display: grid;
		gap: 1em;
		padding: 1em 0;
	}
	li > ul {
		padding-left: 1em;
	}
	.link::part(a) {
		box-sizing: border-box;
	}
`;
