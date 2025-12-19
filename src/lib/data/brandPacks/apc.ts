/**
 * APC Brand Pack
 * Pre-defined device types for APC UPS and PDU power infrastructure
 * Source: NetBox community devicetype-library
 */

import type { DeviceType } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

/**
 * APC device definitions (10 rack-mountable devices)
 */
export const apcDevices: DeviceType[] = [
	// ============================================
	// Smart-UPS - Rack Mount
	// ============================================
	{
		slug: 'smt1000rmi2uc',
		u_height: 2,
		manufacturer: 'APC',
		model: 'SMT1000RMI2UC',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'smt1500rm1u',
		u_height: 1,
		manufacturer: 'APC',
		model: 'SMT1500RM1U',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'smt1500rmi2uc',
		u_height: 2,
		manufacturer: 'APC',
		model: 'SMT1500RMI2UC',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'smc1500-2uc',
		u_height: 2,
		manufacturer: 'APC',
		model: 'SMC1500-2UC',
		is_full_depth: true,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},

	// ============================================
	// Basic Rack PDUs (1U Horizontal)
	// ============================================
	{
		slug: 'ap9559',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9559',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'ap9560',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9560',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'ap9562',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9562',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'ap9568',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9568',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'ap9570',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9570',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	},
	{
		slug: 'ap9571a',
		u_height: 1,
		manufacturer: 'APC',
		model: 'AP9571A',
		is_full_depth: false,
		colour: CATEGORY_COLOURS.power,
		category: 'power'
	}
];
