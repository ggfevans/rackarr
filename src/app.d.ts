/**
 * Application Type Declarations
 *
 * Custom type declarations for Vite asset imports
 */

// WebP image imports
declare module '*.webp' {
	const src: string;
	export default src;
}

// PNG image imports
declare module '*.png' {
	const src: string;
	export default src;
}

// JPEG image imports
declare module '*.jpg' {
	const src: string;
	export default src;
}

declare module '*.jpeg' {
	const src: string;
	export default src;
}
