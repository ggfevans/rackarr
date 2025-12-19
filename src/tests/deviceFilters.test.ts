import { describe, it, expect } from 'vitest';
import {
	searchDevices,
	groupDevicesByCategory,
	getCategoryDisplayName
} from '$lib/utils/deviceFilters';
import type { DeviceType, DeviceCategory } from '$lib/types';

const createDevice = (slug: string, model: string, category: DeviceCategory): DeviceType => ({
	slug,
	model,
	u_height: 1,
	colour: '#000000',
	category
});

describe('deviceFilters', () => {
	describe('searchDevices', () => {
		const devices: DeviceType[] = [
			createDevice('1', 'Server 1', 'server'),
			createDevice('2', 'Network Switch', 'network'),
			createDevice('3', 'Power Strip', 'power')
		];

		it('returns all devices when query is empty', () => {
			expect(searchDevices(devices, '')).toEqual(devices);
			expect(searchDevices(devices, '   ')).toEqual(devices);
		});

		it('filters devices by name (case-insensitive)', () => {
			expect(searchDevices(devices, 'server')).toHaveLength(1);
			expect(searchDevices(devices, 'SERVER')).toHaveLength(1);
			expect(searchDevices(devices, 'Server')).toHaveLength(1);
		});

		it('returns empty array when no matches', () => {
			expect(searchDevices(devices, 'xyz')).toHaveLength(0);
		});

		it('matches partial strings', () => {
			expect(searchDevices(devices, 'net')).toHaveLength(1);
			expect(searchDevices(devices, 'pow')).toHaveLength(1);
		});
	});

	describe('groupDevicesByCategory', () => {
		const devices: DeviceType[] = [
			createDevice('1', 'Server 1', 'server'),
			createDevice('2', 'Server 2', 'server'),
			createDevice('3', 'Switch', 'network')
		];

		it('groups devices by category', () => {
			const groups = groupDevicesByCategory(devices);
			expect(groups.get('server')).toHaveLength(2);
			expect(groups.get('network')).toHaveLength(1);
		});

		it('returns empty map for empty array', () => {
			const groups = groupDevicesByCategory([]);
			expect(groups.size).toBe(0);
		});
	});

	describe('getCategoryDisplayName', () => {
		it('returns correct display names', () => {
			expect(getCategoryDisplayName('server')).toBe('Servers');
			expect(getCategoryDisplayName('network')).toBe('Network');
			expect(getCategoryDisplayName('patch-panel')).toBe('Patch Panels');
			expect(getCategoryDisplayName('power')).toBe('Power');
			expect(getCategoryDisplayName('storage')).toBe('Storage');
			expect(getCategoryDisplayName('kvm')).toBe('KVM');
			expect(getCategoryDisplayName('av-media')).toBe('AV/Media');
			expect(getCategoryDisplayName('cooling')).toBe('Cooling');
			expect(getCategoryDisplayName('blank')).toBe('Blanks');
			expect(getCategoryDisplayName('other')).toBe('Other');
		});
	});
});
