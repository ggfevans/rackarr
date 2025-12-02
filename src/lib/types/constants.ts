/**
 * Rackarr Constants
 * Based on spec.md Section 18.2 and other sections
 */

import type { DeviceCategory, RackView, DeviceFace } from './index';

/**
 * Default colours for each device category
 * From spec Section 18.2
 */
export const CATEGORY_COLOURS: Record<DeviceCategory, string> = {
	server: '#4A90D9',
	network: '#7B68EE',
	'patch-panel': '#708090',
	power: '#DC143C',
	storage: '#228B22',
	kvm: '#FF8C00',
	'av-media': '#9932CC',
	cooling: '#00CED1',
	shelf: '#8B4513',
	blank: '#2F4F4F',
	other: '#808080'
} as const;

/**
 * All device categories for iteration
 */
export const ALL_CATEGORIES: readonly DeviceCategory[] = [
	'server',
	'network',
	'patch-panel',
	'power',
	'storage',
	'kvm',
	'av-media',
	'cooling',
	'shelf',
	'blank',
	'other'
] as const;

/**
 * Common rack heights for quick selection
 */
export const COMMON_RACK_HEIGHTS: readonly number[] = [12, 18, 24, 42] as const;

/**
 * Rack height constraints
 */
export const MIN_RACK_HEIGHT = 1;
export const MAX_RACK_HEIGHT = 100;

/**
 * Device height constraints
 */
export const MIN_DEVICE_HEIGHT = 0.5;
export const MAX_DEVICE_HEIGHT = 42;

/**
 * Maximum number of racks allowed
 * v0.1.1: Single rack mode - multi-rack planned for v0.3
 */
export const MAX_RACKS = 1;

/**
 * Current layout schema version
 */
export const CURRENT_VERSION = '0.2.0';

/**
 * Standard rack width in inches (19" rack)
 */
export const STANDARD_RACK_WIDTH = 19;

/**
 * Default rack view (front-facing)
 */
export const DEFAULT_RACK_VIEW: RackView = 'front';

/**
 * Default device face (front-mounted)
 */
export const DEFAULT_DEVICE_FACE: DeviceFace = 'front';
