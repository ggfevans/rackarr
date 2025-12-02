/**
 * Device Filters
 * Utility functions for searching and grouping devices
 */

import type { Device, DeviceCategory } from '$lib/types';

/**
 * Search devices by name (case-insensitive)
 * @param devices - Array of devices to search
 * @param query - Search query string
 * @returns Filtered array of devices matching the query
 */
export function searchDevices(devices: Device[], query: string): Device[] {
	if (!query.trim()) {
		return devices;
	}

	const normalizedQuery = query.toLowerCase().trim();

	return devices.filter((device) => device.name.toLowerCase().includes(normalizedQuery));
}

/**
 * Group devices by category
 * @param devices - Array of devices to group
 * @returns Map of category to devices in that category
 */
export function groupDevicesByCategory(devices: Device[]): Map<DeviceCategory, Device[]> {
	const groups = new Map<DeviceCategory, Device[]>();

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
		other: 'Other'
	};

	return names[category] ?? category;
}
