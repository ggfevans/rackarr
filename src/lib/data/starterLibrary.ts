/**
 * Starter Device Type Library
 * Common device types pre-populated in new layouts
 */

import type { DeviceType, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { slugify } from '$lib/utils/slug';

interface StarterDeviceSpec {
	name: string;
	u_height: number;
	category: DeviceCategory;
	is_full_depth?: boolean; // Defaults to true; false for half-depth devices
	// Power device properties (va_rating for UPS devices)
	va_rating?: number;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
	// Server devices (3)
	{ name: '1U Server', u_height: 1, category: 'server' },
	{ name: '2U Server', u_height: 2, category: 'server' },
	{ name: '4U Server', u_height: 4, category: 'server' },

	// Network devices (3)
	{ name: '24-Port Switch', u_height: 1, category: 'network' },
	{ name: '48-Port Switch', u_height: 1, category: 'network' },
	{ name: '1U Router/Firewall', u_height: 1, category: 'network' },

	// Patch panels (2) - half-depth
	{ name: '24-Port Patch Panel', u_height: 1, category: 'patch-panel', is_full_depth: false },
	{ name: '48-Port Patch Panel', u_height: 2, category: 'patch-panel', is_full_depth: false },

	// Storage devices (3)
	{ name: '1U Storage', u_height: 1, category: 'storage' },
	{ name: '2U Storage', u_height: 2, category: 'storage' },
	{ name: '4U Storage', u_height: 4, category: 'storage' },

	// Power devices (3)
	{ name: '1U PDU', u_height: 1, category: 'power' },
	{ name: '2U UPS', u_height: 2, category: 'power', va_rating: 1500 },
	{ name: '4U UPS', u_height: 4, category: 'power', va_rating: 3000 },

	// KVM devices (2)
	{ name: '1U KVM', u_height: 1, category: 'kvm' },
	{ name: '1U Console Drawer', u_height: 1, category: 'kvm' },

	// AV/Media devices (2)
	{ name: '1U Receiver', u_height: 1, category: 'av-media' },
	{ name: '2U Amplifier', u_height: 2, category: 'av-media' },

	// Cooling devices (1)
	{ name: '1U Fan Panel', u_height: 1, category: 'cooling' },

	// Blank panels (3) - half-depth
	{ name: '0.5U Blank', u_height: 0.5, category: 'blank', is_full_depth: false },
	{ name: '1U Blank', u_height: 1, category: 'blank', is_full_depth: false },
	{ name: '2U Blank', u_height: 2, category: 'blank', is_full_depth: false },

	// Shelf devices (2) - full depth (shelves span entire rack depth)
	{ name: '1U Shelf', u_height: 1, category: 'shelf', is_full_depth: true },
	{ name: '2U Shelf', u_height: 2, category: 'shelf', is_full_depth: true },

	// Cable management (2) - half-depth
	{ name: '1U Brush Panel', u_height: 1, category: 'cable-management', is_full_depth: false },
	{ name: '1U Cable Management', u_height: 1, category: 'cable-management', is_full_depth: false }
];

// Cached starter library (computed once)
let cachedStarterLibrary: DeviceType[] | null = null;

/**
 * Get the starter device type library
 * These are the default device types available in a new layout
 * Returns a cached copy for performance (called frequently by DevicePalette)
 */
export function getStarterLibrary(): DeviceType[] {
	if (!cachedStarterLibrary) {
		cachedStarterLibrary = STARTER_DEVICES.map((spec) => ({
			slug: slugify(spec.name),
			u_height: spec.u_height,
			model: spec.name,
			is_full_depth: spec.is_full_depth, // undefined means full-depth (true default)
			va_rating: spec.va_rating,
			// Flat structure (not nested in rackarr object)
			colour: CATEGORY_COLOURS[spec.category],
			category: spec.category
		}));
	}
	return cachedStarterLibrary;
}

/**
 * Find a device type in the starter library by slug
 * Used for auto-importing starter devices when placed
 */
export function findStarterDevice(slug: string): DeviceType | undefined {
	return getStarterLibrary().find((d) => d.slug === slug);
}

/**
 * Get set of all starter library slugs for efficient lookup
 */
export function getStarterSlugs(): Set<string> {
	return new Set(getStarterLibrary().map((d) => d.slug));
}
