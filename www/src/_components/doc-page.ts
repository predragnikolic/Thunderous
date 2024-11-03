import { css, customElement, html } from 'thunderous';
import { theme } from '../_styles/theme';

export const DocPage = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(styles);
	return html`
		<th-page>
			<div class="doc-page">
				<header>
					<div class="header-content">
						<th-invisible-link href="/">
							<h1><img src="/thunder-solutions-logo-light.svg" alt="Thunder Solutions Logo" />Thunderous</h1>
						</th-invisible-link>
						<nav>
							<ul>
								<li>
									<th-link href="/docs/">Getting Started</th-link>
								</li>
							</ul>
						</nav>
					</div>
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
		justify-content: end;
		background-color: var(--color-site-2);
		color: white;
		padding: 1em;
	}
	main {
		background-color: var(--color-site-1);
		padding: 1em;
	}
`;
