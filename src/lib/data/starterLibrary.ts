/**
 * Starter Device Library
 * Common devices pre-populated in new layouts
 */

import type { Device, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

interface StarterDeviceSpec {
	name: string;
	height: number;
	category: DeviceCategory;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
	// Server devices
	{ name: '1U Server', height: 1, category: 'server' },
	{ name: '2U Server', height: 2, category: 'server' },
	{ name: '4U Server', height: 4, category: 'server' },

	// Network devices
	{ name: '1U Switch', height: 1, category: 'network' },
	{ name: '1U Router', height: 1, category: 'network' },
	{ name: '1U Firewall', height: 1, category: 'network' },

	// Patch panels
	{ name: '1U Patch Panel', height: 1, category: 'patch-panel' },
	{ name: '2U Patch Panel', height: 2, category: 'patch-panel' },

	// Power devices
	{ name: '1U PDU', height: 1, category: 'power' },
	{ name: '2U UPS', height: 2, category: 'power' },
	{ name: '4U UPS', height: 4, category: 'power' },

	// Storage devices
	{ name: '2U Storage', height: 2, category: 'storage' },
	{ name: '4U Storage', height: 4, category: 'storage' },

	// KVM devices
	{ name: '1U KVM', height: 1, category: 'kvm' },
	{ name: '1U Console Drawer', height: 1, category: 'kvm' },

	// AV/Media devices
	{ name: '1U Receiver', height: 1, category: 'av-media' },
	{ name: '2U Amplifier', height: 2, category: 'av-media' },

	// Cooling devices
	{ name: '0.5U Blanking Fan', height: 0.5, category: 'cooling' },
	{ name: '1U Fan Panel', height: 1, category: 'cooling' },

	// Blank panels
	{ name: '0.5U Blank', height: 0.5, category: 'blank' },
	{ name: '1U Blank', height: 1, category: 'blank' },
	{ name: '2U Blank', height: 2, category: 'blank' },

	// Shelf devices
	{ name: '1U Shelf', height: 1, category: 'shelf' },
	{ name: '2U Shelf', height: 2, category: 'shelf' },
	{ name: '4U Shelf', height: 4, category: 'shelf' },

	// Other/Generic devices
	{ name: '1U Generic', height: 1, category: 'other' },
	{ name: '2U Generic', height: 2, category: 'other' }
];

/**
 * Generate a deterministic ID for a starter device
 */
function generateStarterId(spec: StarterDeviceSpec): string {
	// Use a slug version of the name to ensure uniqueness
	const slug = spec.name.toLowerCase().replace(/\s+/g, '-');
	return `starter-${slug}`;
}

/**
 * Get the starter device library
 * These are the default devices available in a new layout
 */
export function getStarterLibrary(): Device[] {
	return STARTER_DEVICES.map((spec) => ({
		id: generateStarterId(spec),
		name: spec.name,
		height: spec.height,
		category: spec.category,
		colour: CATEGORY_COLOURS[spec.category]
	}));
}
