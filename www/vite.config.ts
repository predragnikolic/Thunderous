import { existsSync, readFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

export default defineConfig({
	root: 'src',
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: glob.sync(resolve(__dirname, 'src', '**/*.html')),
		},
	},
	plugins: [
		ViteEjsPlugin(),

		// This only applies to the dev server. This is just to mimic the behavior of Vercel's static server
		{
			name: 'custom-middleware',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url?.replace(/\?.*$/, '') ?? '';
					if (url.includes('.')) return next();
					const potentialPath = resolve(__dirname, 'src', `.${url}/index.html`);
					const exists = existsSync(potentialPath);
					if (url.endsWith('/') && exists) return next();

					// redirect to trailing slash if index.html exists
					// otherwise redirect to 404
					if (exists) {
						res.writeHead(301, {
							Location: `${url}/${req.url?.includes('?') ? '?' + req.url.split('?')[1] : ''}`,
						});
						res.end();
						return;
					} else {
						res.writeHead(301, {
							location: '/404',
						});
						res.end();
						return;
					}
				});
			},
		},
	],
	server: {
		open: true,
	},
});
