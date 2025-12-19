/**
 * Bundled Device Images Manifest
 *
 * Maps device slugs to bundled WebP images using Vite's static asset imports.
 * These images are pre-bundled with the app for immediate display.
 *
 * Images sourced from NetBox Device Type Library (CC0 licensed)
 * https://github.com/netbox-community/devicetype-library
 */

// Server images
import server1uFront from '$lib/assets/device-images/server/1u-server.front.webp';
import server2uFront from '$lib/assets/device-images/server/2u-server.front.webp';
import server4uFront from '$lib/assets/device-images/server/4u-server.front.webp';

// Network images
import switch24portFront from '$lib/assets/device-images/network/24-port-switch.front.webp';
import switch48portFront from '$lib/assets/device-images/network/48-port-switch.front.webp';
import routerFirewallFront from '$lib/assets/device-images/network/1u-router-firewall.front.webp';

// Storage images
import storage1uFront from '$lib/assets/device-images/storage/1u-storage.front.webp';
import storage2uFront from '$lib/assets/device-images/storage/2u-storage.front.webp';
import storage4uFront from '$lib/assets/device-images/storage/4u-storage.front.webp';

// Power images
import ups2uFront from '$lib/assets/device-images/power/2u-ups.front.webp';

// KVM images
import consoleDrawerFront from '$lib/assets/device-images/kvm/1u-console-drawer.front.webp';

// ============================================
// Ubiquiti Brand Pack Images
// ============================================

// Dream Machines
import udmProFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro.front.webp';
import udmProRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro.rear.webp';
import udmProMaxFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro-max.front.webp';
import udmProMaxRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro-max.rear.webp';
import udmSeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro-special-edition.front.webp';
import udmSeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-dream-machine-pro-special-edition.rear.webp';

// NVRs
import unvrFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-protect-network-video-recorder.front.webp';
import unvrRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-protect-network-video-recorder.rear.webp';
import unvrProFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-protect-network-video-recorder-pro.front.webp';
import unvrProRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-protect-network-video-recorder-pro.rear.webp';
import envrFront from '$lib/assets/device-images/ubiquiti/ubiquiti-enterprise-network-video-recorder.front.webp';
import envrRear from '$lib/assets/device-images/ubiquiti/ubiquiti-enterprise-network-video-recorder.rear.webp';

// Gateways
import usgProFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-security-gateway-pro.front.webp';
import usgProRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-security-gateway-pro.rear.webp';
import uxgProFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-gateway-pro.front.webp';

// Pro Switches
import uswPro24Front from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-24-pro.front.webp';
import uswPro24Rear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-24-pro.rear.webp';
import uswPro48Front from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-48-pro.front.webp';
import uswPro48Rear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-48-pro.rear.webp';
import uswPro24PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-24-pro-poe-gen2.front.webp';
import uswPro24PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-24-pro-poe-gen2.rear.webp';
import uswPro48PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-48-pro-poe-gen2.front.webp';
import uswPro48PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-48-pro-poe-gen2.rear.webp';

// Pro Max Switches
import uswProMax24Front from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-24.front.webp';
import uswProMax24Rear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-24.rear.webp';
import uswProMax24PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-24-poe.front.webp';
import uswProMax24PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-24-poe.rear.webp';
import uswProMax48Front from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-48.front.webp';
import uswProMax48Rear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-48.rear.webp';
import uswProMax48PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-48-poe.front.webp';
import uswProMax48PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-max-48-poe.rear.webp';

// Aggregation Switches
import uswAggFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-aggregation.front.webp';
import uswProAggFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-aggregation.front.webp';
import uswProAggRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-pro-aggregation.rear.webp';

// Enterprise Switches
import uswEnt24PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-enterprise-24-poe.front.webp';
import uswEnt24PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-enterprise-24-poe.rear.webp';
import uswEnt48PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-enterprise-48-poe.front.webp';
import uswEnt48PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-enterprise-48-poe.rear.webp';

// Standard/Lite Switches
import uswLite8PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-lite-8-poe.front.webp';
import uswLite8PoeRear from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-lite-8-poe.rear.webp';
import usw16PoeFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-16-poe-gen2.front.webp';
import usw48Front from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-48-gen1.front.webp';
import us16XgFront from '$lib/assets/device-images/ubiquiti/ubiquiti-unifi-switch-16-xg.front.webp';

// Power
import uspPduProFront from '$lib/assets/device-images/ubiquiti/ubiquiti-usp-pdu-pro.front.webp';
import uspPduProRear from '$lib/assets/device-images/ubiquiti/ubiquiti-usp-pdu-pro.rear.webp';

/**
 * Bundled image data structure
 */
interface BundledImageSet {
	front?: string;
	rear?: string;
}

/**
 * Map of device slugs to their bundled images
 *
 * Keys match the slugs in device type definitions
 * Only devices with real images are included
 */
