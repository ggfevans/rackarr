import { describe, it, expect } from 'vitest';
import { getBlockedSlots } from '$lib/utils/blocked-slots';
import type { Rack, DeviceType, DeviceFace } from '$lib/types';

// Helper to create a test rack
function createTestRack(overrides: Partial<Rack> = {}): Rack {
	return {
		name: 'Test Rack',
		height: 12,
		width: 19,
		position: 0,
		desc_units: false,
		form_factor: '4-post',
		starting_unit: 1,
		devices: [],
		...overrides
	};
}

// Helper to create a test device type
function createTestDevice(slug: string, u_height: number, isFullDepth = true): DeviceType {
	return {
		slug,
		model: `Device ${slug}`,
		u_height,
		is_full_depth: isFullDepth,
		category: 'server',
		colour: '#888888'
	};
}

describe('getBlockedSlots', () => {
	describe('Basic cases', () => {
		it('returns empty array when rack has no devices', () => {
			const rack = createTestRack({ devices: [] });
			const deviceLibrary: DeviceType[] = [];

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blocked).toEqual([]);
		});

		it('returns empty array when all devices are on same face as view', () => {
			const rack = createTestRack({
				devices: [
					{ device_type: 'device-1', position: 1, face: 'front' as DeviceFace },
					{ device_type: 'device-2', position: 5, face: 'front' as DeviceFace }
				]
			});
			const deviceLibrary = [
				createTestDevice('device-1', 2, false), // half-depth
				createTestDevice('device-2', 1, false) // half-depth
			];

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blocked).toEqual([]);
		});
	});

	describe('Full-depth device blocking', () => {
		it('returns blocked range for full-depth front device when checking rear view', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'server-1', position: 5, face: 'front' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('server-1', 2, true)]; // full-depth

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 5, top: 6 }); // 2U device at position 5
		});

		it('returns blocked range for full-depth rear device when checking front view', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'server-1', position: 3, face: 'rear' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('server-1', 3, true)]; // full-depth, 3U

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 3, top: 5 }); // 3U device at position 3
		});
	});

	describe('Half-depth devices', () => {
		it('does NOT return blocked range for half-depth devices', () => {
			const rack = createTestRack({
				devices: [
					{ device_type: 'switch-1', position: 1, face: 'front' as DeviceFace },
					{ device_type: 'patch-1', position: 5, face: 'rear' as DeviceFace }
				]
			});
			const deviceLibrary = [
				createTestDevice('switch-1', 1, false), // half-depth
				createTestDevice('patch-1', 2, false) // half-depth
			];

			// Neither should block the opposite view
			const blockedRear = getBlockedSlots(rack, 'rear', deviceLibrary);
			const blockedFront = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blockedRear).toEqual([]);
			expect(blockedFront).toEqual([]);
		});
	});

	describe('Both-face devices', () => {
		it('returns blocked range for both-face devices on front view', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'ups-1', position: 1, face: 'both' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('ups-1', 4, true)]; // full-depth, 4U

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			// Both-face devices block both views
			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 1, top: 4 }); // 4U device at position 1
		});

		it('returns blocked range for both-face devices on rear view', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'ups-1', position: 10, face: 'both' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('ups-1', 2, true)];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 10, top: 11 }); // 2U device at position 10
		});
	});

	describe('Multiple devices', () => {
		it('handles multiple devices with separate ranges', () => {
			const rack = createTestRack({
				devices: [
					{ device_type: 'server-1', position: 1, face: 'front' as DeviceFace },
					{ device_type: 'server-2', position: 6, face: 'front' as DeviceFace },
					{ device_type: 'switch-1', position: 10, face: 'front' as DeviceFace }
				]
			});
			const deviceLibrary = [
				createTestDevice('server-1', 2, true), // full-depth
				createTestDevice('server-2', 3, true), // full-depth
				createTestDevice('switch-1', 1, false) // half-depth - shouldn't block
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked).toHaveLength(2);
			expect(blocked).toContainEqual({ bottom: 1, top: 2 }); // server-1
			expect(blocked).toContainEqual({ bottom: 6, top: 8 }); // server-2
		});

		it('handles overlapping/adjacent ranges', () => {
			const rack = createTestRack({
				devices: [
					{ device_type: 'server-1', position: 1, face: 'front' as DeviceFace },
					{ device_type: 'server-2', position: 3, face: 'front' as DeviceFace } // adjacent
				]
			});
			const deviceLibrary = [
				createTestDevice('server-1', 2, true),
				createTestDevice('server-2', 2, true)
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Returns separate ranges (not merged)
			expect(blocked).toHaveLength(2);
			expect(blocked).toContainEqual({ bottom: 1, top: 2 });
			expect(blocked).toContainEqual({ bottom: 3, top: 4 });
		});
	});

	describe('U range calculations', () => {
		it('correctly calculates U ranges for 1U device', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'switch-1', position: 7, face: 'front' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('switch-1', 1, true)];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked[0]).toEqual({ bottom: 7, top: 7 }); // 1U at position 7
		});

		it('correctly calculates U ranges for large device', () => {
			const rack = createTestRack({
				devices: [{ device_type: 'storage-1', position: 1, face: 'rear' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('storage-1', 10, true)]; // 10U device

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blocked[0]).toEqual({ bottom: 1, top: 10 }); // 10U device at position 1
		});
	});

	describe('Missing device type handling', () => {
		it('skips devices without matching library entry', () => {
			const rack = createTestRack({
				devices: [
					{ device_type: 'unknown-device', position: 1, face: 'front' as DeviceFace },
					{ device_type: 'server-1', position: 5, face: 'front' as DeviceFace }
				]
			});
			const deviceLibrary = [createTestDevice('server-1', 2, true)];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Should only include server-1, skip unknown-device
			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 5, top: 6 });
		});
	});

	describe('Default is_full_depth behavior', () => {
		it('treats undefined is_full_depth as true (full-depth)', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-test-1', device_type: 'device-1', position: 3, face: 'front' as DeviceFace }
				]
			});
			// Device without is_full_depth property
			const deviceLibrary: DeviceType[] = [
				{
					slug: 'device-1',
					model: 'Device 1',
					u_height: 2,
					category: 'server',
					colour: '#888888'
					// is_full_depth not specified
				}
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Should block because undefined is_full_depth defaults to true
			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 3, top: 4 });
		});
	});
});
