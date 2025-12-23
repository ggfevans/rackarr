/**
 * Session persistence utilities
 * Manages auto-save to sessionStorage for work-in-progress protection
 */

import type { Layout } from '$lib/types';
import { LayoutSchema } from '$lib/schemas';

export const STORAGE_KEY = 'rackarr_session';

/**
 * Save layout to sessionStorage
 * @param layout - Layout to save
 */
export function saveToSession(layout: Layout): void {
	try {
		const json = JSON.stringify(layout);
		sessionStorage.setItem(STORAGE_KEY, json);
	} catch (e) {
		// sessionStorage not available or quota exceeded
		console.warn('[rackarr] Failed to save layout to sessionStorage:', e);
	}
}

/**
 * Load layout from sessionStorage
 * @returns Layout if valid session exists, null otherwise
 */
export function loadFromSession(): Layout | null {
	try {
		const json = sessionStorage.getItem(STORAGE_KEY);
		if (!json) return null;

		const parsed: unknown = JSON.parse(json);

		// Validate against current schema
		const result = LayoutSchema.safeParse(parsed);
		if (!result.success) {
			// Invalid or outdated format, clear it
			clearSession();
			return null;
		}

		return result.data as Layout;
	} catch (e) {
		// sessionStorage not available or invalid JSON
		console.warn('[rackarr] Failed to load layout from sessionStorage:', e);
		return null;
	}
}

/**
 * Clear session from sessionStorage
 */
export function clearSession(): void {
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch (e) {
		// sessionStorage not available
		console.warn('[rackarr] Failed to clear sessionStorage:', e);
	}
}

/**
 * Check if a valid session exists
 * @returns true if valid session exists
 */
export function hasSession(): boolean {
	return loadFromSession() !== null;
}
