import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		setupFiles: ['src/tests/setup.ts'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/tests/']
		},
		alias: {
			// Ensure Svelte uses the browser build in tests
			svelte: 'svelte'
		}
	},
	resolve: {
		alias: {
			$lib: '/src/lib'
		},
		conditions: ['browser']
	}
});
