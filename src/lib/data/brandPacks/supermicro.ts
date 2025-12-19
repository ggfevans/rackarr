/**
 * Supermicro Brand Pack
 * Pre-defined device types for Supermicro rack-mountable servers
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Supermicro device definitions (7 rack-mountable devices)
 */
export const supermicroDevices: DeviceType[] = [
	// ============================================
	// 1U Entry Level Servers (Atom/Xeon-D)
	// ============================================
	{
		slug: 'sys-5018d-fn8t',
		u_height: 1,
		manufacturer: 'Supermicro',
		model: 'SYS-5018D-FN8T',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'sys-5019d-fn8tp',
		u_height: 1,
		manufacturer: 'Supermicro',
		model: 'SYS-5019D-FN8TP',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 1U AMD Single Socket
	// ============================================
	{
		slug: 'as-1115sv-wtnrt',
		u_height: 1,
		manufacturer: 'Supermicro',
		model: 'AS-1115SV-WTNRT',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U Dual Socket Servers (Intel)
	// ============================================
	{
		slug: 'sys-6028r-tr',
		u_height: 2,
		manufacturer: 'Supermicro',
		model: 'SYS-6028R-TR',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'sys-6029p-tr',
		u_height: 2,
		manufacturer: 'Supermicro',
		model: 'SYS-6029P-TR',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U AMD Dual Socket
	// ============================================
	{
		slug: 'as-2124bt-htr',
		u_height: 2,
		manufacturer: 'Supermicro',
		model: 'AS-2124BT-HTR',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 4U Storage Systems
	// ============================================
	{
		slug: 'ssg-6049p-e1cr36h',
		u_height: 4,
		manufacturer: 'Supermicro',
		model: 'SuperStorage 6049P-E1CR36H',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.storage,
		category: 'storage'
	}
];
