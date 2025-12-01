/**
 * Color contrast utilities for WCAG compliance verification.
 * WCAG AA Requirements:
 * - Normal text: 4.5:1 minimum
 * - Large text (18px+ or 14px+ bold): 3:1 minimum
 * - UI components and graphics: 3:1 minimum
 */

/**
 * Parse a hex color string to RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	// Remove # if present
	hex = hex.replace(/^#/, '');

	// Handle shorthand (3 chars)
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}

	const num = parseInt(hex, 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255
	};
}

/**
 * Calculate relative luminance of a color.
 * Based on WCAG 2.1 definition.
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const sRGB = c / 255;
		return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors.
 * @see https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 * @returns Contrast ratio (e.g., 4.5 for 4.5:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
	const rgb1 = hexToRgb(color1);
	const rgb2 = hexToRgb(color2);

	const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
	const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA for normal text.
 * Requires 4.5:1 contrast ratio.
 */
export function meetsNormalTextContrast(foreground: string, background: string): boolean {
	return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if a color combination meets WCAG AA for large text.
 * Requires 3:1 contrast ratio.
 * Large text: 18px+ or 14px+ bold.
 */
export function meetsLargeTextContrast(foreground: string, background: string): boolean {
	return getContrastRatio(foreground, background) >= 3;
}

/**
 * Check if a color combination meets WCAG AA for UI components.
 * Requires 3:1 contrast ratio.
 */
export function meetsUIComponentContrast(foreground: string, background: string): boolean {
	return getContrastRatio(foreground, background) >= 3;
}

/**
 * Token color values for testing.
 * These match the values in tokens.css.
 */
export const tokenColors = {
	// Neutrals
	'neutral-50': '#fafafa',
	'neutral-100': '#f4f4f5',
	'neutral-200': '#e4e4e7',
	'neutral-300': '#d4d4d8',
	'neutral-400': '#a1a1aa',
	'neutral-500': '#71717a',
	'neutral-600': '#52525b',
	'neutral-700': '#3f3f46',
	'neutral-800': '#27272a',
	'neutral-900': '#18181b',
	'neutral-950': '#09090b',

	// Blue (Primary)
	'blue-500': '#3b82f6',
	'blue-600': '#2563eb',
	'blue-700': '#1d4ed8',

	// Red (Error)
	'red-500': '#ef4444',
	'red-600': '#dc2626',

	// Green (Success)
	'green-500': '#22c55e',
	'green-600': '#16a34a',

	// Amber (Warning)
	'amber-500': '#f59e0b',
	'amber-600': '#d97706'
} as const;

/**
 * Dark theme semantic colors.
 */
export const darkThemeColors = {
	bg: tokenColors['neutral-950'],
	surface: tokenColors['neutral-900'],
	surfaceRaised: tokenColors['neutral-800'],
	text: tokenColors['neutral-50'],
	textMuted: tokenColors['neutral-400'],
	textDisabled: tokenColors['neutral-600'],
	selection: tokenColors['blue-500'],
	focusRing: tokenColors['blue-500'],
	error: tokenColors['red-500'],
	success: tokenColors['green-500'],
	warning: tokenColors['amber-500']
};

/**
 * Light theme semantic colors.
 */
export const lightThemeColors = {
	bg: tokenColors['neutral-50'],
	surface: '#ffffff',
	surfaceRaised: tokenColors['neutral-100'],
	text: tokenColors['neutral-950'],
	textMuted: tokenColors['neutral-600'],
	textDisabled: tokenColors['neutral-400'],
	selection: tokenColors['blue-600'],
	focusRing: tokenColors['blue-600'],
	error: tokenColors['red-600'],
	success: tokenColors['green-600'],
	warning: tokenColors['amber-600']
};
