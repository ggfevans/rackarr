/**
 * Device Utility Functions
 * Pure functions for device-related operations
 */

import type { DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Generate a unique UUID v4 identifier
 * Uses crypto.randomUUID() if available, falls back to crypto.getRandomValues()
 */
export function generateId(): string {
	// Use native randomUUID if available (requires secure context)
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	// Fallback using crypto.getRandomValues() for broader browser support
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);

	// Set version (4) and variant (8, 9, a, or b) bits per RFC 4122
	// Array is exactly 16 bytes, so indices 6 and 8 are always valid
	bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
	bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant 10xx

	// Convert to hex string with dashes
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Get the default colour for a device category
 */
export function getDefaultColour(category: DeviceCategory): string {
	return CATEGORY_COLOURS[category];
}
