/**
 * Brand Pack Index
 * Exports all brand-specific device packs
 */

import type { DeviceType } from '$lib/types';
import { ubiquitiDevices } from './ubiquiti';
import { mikrotikDevices } from './mikrotik';
import { synologyDevices } from './synology';
import { apcDevices } from './apc';
import { dellDevices } from './dell';
import { supermicroDevices } from './supermicro';

export {
	ubiquitiDevices,
	mikrotikDevices,
	synologyDevices,
	apcDevices,
	dellDevices,
	supermicroDevices
};

/**
 * Brand section data structure
 */
export interface BrandSection {
	id: string;
	title: string;
	devices: DeviceType[];
	defaultExpanded: boolean;
	/** simple-icons slug for brand logo, undefined for fallback icon */
	icon?: string;
}

/**
 * Get all brand pack sections
 * Does not include the generic section (that comes from the layout store)
 */
export function getBrandPacks(): BrandSection[] {
	return [
		// Network Equipment
		{
			id: 'ubiquiti',
			title: 'Ubiquiti',
			devices: ubiquitiDevices,
			defaultExpanded: false,
			icon: 'ubiquiti'
		},
		{
			id: 'mikrotik',
			title: 'MikroTik',
			devices: mikrotikDevices,
			defaultExpanded: false,
			icon: 'mikrotik'
		},
		// Storage
		{
			id: 'synology',
			title: 'Synology',
			devices: synologyDevices,
			defaultExpanded: false,
			icon: 'synology'
		},
		// Power (APC not in simple-icons, will use Lucide Zap fallback)
		{
			id: 'apc',
			title: 'APC',
			devices: apcDevices,
			defaultExpanded: false
		},
		// Servers
		{
			id: 'dell',
			title: 'Dell',
			devices: dellDevices,
			defaultExpanded: false,
			icon: 'dell'
		},
		{
			id: 'supermicro',
			title: 'Supermicro',
			devices: supermicroDevices,
			defaultExpanded: false,
			icon: 'supermicro'
		}
	];
}

/**
 * Get devices for a specific brand
 */
export function getBrandDevices(brandId: string): DeviceType[] {
	switch (brandId) {
		case 'ubiquiti':
			return ubiquitiDevices;
		case 'mikrotik':
			return mikrotikDevices;
		case 'synology':
			return synologyDevices;
		case 'apc':
			return apcDevices;
		case 'dell':
			return dellDevices;
		case 'supermicro':
			return supermicroDevices;
		default:
			return [];
	}
}

/**
 * Find a device by slug across all brand packs
 * @returns The DeviceType if found, undefined otherwise
 */
export function findBrandDevice(slug: string): DeviceType | undefined {
	// Search all brand packs
	const allDevices = [
		...ubiquitiDevices,
		...mikrotikDevices,
		...synologyDevices,
		...apcDevices,
		...dellDevices,
		...supermicroDevices
	];

	return allDevices.find((d) => d.slug === slug);
}
