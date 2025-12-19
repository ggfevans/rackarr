/**
 * Dell Brand Pack
 * Pre-defined device types for Dell PowerEdge rack-mountable servers
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * Dell PowerEdge device definitions (25 rack-mountable servers)
 */
export const dellDevices: DeviceType[] = [
	// ============================================
	// 1U Servers - Current Generation
	// ============================================
	{
		slug: 'poweredge-r650',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R650',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r660',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R660',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 1U Servers - Previous Generations
	// ============================================
	{
		slug: 'poweredge-r640',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R640',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r630',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R630',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r620',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R620',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r610',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R610',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U Servers - Current Generation
	// ============================================
	{
		slug: 'poweredge-r750',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R750',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r750xs',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R750xs',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r760',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R760',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U Servers - Previous Generations
	// ============================================
	{
		slug: 'poweredge-r740',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R740',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r740xd',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R740xd',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r730',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R730',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r730xd',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R730xd',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r720',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R720',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r720xd',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R720xd',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r710',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R710',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U Servers - AMD EPYC
	// ============================================
	{
		slug: 'poweredge-r6515',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R6515',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r6525',
		u_height: 1,
		manufacturer: 'Dell',
		model: 'PowerEdge R6525',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r7515',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R7515',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r7525',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R7525',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},

	// ============================================
	// 2U Servers - Entry Level
	// ============================================
	{
		slug: 'poweredge-r550',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R550',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r540',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R540',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r530',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R530',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r520',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R520',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	},
	{
		slug: 'poweredge-r510',
		u_height: 2,
		manufacturer: 'Dell',
		model: 'PowerEdge R510',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.server,
		category: 'server'
	}
];
