/**
 * Ubiquiti Brand Pack Tests
 */

import { describe, it, expect } from 'vitest';
import { ubiquitiDevices } from '$lib/data/brandPacks/ubiquiti';

describe('Ubiquiti Brand Pack', () => {
	describe('Device Count', () => {
		it('exports correct number of devices', () => {
			expect(ubiquitiDevices).toHaveLength(10);
		});
	});

	describe('Common Properties', () => {
		it('all devices have manufacturer set to Ubiquiti', () => {
			for (const device of ubiquitiDevices) {
				expect(device.manufacturer).toBe('Ubiquiti');
			}
		});

		it('all devices have valid slugs', () => {
			for (const device of ubiquitiDevices) {
				expect(device.slug).toBeDefined();
				expect(device.slug).toMatch(/^[a-z0-9-]+$/);
			}
		});

		it('all devices have valid u_height', () => {
			for (const device of ubiquitiDevices) {
				expect(device.u_height).toBeGreaterThanOrEqual(1);
				expect(device.u_height).toBeLessThanOrEqual(4);
			}
		});

		it('all devices have valid category', () => {
			const validCategories = ['network', 'storage', 'power'];
			for (const device of ubiquitiDevices) {
				expect(validCategories).toContain(device.rackarr.category);
			}
		});

		it('all devices have valid airflow', () => {
			const validAirflows = ['passive', 'front-to-rear', 'rear-to-front', 'side-to-rear'];
			for (const device of ubiquitiDevices) {
				expect(validAirflows).toContain(device.airflow);
			}
		});
	});

	describe('Specific Devices', () => {
		it('includes UDM-Pro with correct properties', () => {
			const udmPro = ubiquitiDevices.find((d) => d.slug === 'udm-pro');
			expect(udmPro).toBeDefined();
			expect(udmPro?.model).toBe('UDM-Pro');
			expect(udmPro?.u_height).toBe(1);
			expect(udmPro?.is_full_depth).toBe(true);
			expect(udmPro?.airflow).toBe('front-to-rear');
			expect(udmPro?.rackarr.category).toBe('network');
		});

		it('includes USP-PDU-Pro with correct properties', () => {
			const pdu = ubiquitiDevices.find((d) => d.slug === 'usp-pdu-pro');
			expect(pdu).toBeDefined();
			expect(pdu?.model).toBe('USP-PDU-Pro');
			expect(pdu?.u_height).toBe(1);
			expect(pdu?.is_full_depth).toBe(false);
			expect(pdu?.airflow).toBe('passive');
			expect(pdu?.rackarr.category).toBe('power');
		});

		it('includes UNVR-Pro with correct properties', () => {
			const unvrPro = ubiquitiDevices.find((d) => d.slug === 'unvr-pro');
			expect(unvrPro).toBeDefined();
			expect(unvrPro?.model).toBe('UNVR-Pro');
			expect(unvrPro?.u_height).toBe(2);
			expect(unvrPro?.is_full_depth).toBe(true);
			expect(unvrPro?.airflow).toBe('front-to-rear');
			expect(unvrPro?.rackarr.category).toBe('storage');
		});
	});

	describe('Slug Uniqueness', () => {
		it('all slugs are unique', () => {
			const slugs = ubiquitiDevices.map((d) => d.slug);
			const uniqueSlugs = new Set(slugs);
			expect(slugs.length).toBe(uniqueSlugs.size);
		});
	});
});
