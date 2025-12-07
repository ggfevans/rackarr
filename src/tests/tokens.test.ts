import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Design Token System', () => {
	let tokensCSS: string;

	beforeAll(() => {
		// Read the tokens.css file content directly
		const tokensPath = resolve(__dirname, '../lib/styles/tokens.css');
		tokensCSS = readFileSync(tokensPath, 'utf-8');
	});

	describe('Primitives - Spacing', () => {
		it('defines spacing scale from --space-0 to --space-12', () => {
			const spacings = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];
			spacings.forEach((n) => {
				expect(tokensCSS).toContain(`--space-${n}:`);
			});
		});
	});

	describe('Primitives - Colors', () => {
		it('defines neutral color palette', () => {
			const neutrals = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
			neutrals.forEach((n) => {
				expect(tokensCSS).toContain(`--neutral-${n}:`);
			});
		});

		it('defines blue (primary) color palette', () => {
			const blues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
			blues.forEach((n) => {
				expect(tokensCSS).toContain(`--blue-${n}:`);
			});
		});

		it('defines semantic color palette (red, green, amber)', () => {
			expect(tokensCSS).toContain('--red-500:');
			expect(tokensCSS).toContain('--green-500:');
			expect(tokensCSS).toContain('--amber-500:');
		});
	});

	describe('Primitives - Typography', () => {
		it('defines font size scale', () => {
			const sizes = ['xs', 'sm', 'base', 'md', 'lg', 'xl'];
			sizes.forEach((size) => {
				expect(tokensCSS).toContain(`--font-size-${size}:`);
			});
		});

		it('defines font weight scale', () => {
			const weights = ['normal', 'medium', 'semibold', 'bold'];
			weights.forEach((weight) => {
				expect(tokensCSS).toContain(`--font-weight-${weight}:`);
			});
		});
	});

	describe('Primitives - Borders and Shadows', () => {
		it('defines border radius scale', () => {
			const radii = ['sm', 'md', 'lg', 'full'];
			radii.forEach((r) => {
				expect(tokensCSS).toContain(`--radius-${r}:`);
			});
		});

		it('defines shadow scale', () => {
			const shadows = ['sm', 'md', 'lg'];
			shadows.forEach((s) => {
				expect(tokensCSS).toContain(`--shadow-${s}:`);
			});
		});
	});

	describe('Primitives - Timing', () => {
		it('defines duration tokens', () => {
			const durations = ['fast', 'normal', 'slow'];
			durations.forEach((d) => {
				expect(tokensCSS).toContain(`--duration-${d}:`);
			});
		});

		it('defines easing tokens', () => {
			const easings = ['out', 'in-out', 'spring'];
			easings.forEach((e) => {
				expect(tokensCSS).toContain(`--ease-${e}:`);
			});
		});
	});

	describe('Semantic Tokens', () => {
		it('defines background tokens', () => {
			expect(tokensCSS).toContain('--colour-bg:');
			expect(tokensCSS).toContain('--colour-surface:');
		});

		it('defines text tokens', () => {
			expect(tokensCSS).toContain('--colour-text:');
			expect(tokensCSS).toContain('--colour-text-muted:');
		});

		it('defines border tokens', () => {
			expect(tokensCSS).toContain('--colour-border:');
		});

		it('defines interactive tokens', () => {
			expect(tokensCSS).toContain('--colour-selection:');
			expect(tokensCSS).toContain('--colour-focus-ring:');
		});

		it('defines drag and drop tokens', () => {
			expect(tokensCSS).toContain('--colour-dnd-valid:');
			expect(tokensCSS).toContain('--colour-dnd-invalid:');
		});
	});

	describe('Component Tokens', () => {
		it('defines rack tokens', () => {
			expect(tokensCSS).toContain('--rack-width:');
			expect(tokensCSS).toContain('--rack-u-height:');
		});

		it('defines toolbar tokens', () => {
			expect(tokensCSS).toContain('--toolbar-height:');
		});

		it('defines drawer tokens', () => {
			expect(tokensCSS).toContain('--drawer-width:');
		});
	});

	describe('Theme Support', () => {
		it('has dark theme defaults in :root', () => {
			// Dark theme is the default in :root
			expect(tokensCSS).toContain(':root {');
			expect(tokensCSS).toContain('--colour-bg: var(--neutral-950)');
		});

		it('has light theme overrides', () => {
			expect(tokensCSS).toMatch(/\[data-theme='light'\]/);
			// Verify light theme overrides background
			expect(tokensCSS).toContain("[data-theme='light']");
		});
	});
});
