/**
 * v0.2 Starter Device Type Library
 * Common device types pre-populated in new layouts
 */

import type { DeviceType } from '$lib/types/v02';
import type { DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { slugify } from '$lib/utils/slug';

interface StarterDeviceSpec {
	name: string;
	u_height: number;
	category: DeviceCategory;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
	// Server devices
	{ name: '1U Server', u_height: 1, category: 'server' },
	{ name: '2U Server', u_height: 2, category: 'server' },
	{ name: '4U Server', u_height: 4, category: 'server' },

	// Network devices
	{ name: '1U Switch', u_height: 1, category: 'network' },
	{ name: '1U Router', u_height: 1, category: 'network' },
	{ name: '1U Firewall', u_height: 1, category: 'network' },

	// Patch panels
	{ name: '1U Patch Panel', u_height: 1, category: 'patch-panel' },
	{ name: '2U Patch Panel', u_height: 2, category: 'patch-panel' },

	// Power devices
	{ name: '1U PDU', u_height: 1, category: 'power' },
	{ name: '2U UPS', u_height: 2, category: 'power' },
	{ name: '4U UPS', u_height: 4, category: 'power' },

	// Storage devices
	{ name: '2U Storage', u_height: 2, category: 'storage' },
	{ name: '4U Storage', u_height: 4, category: 'storage' },

	// KVM devices
	{ name: '1U KVM', u_height: 1, category: 'kvm' },
	{ name: '1U Console Drawer', u_height: 1, category: 'kvm' },

	// AV/Media devices
	{ name: '1U Receiver', u_height: 1, category: 'av-media' },
	{ name: '2U Amplifier', u_height: 2, category: 'av-media' },

	// Cooling devices
	{ name: '0.5U Blanking Fan', u_height: 0.5, category: 'cooling' },
	{ name: '1U Fan Panel', u_height: 1, category: 'cooling' },

	// Blank panels
	{ name: '0.5U Blank', u_height: 0.5, category: 'blank' },
	{ name: '1U Blank', u_height: 1, category: 'blank' },
	{ name: '2U Blank', u_height: 2, category: 'blank' },

	// Shelf devices
	{ name: '1U Shelf', u_height: 1, category: 'shelf' },
	{ name: '2U Shelf', u_height: 2, category: 'shelf' },
	{ name: '4U Shelf', u_height: 4, category: 'shelf' },

	// Other/Generic devices
	{ name: '1U Generic', u_height: 1, category: 'other' },
	{ name: '2U Generic', u_height: 2, category: 'other' }
];

/**
 * Get the v0.2 starter device type library
 * These are the default device types available in a new layout
 */
export function getStarterLibraryV02(): DeviceType[] {
	return STARTER_DEVICES.map((spec) => ({
		slug: slugify(spec.name),
		u_height: spec.u_height,
		model: spec.name, // Store name as model for display compatibility
		rackarr: {
			colour: CATEGORY_COLOURS[spec.category],
			category: spec.category
		}
	}));
}
