import { glob } from 'glob';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: glob.sync(resolve(__dirname, 'src', '**/*.html')),
		},
	},
	server: {
		open: true,
	},
});