const BUNDLED_IMAGES: Record<string, BundledImageSet> = {
	// ============================================
	// Starter Library (Generic Devices)
	// ============================================

	// Servers
	'1u-server': { front: server1uFront },
	'2u-server': { front: server2uFront },
	'4u-server': { front: server4uFront },

	// Network
	'24-port-switch': { front: switch24portFront },
	'48-port-switch': { front: switch48portFront },
	'1u-router-firewall': { front: routerFirewallFront },

	// Storage
	'1u-storage': { front: storage1uFront },
	'2u-storage': { front: storage2uFront },
	'4u-storage': { front: storage4uFront },

	// Power
	'2u-ups': { front: ups2uFront },

	// KVM
	'1u-console-drawer': { front: consoleDrawerFront },

	// ============================================
	// Ubiquiti Brand Pack
	// ============================================

	// Dream Machines
	'ubiquiti-unifi-dream-machine-pro': { front: udmProFront, rear: udmProRear },
	'ubiquiti-unifi-dream-machine-pro-max': { front: udmProMaxFront, rear: udmProMaxRear },
	'ubiquiti-unifi-dream-machine-pro-special-edition': { front: udmSeFront, rear: udmSeRear },

	// NVRs
	'ubiquiti-unifi-protect-network-video-recorder': { front: unvrFront, rear: unvrRear },
	'ubiquiti-unifi-protect-network-video-recorder-pro': { front: unvrProFront, rear: unvrProRear },
	'ubiquiti-enterprise-network-video-recorder': { front: envrFront, rear: envrRear },

	// Gateways
	'ubiquiti-unifi-security-gateway-pro': { front: usgProFront, rear: usgProRear },
	'ubiquiti-unifi-gateway-pro': { front: uxgProFront },

	// Pro Switches
	'ubiquiti-unifi-switch-24-pro': { front: uswPro24Front, rear: uswPro24Rear },
	'ubiquiti-unifi-switch-48-pro': { front: uswPro48Front, rear: uswPro48Rear },
	'ubiquiti-unifi-switch-24-pro-poe-gen2': { front: uswPro24PoeFront, rear: uswPro24PoeRear },
	'ubiquiti-unifi-switch-48-pro-poe-gen2': { front: uswPro48PoeFront, rear: uswPro48PoeRear },

	// Pro Max Switches
	'ubiquiti-unifi-switch-pro-max-24': { front: uswProMax24Front, rear: uswProMax24Rear },
	'ubiquiti-unifi-switch-pro-max-24-poe': { front: uswProMax24PoeFront, rear: uswProMax24PoeRear },
	'ubiquiti-unifi-switch-pro-max-48': { front: uswProMax48Front, rear: uswProMax48Rear },
	'ubiquiti-unifi-switch-pro-max-48-poe': { front: uswProMax48PoeFront, rear: uswProMax48PoeRear },

	// Aggregation Switches
	'ubiquiti-unifi-switch-aggregation': { front: uswAggFront },
	'ubiquiti-unifi-switch-pro-aggregation': { front: uswProAggFront, rear: uswProAggRear },

	// Enterprise Switches
	'ubiquiti-unifi-switch-enterprise-24-poe': { front: uswEnt24PoeFront, rear: uswEnt24PoeRear },
	'ubiquiti-unifi-switch-enterprise-48-poe': { front: uswEnt48PoeFront, rear: uswEnt48PoeRear },

	// Standard/Lite Switches
	'ubiquiti-unifi-switch-lite-8-poe': { front: uswLite8PoeFront, rear: uswLite8PoeRear },
	'ubiquiti-unifi-switch-16-poe-gen2': { front: usw16PoeFront },
	'ubiquiti-unifi-switch-48-gen1': { front: usw48Front },
	'ubiquiti-unifi-switch-16-xg': { front: us16XgFront },

	// Power
	'ubiquiti-usp-pdu-pro': { front: uspPduProFront, rear: uspPduProRear }
};

/**
 * Get a bundled image URL for a device slug and face
 *
 * @param slug - Device type slug (e.g., '1u-server')
 * @param face - 'front' or 'rear'
 * @returns Image URL string or undefined if no bundled image exists
 *
 * @example
 * getBundledImage('1u-server', 'front') // '/assets/server/1u-server.front.webp'
 * getBundledImage('ubiquiti-unifi-dream-machine-pro', 'front') // Returns UDM-Pro front image
 */
export function getBundledImage(slug: string, face: 'front' | 'rear'): string | undefined {
	const imageSet = BUNDLED_IMAGES[slug];
	if (!imageSet) return undefined;
	return imageSet[face];
}

/**
 * Get list of device slugs that have bundled images
 *
 * @returns Array of device slug strings
 *
 * @example
 * getBundledImageSlugs() // ['1u-server', '2u-server', ..., 'ubiquiti-unifi-dream-machine-pro', ...]
 */
export function getBundledImageSlugs(): string[] {
	return Object.keys(BUNDLED_IMAGES);
}

/**
 * Check if a device slug has a bundled image
 *
 * @param slug - Device type slug
 * @returns true if device has at least one bundled image
 */
export function hasBundledImage(slug: string): boolean {
	return slug in BUNDLED_IMAGES;
}
