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
					{ id: 'bs-1', device_type: 'device-1', position: 1, face: 'front' as DeviceFace },
					{ id: 'bs-2', device_type: 'device-2', position: 5, face: 'front' as DeviceFace }
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

	describe('Full-depth device handling', () => {
		it('does NOT return blocked range for full-depth devices (they are visible from both sides)', () => {
			const rack = createTestRack({
				devices: [{ id: 'bs-3', device_type: 'server-1', position: 5, face: 'front' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('server-1', 2, true)]; // full-depth

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Full-depth devices are visible from both sides, no hatching needed
			expect(blocked).toHaveLength(0);
		});

		it('does NOT return blocked range for full-depth rear device when checking front', () => {
			const rack = createTestRack({
				devices: [{ id: 'bs-4', device_type: 'server-1', position: 3, face: 'rear' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('server-1', 3, true)]; // full-depth, 3U

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			// Full-depth devices are visible from both sides, no hatching needed
			expect(blocked).toHaveLength(0);
		});
	});

	describe('Half-depth devices', () => {
		it('returns blocked range for half-depth devices on opposite face', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-5', device_type: 'switch-1', position: 1, face: 'front' as DeviceFace },
					{ id: 'bs-6', device_type: 'patch-1', position: 5, face: 'rear' as DeviceFace }
				]
			});
			const deviceLibrary = [
				createTestDevice('switch-1', 1, false), // half-depth
				createTestDevice('patch-1', 2, false) // half-depth
			];

			// Front half-depth device should show hatching on rear view
			const blockedRear = getBlockedSlots(rack, 'rear', deviceLibrary);
			expect(blockedRear).toHaveLength(1);
			expect(blockedRear[0]).toEqual({ bottom: 1, top: 1 }); // switch-1

			// Rear half-depth device should show hatching on front view
			const blockedFront = getBlockedSlots(rack, 'front', deviceLibrary);
			expect(blockedFront).toHaveLength(1);
			expect(blockedFront[0]).toEqual({ bottom: 5, top: 6 }); // patch-1
		});

		it('returns blocked range for half-depth 1U device', () => {
			const rack = createTestRack({
				devices: [{ id: 'bs-7', device_type: 'switch-1', position: 7, face: 'front' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('switch-1', 1, false)]; // half-depth

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 7, top: 7 }); // 1U at position 7
		});

		it('returns blocked range for large half-depth device', () => {
			const rack = createTestRack({
				devices: [{ id: 'bs-8', device_type: 'storage-1', position: 1, face: 'rear' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('storage-1', 10, false)]; // half-depth, 10U

			const blocked = getBlockedSlots(rack, 'front', deviceLibrary);

			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 1, top: 10 }); // 10U device at position 1
		});
	});

	describe('Both-face devices', () => {
		it('does NOT return blocked range for both-face devices (they are visible on both faces)', () => {
			const rack = createTestRack({
				devices: [{ id: 'bs-9', device_type: 'ups-1', position: 1, face: 'both' as DeviceFace }]
			});
			const deviceLibrary = [createTestDevice('ups-1', 4, true)]; // full-depth, 4U

			const blockedFront = getBlockedSlots(rack, 'front', deviceLibrary);
			const blockedRear = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Both-face devices are visible on both views, no hatching needed
			expect(blockedFront).toHaveLength(0);
			expect(blockedRear).toHaveLength(0);
		});
	});

	describe('Multiple devices', () => {
		it('handles multiple half-depth devices with separate ranges', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-10', device_type: 'switch-1', position: 1, face: 'front' as DeviceFace },
					{ id: 'bs-11', device_type: 'switch-2', position: 6, face: 'front' as DeviceFace },
					{ id: 'bs-12', device_type: 'server-1', position: 10, face: 'front' as DeviceFace }
				]
			});
			const deviceLibrary = [
				createTestDevice('switch-1', 1, false), // half-depth
				createTestDevice('switch-2', 2, false), // half-depth
				createTestDevice('server-1', 1, true) // full-depth - shouldn't block
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			expect(blocked).toHaveLength(2);
			expect(blocked).toContainEqual({ bottom: 1, top: 1 }); // switch-1
			expect(blocked).toContainEqual({ bottom: 6, top: 7 }); // switch-2
		});

		it('handles adjacent half-depth devices', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-13', device_type: 'switch-1', position: 1, face: 'front' as DeviceFace },
					{ id: 'bs-14', device_type: 'switch-2', position: 2, face: 'front' as DeviceFace } // adjacent
				]
			});
			const deviceLibrary = [
				createTestDevice('switch-1', 1, false),
				createTestDevice('switch-2', 1, false)
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Returns separate ranges (not merged)
			expect(blocked).toHaveLength(2);
			expect(blocked).toContainEqual({ bottom: 1, top: 1 });
			expect(blocked).toContainEqual({ bottom: 2, top: 2 });
		});
	});

	describe('Missing device type handling', () => {
		it('skips devices without matching library entry', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-15', device_type: 'unknown-device', position: 1, face: 'front' as DeviceFace },
					{ id: 'bs-16', device_type: 'switch-1', position: 5, face: 'front' as DeviceFace }
				]
			});
			const deviceLibrary = [createTestDevice('switch-1', 2, false)]; // half-depth

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Should only include switch-1, skip unknown-device
			expect(blocked).toHaveLength(1);
			expect(blocked[0]).toEqual({ bottom: 5, top: 6 });
		});
	});

	describe('Default is_full_depth behavior', () => {
		it('treats undefined is_full_depth as true (no blocking)', () => {
			const rack = createTestRack({
				devices: [
					{ id: 'bs-17', device_type: 'device-1', position: 3, face: 'front' as DeviceFace }
				]
			});
			// Device without is_full_depth property (defaults to true = full-depth)
			const deviceLibrary: DeviceType[] = [
				{
					slug: 'device-1',
					model: 'Device 1',
					u_height: 2,
					category: 'server',
					colour: '#888888'
					// is_full_depth not specified - defaults to true
				}
			];

			const blocked = getBlockedSlots(rack, 'rear', deviceLibrary);

			// Full-depth devices (including undefined) don't cause blocking
			expect(blocked).toHaveLength(0);
		});
	});
});
