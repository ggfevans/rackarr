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
	'cable-management': '#4682B4',
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
	'cable-management',
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
export const CURRENT_VERSION = '0.1.0';

/**
 * Standard rack width in inches (19" rack)
 */
export const STANDARD_RACK_WIDTH = 19;

/**
 * Narrow rack width (10" rack)
 */
export const NARROW_RACK_WIDTH = 10;

/**
 * Allowed rack widths
 */
export const ALLOWED_RACK_WIDTHS: readonly number[] = [10, 19] as const;

/**
 * Default rack view (front-facing)
 */
export const DEFAULT_RACK_VIEW: RackView = 'front';

/**
 * Default device face (front-mounted)
 */
export const DEFAULT_DEVICE_FACE: DeviceFace = 'front';

/**
 * Image Constants (v0.1.0)
 */

/**
 * Supported image MIME types for device images
 */
export const SUPPORTED_IMAGE_FORMATS: readonly string[] = [
	'image/png',
	'image/jpeg',
	'image/webp'
] as const;

/**
 * Maximum image file size in megabytes
 */
export const MAX_IMAGE_SIZE_MB = 5;

/**
 * Maximum image file size in bytes
 */
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * Archive Constants (v0.1.0)
 */

/**
 * New archive file extension (.rackarr.zip)
 */
export const ARCHIVE_EXTENSION = '.rackarr.zip';

/**
 * Layout filename inside the archive
 */
export const LAYOUT_FILENAME = 'layout.json';

/**
 * Images folder inside the archive
 */
export const IMAGES_FOLDER = 'images';
