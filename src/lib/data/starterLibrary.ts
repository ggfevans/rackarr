/**
 * Starter Device Type Library
 * Common device types pre-populated in new layouts
 */

import type { DeviceType, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

interface StarterDeviceSpec {
	name: string;
	slug: string; // Explicit slug for backward compatibility
	u_height: number;
	category: DeviceCategory;
	is_full_depth?: boolean; // Defaults to true; false for half-depth devices
	// Power device properties (va_rating for UPS devices)
	va_rating?: number;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
	// Server devices (3) - height shown via badge, not in name
	{ name: 'Server', slug: '1u-server', u_height: 1, category: 'server' },
	{ name: 'Server', slug: '2u-server', u_height: 2, category: 'server' },
	{ name: 'Server', slug: '4u-server', u_height: 4, category: 'server' },

	// Network devices (3)
	{ name: 'Switch (24-Port)', slug: '24-port-switch', u_height: 1, category: 'network' },
	{ name: 'Switch (48-Port)', slug: '48-port-switch', u_height: 1, category: 'network' },
	{ name: 'Router/Firewall', slug: '1u-router-firewall', u_height: 1, category: 'network' },

	// Patch panels (2) - half-depth
	{ name: 'Patch Panel (24-Port)', slug: '24-port-patch-panel', u_height: 1, category: 'patch-panel', is_full_depth: false },
	{ name: 'Patch Panel (48-Port)', slug: '48-port-patch-panel', u_height: 2, category: 'patch-panel', is_full_depth: false },

	// Storage devices (3) - height shown via badge, not in name
	{ name: 'Storage', slug: '1u-storage', u_height: 1, category: 'storage' },
	{ name: 'Storage', slug: '2u-storage', u_height: 2, category: 'storage' },
	{ name: 'Storage', slug: '4u-storage', u_height: 4, category: 'storage' },

	// Power devices (3)
	{ name: 'PDU', slug: '1u-pdu', u_height: 1, category: 'power', is_full_depth: false },
	{ name: 'UPS', slug: '2u-ups', u_height: 2, category: 'power', va_rating: 1500 },
	{ name: 'UPS', slug: '4u-ups', u_height: 4, category: 'power', va_rating: 3000 },

	// KVM devices (2)
	{ name: 'KVM', slug: '1u-kvm', u_height: 1, category: 'kvm' },
	{ name: 'Console Drawer', slug: '1u-console-drawer', u_height: 1, category: 'kvm' },

	// AV/Media devices (2)
	{ name: 'Receiver', slug: '1u-receiver', u_height: 1, category: 'av-media' },
	{ name: 'Amplifier', slug: '2u-amplifier', u_height: 2, category: 'av-media' },

	// Cooling devices (1)
	{ name: 'Fan Panel', slug: '1u-fan-panel', u_height: 1, category: 'cooling' },

	// Blank panels (3) - half-depth, height shown via badge
	{ name: 'Blank', slug: '0-5u-blank', u_height: 0.5, category: 'blank', is_full_depth: false },
	{ name: 'Blank', slug: '1u-blank', u_height: 1, category: 'blank', is_full_depth: false },
	{ name: 'Blank', slug: '2u-blank', u_height: 2, category: 'blank', is_full_depth: false },

	// Shelf devices (2) - full depth, height shown via badge
	{ name: 'Shelf', slug: '1u-shelf', u_height: 1, category: 'shelf', is_full_depth: true },
	{ name: 'Shelf', slug: '2u-shelf', u_height: 2, category: 'shelf', is_full_depth: true },

	// Cable management (2) - half-depth
	{ name: 'Brush Panel', slug: '1u-brush-panel', u_height: 1, category: 'cable-management', is_full_depth: false },
	{ name: 'Cable Management', slug: '1u-cable-management', u_height: 1, category: 'cable-management', is_full_depth: false }
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
			slug: spec.slug, // Use explicit slug for backward compatibility
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
