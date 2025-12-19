/**
 * Device Filters
 * Utility functions for searching and grouping devices
 */

import type { DeviceType, DeviceCategory } from '$lib/types';

/**
 * Search device types by model/slug (case-insensitive)
 * @param devices - Array of device types to search
 * @param query - Search query string
 * @returns Filtered array of device types matching the query
 */
export function searchDevices(devices: DeviceType[], query: string): DeviceType[] {
	if (!query.trim()) {
		return devices;
	}

	const normalizedQuery = query.toLowerCase().trim();

	return devices.filter((device) => {
		const name = device.model ?? device.slug;
		return name.toLowerCase().includes(normalizedQuery);
	});
}

/**
 * Group device types by category
 * @param devices - Array of device types to group
 * @returns Map of category to device types in that category
 */
export function groupDevicesByCategory(devices: DeviceType[]): Map<DeviceCategory, DeviceType[]> {
	const groups = new Map<DeviceCategory, DeviceType[]>();

	for (const device of devices) {
		const existing = groups.get(device.category) ?? [];
		groups.set(device.category, [...existing, device]);
	}

	return groups;
}

/**
 * Get display name for a device category
 * @param category - Device category
 * @returns Human-readable category name
 */
export function getCategoryDisplayName(category: DeviceCategory): string {
	const names: Record<DeviceCategory, string> = {
		server: 'Servers',
		network: 'Network',
		'patch-panel': 'Patch Panels',
		power: 'Power',
		storage: 'Storage',
		kvm: 'KVM',
		'av-media': 'AV/Media',
		cooling: 'Cooling',
		shelf: 'Shelves',
		blank: 'Blanks',
		'cable-management': 'Cable Management',
		other: 'Other'
	};

	return names[category] ?? category;
}
