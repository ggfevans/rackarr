import { describe, it, expect } from 'vitest';
import { validateImportDevice, parseDeviceLibraryImport } from '$lib/utils/import';

describe('validateImportDevice', () => {
	it('accepts valid device', () => {
		const device = { name: 'Server', height: 2, category: 'server' };
		expect(validateImportDevice(device)).toBe(true);
	});

	it('rejects missing name', () => {
		const device = { height: 2, category: 'server' };
		expect(validateImportDevice(device)).toBe(false);
	});

	it('rejects empty name', () => {
		const device = { name: '', height: 2, category: 'server' };
		expect(validateImportDevice(device)).toBe(false);
	});

	it('rejects height < 0.5', () => {
		const device = { name: 'X', height: 0.4, category: 'server' };
		expect(validateImportDevice(device)).toBe(false);
	});

	it('rejects height > 100', () => {
		const device = { name: 'X', height: 101, category: 'server' };
		expect(validateImportDevice(device)).toBe(false);
	});

	it('accepts height of 0.5', () => {
		const device = { name: 'X', height: 0.5, category: 'server' };
		expect(validateImportDevice(device)).toBe(true);
	});

	it('accepts height of 100', () => {
		const device = { name: 'X', height: 100, category: 'server' };
		expect(validateImportDevice(device)).toBe(true);
	});

	it('rejects invalid category', () => {
		const device = { name: 'X', height: 2, category: 'invalid' };
		expect(validateImportDevice(device)).toBe(false);
	});

	it('accepts all valid categories', () => {
		const validCategories = [
			'server',
			'network',
			'patch-panel',
			'power',
			'storage',
			'kvm',
			'av-media',
			'cooling',
			'blank',
			'other'
		];

		for (const category of validCategories) {
			const device = { name: 'Test', height: 2, category };
			expect(validateImportDevice(device)).toBe(true);
		}
	});
});

describe('parseDeviceLibraryImport', () => {
	it('parses valid JSON', () => {
		const json = JSON.stringify({
			name: 'My Library',
			devices: [{ name: 'Server', height: 2, category: 'server' }]
		});
		const result = parseDeviceLibraryImport(json);
		expect(result.devices).toHaveLength(1);
		expect(result.skipped).toBe(0);
		expect(result.devices[0]?.model).toBe('Server');
	});

	it('skips invalid entries and reports count', () => {
		const json = JSON.stringify({
			devices: [
				{ name: 'Valid', height: 2, category: 'server' },
				{ name: 'Invalid', height: -1, category: 'server' }
			]
		});
		const result = parseDeviceLibraryImport(json);
		expect(result.devices).toHaveLength(1);
		expect(result.skipped).toBe(1);
		expect(result.devices[0]?.model).toBe('Valid');
	});

	it('generates unique slug when duplicate exists', () => {
		const existingSlugs = ['server'];
		const json = JSON.stringify({
			devices: [{ name: 'Server', height: 2, category: 'server' }]
		});
		const result = parseDeviceLibraryImport(json, existingSlugs);
		// Model keeps original name, slug gets suffix
		expect(result.devices[0]?.model).toBe('Server');
		expect(result.devices[0]?.slug).toBe('server-imported');
	});

	it('assigns unique slugs to imported devices', () => {
		const json = JSON.stringify({
			devices: [
				{ name: 'Device 1', height: 1, category: 'server' },
				{ name: 'Device 2', height: 2, category: 'network' }
			]
		});
		const result = parseDeviceLibraryImport(json);
		expect(result.devices[0]?.slug).toBeTruthy();
		expect(result.devices[1]?.slug).toBeTruthy();
		expect(result.devices[0]?.slug).not.toBe(result.devices[1]?.slug);
	});

	it('assigns colours to imported devices', () => {
		const json = JSON.stringify({
			devices: [{ name: 'Server', height: 2, category: 'server' }]
		});
		const result = parseDeviceLibraryImport(json);
		expect(result.devices[0]?.rackarr.colour).toBeTruthy();
		expect(result.devices[0]?.rackarr.colour).toMatch(/^#[0-9a-fA-F]{6}$/);
	});

	it('preserves optional notes field as comments', () => {
		const json = JSON.stringify({
			devices: [{ name: 'Server', height: 2, category: 'server', notes: 'Test notes' }]
		});
		const result = parseDeviceLibraryImport(json);
		expect(result.devices[0]?.comments).toBe('Test notes');
	});

	it('returns empty array for invalid JSON', () => {
		const result = parseDeviceLibraryImport('not valid json');
		expect(result.devices).toHaveLength(0);
		expect(result.skipped).toBe(0);
	});

	it('returns empty array for JSON without devices array', () => {
		const result = parseDeviceLibraryImport(JSON.stringify({ name: 'Test' }));
		expect(result.devices).toHaveLength(0);
		expect(result.skipped).toBe(0);
	});

	it('handles multiple duplicates by incrementing suffix', () => {
		const existingSlugs = ['server', 'server-imported'];
		const json = JSON.stringify({
			devices: [{ name: 'Server', height: 2, category: 'server' }]
		});
		const result = parseDeviceLibraryImport(json, existingSlugs);
		// Model keeps original name, slug gets numbered suffix
		expect(result.devices[0]?.model).toBe('Server');
		expect(result.devices[0]?.slug).toBe('server-imported-2');
	});
});
