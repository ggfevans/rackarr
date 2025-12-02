import { describe, it, expect } from 'vitest';
import { migrateLayout } from '$lib/utils/migration';
import type { Layout } from '$lib/types';

describe('migrateLayout', () => {
	it('adds view: front to v0.1 racks', () => {
		const v01Layout = {
			version: '0.1.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' as const },
			deviceLibrary: [],
			racks: [
				{
					id: '1',
					name: 'Test',
					height: 42,
					width: 19,
					position: 0,
					devices: []
				}
			]
		} as unknown as Layout;

		const result = migrateLayout(v01Layout);
		expect(result.racks[0].view).toBe('front');
	});

	it('adds face: front to v0.1 placed devices', () => {
		const v01Layout = {
			version: '0.1.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' as const },
			deviceLibrary: [],
			racks: [
				{
					id: '1',
					name: 'Test',
					height: 42,
					width: 19,
					position: 0,
					devices: [{ libraryId: 'd1', position: 1 }]
				}
			]
		} as unknown as Layout;

		const result = migrateLayout(v01Layout);
		expect(result.racks[0].devices[0].face).toBe('front');
	});

	it('preserves existing v0.2 rack view values', () => {
		const v02Layout: Layout = {
			version: '0.2.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' },
			deviceLibrary: [],
			racks: [
				{
					id: '1',
					name: 'Test',
					height: 42,
					width: 19,
					position: 0,
					view: 'rear',
					devices: [{ libraryId: 'd1', position: 1, face: 'both' }]
				}
			]
		};

		const result = migrateLayout(v02Layout);
		expect(result.racks[0].view).toBe('rear');
		expect(result.racks[0].devices[0].face).toBe('both');
	});

	it('updates version to 0.2.0', () => {
		const v01Layout = {
			version: '0.1.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' as const },
			deviceLibrary: [],
			racks: []
		} as Layout;

		const result = migrateLayout(v01Layout);
		expect(result.version).toBe('0.2.0');
	});

	it('handles multiple racks with multiple devices', () => {
		const v01Layout = {
			version: '0.1.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' as const },
			deviceLibrary: [],
			racks: [
				{
					id: '1',
					name: 'Rack 1',
					height: 42,
					width: 19,
					position: 0,
					devices: [
						{ libraryId: 'd1', position: 1 },
						{ libraryId: 'd2', position: 5 }
					]
				},
				{
					id: '2',
					name: 'Rack 2',
					height: 42,
					width: 19,
					position: 1,
					devices: [{ libraryId: 'd3', position: 10 }]
				}
			]
		} as unknown as Layout;

		const result = migrateLayout(v01Layout);

		expect(result.racks[0].view).toBe('front');
		expect(result.racks[0].devices[0].face).toBe('front');
		expect(result.racks[0].devices[1].face).toBe('front');

		expect(result.racks[1].view).toBe('front');
		expect(result.racks[1].devices[0].face).toBe('front');
	});

	it('preserves all other layout properties', () => {
		const v01Layout: Layout = {
			version: '0.1.0',
			name: 'My Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-02T00:00:00Z',
			settings: { theme: 'light' },
			deviceLibrary: [
				{
					id: 'dev-1',
					name: 'Server',
					height: 2,
					colour: '#4A90D9',
					category: 'server'
				}
			],
			racks: []
		};

		const result = migrateLayout(v01Layout);

		expect(result.name).toBe('My Layout');
		expect(result.created).toBe('2025-01-01T00:00:00Z');
		expect(result.modified).toBe('2025-01-02T00:00:00Z');
		expect(result.settings.theme).toBe('light');
		expect(result.deviceLibrary).toHaveLength(1);
		expect(result.deviceLibrary[0].name).toBe('Server');
	});

	it('does not modify original layout object', () => {
		const v01Layout = {
			version: '0.1.0',
			name: 'Test Layout',
			created: '2025-01-01T00:00:00Z',
			modified: '2025-01-01T00:00:00Z',
			settings: { theme: 'dark' as const },
			deviceLibrary: [],
			racks: [
				{
					id: '1',
					name: 'Test',
					height: 42,
					width: 19,
					position: 0,
					devices: [{ libraryId: 'd1', position: 1 }]
				}
			]
		} as unknown as Layout;

		const originalVersion = v01Layout.version;
		const originalRacksLength = v01Layout.racks.length;

		migrateLayout(v01Layout);

		// Original should be unchanged
		expect(v01Layout.version).toBe(originalVersion);
		expect(v01Layout.racks).toHaveLength(originalRacksLength);
		expect((v01Layout.racks[0] as unknown as Record<string, unknown>).view).toBeUndefined();
		expect(
			(v01Layout.racks[0].devices[0] as unknown as Record<string, unknown>).face
		).toBeUndefined();
	});
});
