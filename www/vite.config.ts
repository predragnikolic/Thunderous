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
		{
			name: 'custom-middleware',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url ?? '';

					// Skip if the URL has an extension
					if (url.includes('.') || url.includes('@')) return next();

					const filePath = `${__dirname}/src${url.replace(/\/$/, '')}/index.html`;

					if (existsSync(filePath) && url.endsWith('/')) {
						next();
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
