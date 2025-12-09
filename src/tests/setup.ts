import '@testing-library/jest-dom/vitest';

// Global test setup for Rackarr
// This file is loaded before all tests via vitest.config.ts setupFiles

// Mock window.matchMedia for responsive component testing
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false, // Default to full mode (not hamburger mode)
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => true
	})
});
