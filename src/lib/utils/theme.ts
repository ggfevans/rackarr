/**
 * Theme utilities for persistence and document updates
 */

const THEME_STORAGE_KEY = 'rackarr_theme';

export type Theme = 'dark' | 'light';

/**
 * Load theme preference from localStorage
 * @returns The stored theme, or 'dark' as default
 */
export function loadThemeFromStorage(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}
	} catch (e) {
		// localStorage not available (SSR or privacy mode)
		console.warn('[rackarr] Failed to load theme from localStorage:', e);
	}
	return 'dark';
}

/**
 * Save theme preference to localStorage
 * @param theme - Theme to save
 */
export function saveThemeToStorage(theme: Theme): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch (e) {
		// localStorage not available (SSR or privacy mode)
		console.warn('[rackarr] Failed to save theme to localStorage:', e);
	}
}

/**
 * Apply theme to document element
 * @param theme - Theme to apply
 */
export function applyThemeToDocument(theme: Theme): void {
	if (typeof document !== 'undefined') {
		document.documentElement.dataset['theme'] = theme;
	}
}
