/**
 * Ubiquiti Brand Pack
 * Pre-defined device types for Ubiquiti networking equipment
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Ubiquiti device definitions (51 rack-mountable devices)
 */
export const ubiquitiDevices: DeviceType[] = [
	// ============================================
	// UniFi Switches - Pro Series
	// ============================================
	{
		slug: 'usw-pro-24',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-24',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-48',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-48',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-24-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-24-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-48-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-48-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// UniFi Switches - Pro Max Series
	// ============================================
	{
		slug: 'usw-pro-max-24',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-24',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-max-24-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-24-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-max-48',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-48',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-max-48-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-48-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-max-16',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-16',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-max-16-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Max-16-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// UniFi Switches - Aggregation & Enterprise
	// ============================================
	{
		slug: 'usw-aggregation',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Aggregation',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-pro-aggregation',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-Aggregation',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-enterprise-24-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Enterprise-24-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-enterprise-48-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Enterprise-48-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// UniFi Switches - Standard Series
	// ============================================
	{
		slug: 'usw-24',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-24',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-48',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-48',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-24-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-24-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-48-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-48-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-16-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-16-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// UniFi Switches - Lite Series
	// ============================================
	{
		slug: 'usw-lite-16-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Lite-16-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'usw-lite-8-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Lite-8-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// UniFi Switches - XG Series
	// ============================================
	{
		slug: 'usw-pro-xg-8-poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USW-Pro-XG-8-PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'us-16-xg',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'US-16-XG',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'us-xg-6poe',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'US-XG-6PoE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// Legacy UniFi Switches (US Series)
	// ============================================
	{
		slug: 'us-24-250w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'US-24-250W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'us-24-500w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'US-24-500W',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'us-48-500w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'US-48-500W',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// EdgeSwitch Series
	// ============================================
	{
		slug: 'es-16-150w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-16-150W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-24-250w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-24-250W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-24-500w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-24-500W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-24-lite',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-24-Lite',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-48-500w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-48-500W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-48-750w',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-48-750W',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-48-lite',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-48-Lite',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'es-16-xg',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ES-16-XG',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// Dream Machines
	// ============================================
	{
		slug: 'udm-pro',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UDM-Pro',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'udm-se',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UDM-SE',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'udm-pro-max',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UDM-Pro-Max',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// Gateways
	// ============================================
	{
		slug: 'usg-pro-4',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USG-Pro-4',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'uxg-pro',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UXG-Pro',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'uxg-max',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UXG-Max',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// EdgeRouter Series
	// ============================================
	{
		slug: 'er-4',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-4',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'er-6p',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-6P',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'er-8',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-8',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'er-12',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-12',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'er-12p',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-12P',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'erpro-8',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ERPro-8',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},
	{
		slug: 'er-8-xg',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'ER-8-XG',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.network,
		category: 'network'
	},

	// ============================================
	// NVRs (Network Video Recorders)
	// ============================================
	{
		slug: 'unvr',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'UNVR',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'unvr-pro',
		u_height: 2,
		manufacturer: 'Ubiquiti',
		model: 'UNVR-Pro',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'envr',
		u_height: 4,
		manufacturer: 'Ubiquiti',
		model: 'ENVR',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},

	// ============================================
	// Power
	// ============================================
	{
		slug: 'usp-pdu-pro',
		u_height: 1,
		manufacturer: 'Ubiquiti',
		model: 'USP-PDU-Pro',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	}
];
