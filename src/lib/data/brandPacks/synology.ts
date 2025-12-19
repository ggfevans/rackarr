/**
 * Synology Brand Pack
 * Pre-defined device types for Synology rack-mount NAS systems
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Synology device definitions (12 rack-mountable devices)
 */
export const synologyDevices: DeviceType[] = [
	// ============================================
	// 1U Rack-mount NAS (Value/Essential Series)
	// ============================================
	{
		slug: 'rs815-plus',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS815+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs816',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS816',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs819',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS819',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs820-plus',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS820+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs820rp-plus',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS820RP+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs422-plus',
		u_height: 1,
		manufacturer: 'Synology',
		model: 'RS422+',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},

	// ============================================
	// 2U Rack-mount NAS (Performance Series)
	// ============================================
	{
		slug: 'rs1219-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS1219+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs1221-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS1221+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs1221rp-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS1221RP+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs2421-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS2421+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},
	{
		slug: 'rs2421rp-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS2421RP+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	},

	// ============================================
	// Enterprise Series & Flash Storage
	// ============================================
	{
		slug: 'rs3621xs-plus',
		u_height: 2,
		manufacturer: 'Synology',
		model: 'RS3621xs+',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	}
];
