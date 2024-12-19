import { existsSync, readFileSync, readSync } from 'fs';
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
	plugins: [ViteEjsPlugin()],
	server: {
		open: true,
	},
});
