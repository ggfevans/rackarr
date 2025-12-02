import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createLayout,
	serializeLayout,
	deserializeLayout,
	validateLayoutStructure
} from '$lib/utils/serialization';
import { CURRENT_VERSION } from '$lib/types/constants';
import type { Layout, Device, Rack } from '$lib/types';

describe('Layout Serialization', () => {
	// Mock Date.now for consistent timestamps in tests
	const mockDate = '2025-01-15T10:30:00.000Z';

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(mockDate));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('createLayout', () => {
		it('sets version to CURRENT_VERSION', () => {
			const layout = createLayout('My Layout');
			expect(layout.version).toBe(CURRENT_VERSION);
		});

		it('sets created and modified to current ISO timestamp', () => {
			const layout = createLayout('My Layout');
			expect(layout.created).toBe(mockDate);
			expect(layout.modified).toBe(mockDate);
		});

		it('initializes with dark theme', () => {
			const layout = createLayout('My Layout');
			expect(layout.settings.theme).toBe('dark');
		});

		it('initializes with default view setting', () => {
			const layout = createLayout('My Layout');
			expect(layout.settings.view).toBe('front');
		});

		it('initializes with default displayMode setting', () => {
			const layout = createLayout('My Layout');
			expect(layout.settings.displayMode).toBe('label');
		});

		it('initializes with default showLabelsOnImages setting', () => {
			const layout = createLayout('My Layout');
			expect(layout.settings.showLabelsOnImages).toBe(false);
		});

		it('initializes with empty racks array', () => {
			const layout = createLayout('My Layout');
			expect(layout.racks).toEqual([]);
		});

		it('initializes with starter device library', () => {
			const layout = createLayout('My Layout');
			expect(layout.deviceLibrary.length).toBe(27);
			expect(layout.deviceLibrary[0]?.id).toMatch(/^starter-/);
		});

		it('uses provided name', () => {
			const layout = createLayout('Custom Name');
			expect(layout.name).toBe('Custom Name');
		});
	});

	describe('serializeLayout', () => {
		it('produces valid JSON string', () => {
			const layout = createLayout('Test');
			const json = serializeLayout(layout);

			expect(() => JSON.parse(json)).not.toThrow();
		});

		it('updates modified timestamp', () => {
			const layout = createLayout('Test');

			// Advance time
			vi.setSystemTime(new Date('2025-01-16T12:00:00.000Z'));

			const json = serializeLayout(layout);
			const parsed = JSON.parse(json) as Layout;

			expect(parsed.modified).toBe('2025-01-16T12:00:00.000Z');
		});

		it('preserves all layout properties', () => {
			const device: Device = {
				id: 'device-1',
				name: 'Test Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server',
				notes: 'Primary server'
			};

			const rack: Rack = {
				id: 'rack-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 5, face: 'front' }]
			};

			const layout: Layout = {
				version: '1.0',
				name: 'My Homelab',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'light' },
				deviceLibrary: [device],
				racks: [rack]
			};

			const json = serializeLayout(layout);
			const parsed = JSON.parse(json) as Layout;

			expect(parsed.version).toBe('1.0');
			expect(parsed.name).toBe('My Homelab');
			expect(parsed.settings.theme).toBe('light');
			expect(parsed.deviceLibrary).toHaveLength(1);
			expect(parsed.deviceLibrary[0]?.name).toBe('Test Server');
			expect(parsed.racks).toHaveLength(1);
			expect(parsed.racks[0]?.name).toBe('Main Rack');
			expect(parsed.racks[0]?.devices).toHaveLength(1);
		});
	});

	describe('deserializeLayout', () => {
		it('parses valid JSON correctly', () => {
			const layout = createLayout('Test');
			const json = serializeLayout(layout);

			const result = deserializeLayout(json);
			expect(result.name).toBe('Test');
			expect(result.version).toBe(CURRENT_VERSION);
		});

		it('throws for invalid JSON syntax', () => {
			expect(() => deserializeLayout('not valid json {')).toThrow();
		});

		it('throws for missing required fields', () => {
			const invalid = JSON.stringify({ name: 'Test' });
			expect(() => deserializeLayout(invalid)).toThrow('Invalid layout structure');
		});

		it('throws for invalid version', () => {
			const invalid = JSON.stringify({
				version: '99.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			});
			expect(() => deserializeLayout(invalid)).toThrow('Unsupported layout version');
		});
	});

	describe('validateLayoutStructure', () => {
		it('returns true for valid layout', () => {
			const layout = createLayout('Test');
			expect(validateLayoutStructure(layout)).toBe(true);
		});

		it('returns false for missing version', () => {
			const invalid = {
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			};
			expect(validateLayoutStructure(invalid)).toBe(false);
		});

		it('returns false for missing racks', () => {
			const invalid = {
				version: '1.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: []
			};
			expect(validateLayoutStructure(invalid)).toBe(false);
		});

		it('returns false for invalid device references', () => {
			const invalid = {
				version: '1.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [], // No devices
				racks: [
					{
						id: 'rack-1',
						name: 'Test',
						height: 42,
						width: 19,
						position: 0,
						devices: [{ libraryId: 'nonexistent-device', position: 1 }]
					}
				]
			};
			expect(validateLayoutStructure(invalid)).toBe(false);
		});

		it('returns false for overlapping devices in rack', () => {
			const invalid = {
				version: '1.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [
					{
						id: 'device-1',
						name: 'Device 1',
						height: 2,
						colour: '#4A90D9',
						category: 'server'
					},
					{
						id: 'device-2',
						name: 'Device 2',
						height: 2,
						colour: '#4A90D9',
						category: 'server'
					}
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Test',
						height: 42,
						width: 19,
						position: 0,
						devices: [
							{ libraryId: 'device-1', position: 5 }, // Occupies 5,6
							{ libraryId: 'device-2', position: 6 } // Occupies 6,7 - collision!
						]
					}
				]
			};
			expect(validateLayoutStructure(invalid)).toBe(false);
		});

		it('returns false for null', () => {
			expect(validateLayoutStructure(null)).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(validateLayoutStructure(undefined)).toBe(false);
		});

		it('returns false for non-object', () => {
			expect(validateLayoutStructure('string')).toBe(false);
			expect(validateLayoutStructure(123)).toBe(false);
			expect(validateLayoutStructure([])).toBe(false);
		});
	});

	describe('Round-trip', () => {
		it('serialize then deserialize preserves all data', () => {
			const device: Device = {
				id: 'device-1',
				name: 'Test Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server',
				notes: 'Primary server'
			};

			const rack: Rack = {
				id: 'rack-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 5, face: 'front' }]
			};

			const original: Layout = {
				version: CURRENT_VERSION,
				name: 'My Homelab',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'light' },
				deviceLibrary: [device],
				racks: [rack]
			};

			const json = serializeLayout(original);
			const restored = deserializeLayout(json);

			// Compare all fields except modified (which is updated)
			expect(restored.version).toBe(original.version);
			expect(restored.name).toBe(original.name);
			expect(restored.created).toBe(original.created);
			expect(restored.settings).toEqual(original.settings);
			expect(restored.deviceLibrary).toEqual(original.deviceLibrary);
			expect(restored.racks).toEqual(original.racks);
		});
	});

	describe('Migration', () => {
		it('migrates v0.1 layout with version 0.1.0', () => {
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [
					{
						id: 'd1',
						name: 'Test Device',
						height: 2,
						colour: '#4A90D9',
						category: 'server'
					}
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: [{ libraryId: 'd1', position: 5 }]
					}
				]
			};

			const json = JSON.stringify(v01Layout);
			const result = deserializeLayout(json);

			expect(result.version).toBe(CURRENT_VERSION);
			expect(result.racks[0]!.view).toBe('front');
			expect(result.racks[0]!.devices[0]!.face).toBe('front');
		});

		it('migrates v0.1 layout with version 1.0', () => {
			const v01Layout = {
				version: '1.0',
				name: 'Old Layout',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: []
					}
				]
			};

			const json = JSON.stringify(v01Layout);
			const result = deserializeLayout(json);

			expect(result.version).toBe(CURRENT_VERSION);
			expect(result.racks[0]!.view).toBe('front');
		});

		it('preserves existing v0.2 values during migration', () => {
			const v02Layout = {
				version: CURRENT_VERSION,
				name: 'New Layout',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [
					{
						id: 'd1',
						name: 'Test Device',
						height: 2,
						colour: '#4A90D9',
						category: 'server'
					}
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						view: 'rear',
						devices: [{ libraryId: 'd1', position: 5, face: 'both' }]
					}
				]
			};

			const json = JSON.stringify(v02Layout);
			const result = deserializeLayout(json);

			expect(result.racks[0]!.view).toBe('rear');
			expect(result.racks[0]!.devices[0]!.face).toBe('both');
		});
	});

	describe('Zod Validation', () => {
		it('validates layout structure with Zod', async () => {
			// Dynamic import to get the new function
			const { validateLayoutWithZod } = await import('$lib/utils/serialization');
			const layout = createLayout('Test');
			const result = validateLayoutWithZod(layout);

			expect(result.success).toBe(true);
		});

		it('returns errors for invalid layout with Zod', async () => {
			const { validateLayoutWithZod } = await import('$lib/utils/serialization');
			const invalidLayout = {
				version: '0.2.0',
				name: '', // Empty name should fail
				created: 'not-a-date', // Invalid date format
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			};

			const result = validateLayoutWithZod(invalidLayout);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});

		it('provides user-friendly error messages', async () => {
			const { validateLayoutWithZod } = await import('$lib/utils/serialization');
			const invalidLayout = {
				version: '0.2.0',
				name: '',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			};

			const result = validateLayoutWithZod(invalidLayout);
			expect(result.success).toBe(false);
			if (!result.success) {
				// Error message should be readable
				expect(result.errors[0]).toContain('name');
			}
		});

		it('catches issues manual validation might miss', async () => {
			const { validateLayoutWithZod } = await import('$lib/utils/serialization');
			// Invalid datetime format but other fields valid
			const subtlyInvalid = {
				version: '0.2.0',
				name: 'Test',
				created: '2025-01-15', // Missing time component
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			};

			const result = validateLayoutWithZod(subtlyInvalid);
			expect(result.success).toBe(false);
		});

		it('validates device library entries with Zod schema', async () => {
			const { validateLayoutWithZod } = await import('$lib/utils/serialization');
			const layoutWithInvalidDevice = {
				version: '0.2.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [
					{
						slug: 'INVALID_SLUG', // Uppercase not allowed in slug
						name: 'Device',
						u_height: 1,
						category: 'server',
						colour: '#4A90D9'
					}
				],
				racks: []
			};

			const result = validateLayoutWithZod(layoutWithInvalidDevice);
			expect(result.success).toBe(false);
		});
	});
});
