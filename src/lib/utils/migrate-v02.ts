/**
 * Layout Migration Utilities
 * Convert v0.1/v0.3 layouts to v0.2 format
 */

import type { Layout as LegacyLayout, Device } from '$lib/types';
import type { Layout, DeviceType, PlacedDevice, Rack } from '$lib/types/v02';
import type { ImageStoreMap, DeviceImageData } from '$lib/types/images';
import { generateDeviceSlug, ensureUniqueSlug } from './slug';

/**
 * Migration result includes both the layout and the id-to-slug mapping
 * The mapping is needed for image migration
 */
export interface MigrationResult {
	layout: Layout;
	idToSlugMap: Map<string, string>;
}

/**
 * Detect the version of a layout from its structure
 * @param data - Unknown data to check
 * @returns Version string or 'unknown'
 */
export function detectLayoutVersion(data: unknown): string {
	// Check for null/non-objects
	if (data === null || typeof data !== 'object' || Array.isArray(data)) {
		return 'unknown';
	}

	const obj = data as Record<string, unknown>;

	// If version field exists, use it
	if (typeof obj.version === 'string') {
		return obj.version;
	}

	// Infer v0.2 from device_types field
	if ('device_types' in obj && Array.isArray(obj.device_types)) {
		return '0.2.0';
	}

	// Infer v0.3 from deviceLibrary field
	if ('deviceLibrary' in obj && Array.isArray(obj.deviceLibrary)) {
		return '0.3.0';
	}

	return 'unknown';
}

/**
 * Convert a legacy Device to a DeviceType
 */
function convertDeviceToDeviceType(
	device: Device,
	existingSlugs: Set<string>
): { deviceType: DeviceType; slug: string } {
	// Generate slug from manufacturer/model or name
	let rawSlug = generateDeviceSlug(device.manufacturer, device.model, device.name);

	// Handle edge case where all inputs produce empty slug (e.g., whitespace-only name)
	if (!rawSlug) {
		rawSlug = `device-${Date.now()}`;
	}

	// Ensure uniqueness
	const slug = ensureUniqueSlug(rawSlug, existingSlugs);
	existingSlugs.add(slug);

	const deviceType: DeviceType = {
		slug,
		u_height: device.height,
		rackarr: {
			colour: device.colour,
			category: device.category
		}
	};

	// Copy optional fields
	if (device.manufacturer) {
		deviceType.manufacturer = device.manufacturer;
	}
	if (device.model) {
		deviceType.model = device.model;
	}
	if (device.is_full_depth !== undefined) {
		deviceType.is_full_depth = device.is_full_depth;
	}
	if (device.weight !== undefined) {
		deviceType.weight = device.weight;
	}
	if (device.weight_unit === 'kg' || device.weight_unit === 'lb') {
		deviceType.weight_unit = device.weight_unit;
	}
	if (
		device.airflow &&
		[
			'front-to-rear',
			'rear-to-front',
			'left-to-right',
			'right-to-left',
			'side-to-rear',
			'passive'
		].includes(device.airflow)
	) {
		deviceType.airflow = device.airflow as DeviceType['airflow'];
	}
	if (device.notes) {
		deviceType.comments = device.notes;
	}

	return { deviceType, slug };
}

/**
 * Migrate a v0.1/v0.3 layout to v0.2 format
 * @param legacy - Legacy layout to migrate
 * @returns Migration result with layout and id-to-slug mapping
 */
export function migrateToV02(legacy: LegacyLayout): MigrationResult {
	const idToSlugMap = new Map<string, string>();
	const existingSlugs = new Set<string>();

	// Convert deviceLibrary to device_types
	const device_types: DeviceType[] = [];
	for (const device of legacy.deviceLibrary) {
		const { deviceType, slug } = convertDeviceToDeviceType(device, existingSlugs);
		device_types.push(deviceType);
		idToSlugMap.set(device.id, slug);
	}

	// Convert first rack (or create default)
	let rack: Rack;
	if (legacy.racks.length > 0) {
		const legacyRack = legacy.racks[0]!;

		// Convert placed devices, skipping unknown references
		const devices: PlacedDevice[] = [];
		for (const placedDevice of legacyRack.devices) {
			const deviceTypeSlug = idToSlugMap.get(placedDevice.libraryId);
			if (deviceTypeSlug) {
				devices.push({
					device_type: deviceTypeSlug,
					position: placedDevice.position,
					face: placedDevice.face
				});
			}
			// Skip devices with unknown libraryId
		}

		rack = {
			name: legacyRack.name,
			height: legacyRack.height,
			width: legacyRack.width as 10 | 19,
			desc_units: legacyRack.desc_units ?? false,
			form_factor: legacyRack.form_factor ?? '4-post-cabinet',
			starting_unit: legacyRack.starting_unit ?? 1,
			position: legacyRack.position,
			devices
			// view is explicitly NOT included (runtime-only)
		};
	} else {
		// Create default empty rack
		rack = {
			name: 'Rack',
			height: 42,
			width: 19,
			desc_units: false,
			form_factor: '4-post-cabinet',
			starting_unit: 1,
			position: 0,
			devices: []
		};
	}

	// Convert settings
	const settings = {
		display_mode: (legacy.settings?.displayMode ?? 'label') as 'label' | 'image',
		show_labels_on_images: legacy.settings?.showLabelsOnImages ?? true
	};

	const layout: Layout = {
		version: '0.2.0',
		name: legacy.name,
		rack,
		device_types,
		settings
	};

	return { layout, idToSlugMap };
}

/**
 * Migrate images from UUID-keyed map to slug-keyed map
 * @param oldImages - Map of device UUIDs to their images
 * @param idToSlugMap - Map of UUIDs to slugs (from migrateToV02)
 * @returns New map keyed by device slugs
 */
export function migrateImages(
	oldImages: ImageStoreMap,
	idToSlugMap: Map<string, string>
): ImageStoreMap {
	const newImages: ImageStoreMap = new Map();

	for (const [deviceId, imageData] of oldImages) {
		const slug = idToSlugMap.get(deviceId);

		// Skip devices with unknown IDs (no mapping exists)
		if (!slug) {
			continue;
		}

		// Copy the image data to the new map with slug as key
		const newImageData: DeviceImageData = {};
		if (imageData.front) {
			newImageData.front = imageData.front;
		}
		if (imageData.rear) {
			newImageData.rear = imageData.rear;
		}

		newImages.set(slug, newImageData);
	}

	return newImages;
}
