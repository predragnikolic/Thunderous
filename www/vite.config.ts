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
					const url = req.url ?? '';

					// Skip assets and vite requests
					if (/\.[a-z]{2,}/i.test(url) || url.includes('@vite')) return next();

					const filePath = `${__dirname}/src${url.replace(/\/$/, '')}/index.html`;

					if (existsSync(filePath)) {
						res.statusCode = 200;
						res.end(readFileSync(filePath));
						console.log(filePath);
					} else {
						const notFoundPath = resolve(__dirname, 'src', '404.html');
						if (existsSync(notFoundPath)) {
							res.statusCode = 404;
							res.end(readFileSync(notFoundPath));
						} else {
							next();
						}
					}
				});
			},
		},
	],
	server: {
		open: true,
	},
});
