import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const DocPage = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<th-page>
			<div class="doc-page">
				<header>
					<h1 class="site-heading">
						<th-invisible-link href="/">
							<img class="logo" src="/thunder-solutions-logo-light.svg" alt="Thunder Solutions Logo" />
							<span>Thunderous</span>
						</th-invisible-link>
					</h1>
					<nav>
						<ul>
							<li>
								<th-link href="/docs/" class="link">Getting Started</th-link>
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
		grid-template-columns: minmax(15em, 1fr) minmax(0, 3fr);
		margin: 0 auto;
	}
	header {
		display: flex;
		flex-direction: column;
		align-items: end;
		background-color: var(--color-site-2);
		color: white;
		padding: 1em;
	}
	header,
	main {
		overflow: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.1) var(--color-site-2);
	}
	.site-heading {
		margin: 0;
		font-size: 1.5em;
		display: flex;
		align-items: center;
		gap: 0.3em;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		padding-bottom: 0.5em;
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
	li {
		margin: 0;
		padding: 0;
	}
	ul {
		display: grid;
		gap: 1em;
		padding: 1em 0;
	}
	.link::part(a) {
		width: 100%;
		display: block;
		box-sizing: border-box;
	}
`;
