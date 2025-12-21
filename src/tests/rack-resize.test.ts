/**
 * Rack Resize Validation Tests
 *
 * Tests for smart rack height resizing with devices in place.
 * Issue #115: Allow growing always, shrinking only when devices fit.
 */

import { describe, it, expect } from 'vitest';
import {
	canResizeRackTo,
	getDeviceRangeText,
	formatConflictMessage,
	getConflictDetails
} from '$lib/utils/rack-resize';
import { createTestRack, createTestDeviceType, createTestDevice } from './factories';

describe('canResizeRackTo', () => {
	describe('growing rack height', () => {
		it('returns allowed: true when growing from 24U to 42U with devices', () => {
			const rack = createTestRack({
				height: 24,
				devices: [createTestDevice({ device_type: 'server-1', position: 20 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'server-1', u_height: 2 })];

			const result = canResizeRackTo(rack, 42, deviceTypes);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it('returns allowed: true when growing from empty rack', () => {
			const rack = createTestRack({ height: 12, devices: [] });

			const result = canResizeRackTo(rack, 42, []);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});
	});

	describe('shrinking rack height', () => {
		it('returns allowed: false when device exceeds new bounds', () => {
			// Device at U40-42 (position 40, u_height 3)
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'storage-1', position: 40 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'storage-1', u_height: 3 })];

			// Shrink to 41U - device top (42) > newHeight (41)
			const result = canResizeRackTo(rack, 41, deviceTypes);

			expect(result.allowed).toBe(false);
			expect(result.conflicts).toHaveLength(1);
			expect(result.conflicts[0]?.device_type).toBe('storage-1');
		});

		it('returns allowed: true when all devices fit within new bounds', () => {
			// Device at U10-11 (position 10, u_height 2)
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'server-1', position: 10 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'server-1', u_height: 2 })];

			// Shrink to 24U - device top (11) <= newHeight (24)
			const result = canResizeRackTo(rack, 24, deviceTypes);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it('returns allowed: false with multiple conflicting devices', () => {
			const rack = createTestRack({
				height: 42,
				devices: [
					createTestDevice({ device_type: 'server-1', position: 40 }),
					createTestDevice({ device_type: 'switch-1', position: 38 }),
					createTestDevice({ device_type: 'storage-1', position: 10 }) // This one fits
				]
			});
			const deviceTypes = [
				createTestDeviceType({ slug: 'server-1', u_height: 2 }), // U40-41
				createTestDeviceType({ slug: 'switch-1', u_height: 1 }), // U38
				createTestDeviceType({ slug: 'storage-1', u_height: 4 }) // U10-13
			];

			// Shrink to 36U
			const result = canResizeRackTo(rack, 36, deviceTypes);

			expect(result.allowed).toBe(false);
			expect(result.conflicts).toHaveLength(2); // server-1 and switch-1
			expect(result.conflicts.map((c) => c.device_type)).toContain('server-1');
			expect(result.conflicts.map((c) => c.device_type)).toContain('switch-1');
		});

		it('returns allowed: true for exact boundary (device top equals new height)', () => {
			// Device at U23-24 (position 23, u_height 2)
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'server-1', position: 23 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'server-1', u_height: 2 })];

			// Shrink to exactly 24U - device top (24) == newHeight (24) - should fit
			const result = canResizeRackTo(rack, 24, deviceTypes);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it('returns allowed: false when device top exceeds new height by 1', () => {
			// Device at U24-25 (position 24, u_height 2)
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'server-1', position: 24 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'server-1', u_height: 2 })];

			// Shrink to 24U - device top (25) > newHeight (24) - conflict
			const result = canResizeRackTo(rack, 24, deviceTypes);

			expect(result.allowed).toBe(false);
			expect(result.conflicts).toHaveLength(1);
		});
	});

	describe('edge cases', () => {
		it('handles empty rack shrinking', () => {
			const rack = createTestRack({ height: 42, devices: [] });

			const result = canResizeRackTo(rack, 12, []);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it('handles half-U devices correctly', () => {
			// 0.5U device at position 24 - top = ceil(24 + 0.5 - 1) = ceil(23.5) = 24
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'half-u', position: 24 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'half-u', u_height: 0.5 })];

			// Shrink to 24U - device top (24) <= newHeight (24) - should fit
			const result = canResizeRackTo(rack, 24, deviceTypes);

			expect(result.allowed).toBe(true);
		});

		it('blocks half-U device when it would exceed bounds', () => {
			// 0.5U device at position 25 - top = ceil(25 + 0.5 - 1) = ceil(24.5) = 25
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'half-u', position: 25 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'half-u', u_height: 0.5 })];

			// Shrink to 24U - device top (25) > newHeight (24) - conflict
			const result = canResizeRackTo(rack, 24, deviceTypes);

			expect(result.allowed).toBe(false);
			expect(result.conflicts).toHaveLength(1);
		});

		it('defaults to 1U when device type not found', () => {
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'unknown-device', position: 40 })]
			});

			// No device types provided - should default to 1U
			// Position 40, u_height 1 -> top = 40
			// newHeight 38 < 40 -> conflict
			const result = canResizeRackTo(rack, 38, []);

			expect(result.allowed).toBe(false);
			expect(result.conflicts).toHaveLength(1);
		});

		it('handles same height (no change)', () => {
			const rack = createTestRack({
				height: 42,
				devices: [createTestDevice({ device_type: 'server-1', position: 40 })]
			});
			const deviceTypes = [createTestDeviceType({ slug: 'server-1', u_height: 2 })];

			const result = canResizeRackTo(rack, 42, deviceTypes);

			expect(result.allowed).toBe(true);
			expect(result.conflicts).toEqual([]);
		});
	});
});

describe('getDeviceRangeText', () => {
	it('formats 1U device as "U15"', () => {
		const device = createTestDevice({ position: 15 });
		const deviceType = createTestDeviceType({ u_height: 1 });

		expect(getDeviceRangeText(device, deviceType)).toBe('U15');
	});

	it('formats 2U device as "U10-11"', () => {
		const device = createTestDevice({ position: 10 });
		const deviceType = createTestDeviceType({ u_height: 2 });

		expect(getDeviceRangeText(device, deviceType)).toBe('U10-11');
	});

	it('formats 4U device as "U5-8"', () => {
		const device = createTestDevice({ position: 5 });
		const deviceType = createTestDeviceType({ u_height: 4 });

		expect(getDeviceRangeText(device, deviceType)).toBe('U5-8');
	});

	it('handles 0.5U devices', () => {
		const device = createTestDevice({ position: 10 });
		const deviceType = createTestDeviceType({ u_height: 0.5 });

		// 0.5U device at position 10 should show as "U10"
		expect(getDeviceRangeText(device, deviceType)).toBe('U10');
	});

	it('handles undefined device type (defaults to 1U)', () => {
		const device = createTestDevice({ position: 20 });

		expect(getDeviceRangeText(device, undefined)).toBe('U20');
	});
});

describe('getConflictDetails', () => {
	it('enriches conflicts with device type information', () => {
		const conflicts = [
			createTestDevice({ device_type: 'server-1', position: 40 }),
			createTestDevice({ device_type: 'switch-1', position: 38 })
		];
		const deviceTypes = [
			createTestDeviceType({ slug: 'server-1', u_height: 2, model: 'Server Model' }),
			createTestDeviceType({ slug: 'switch-1', u_height: 1, model: 'Switch Model' })
		];

		const details = getConflictDetails(conflicts, deviceTypes);

		expect(details).toHaveLength(2);
		expect(details[0].device.device_type).toBe('server-1');
		expect(details[0].deviceType?.model).toBe('Server Model');
		expect(details[1].device.device_type).toBe('switch-1');
		expect(details[1].deviceType?.model).toBe('Switch Model');
	});

	it('handles missing device types', () => {
		const conflicts = [createTestDevice({ device_type: 'unknown', position: 40 })];

		const details = getConflictDetails(conflicts, []);

		expect(details).toHaveLength(1);
		expect(details[0].deviceType).toBeUndefined();
	});
});

describe('formatConflictMessage', () => {
	it('formats single device conflict', () => {
		const details = [
			{
				device: createTestDevice({ position: 40 }),
				deviceType: createTestDeviceType({ u_height: 1, model: 'Switch' })
			}
		];

		const message = formatConflictMessage(details);

		expect(message).toBe('Switch at U40');
	});

	it('formats multiple device conflicts', () => {
		const details = [
			{
				device: createTestDevice({ position: 40 }),
				deviceType: createTestDeviceType({ u_height: 3, model: 'Storage' })
			},
			{
				device: createTestDevice({ position: 38 }),
				deviceType: createTestDeviceType({ u_height: 1, model: 'Switch' })
			}
		];

		const message = formatConflictMessage(details);

		expect(message).toContain('Storage at U40-42');
		expect(message).toContain('Switch at U38');
	});

	it('uses custom name over model when provided', () => {
		const details = [
			{
				device: createTestDevice({ position: 40, name: 'Core Router' }),
				deviceType: createTestDeviceType({ model: 'Generic Router' })
			}
		];

		const message = formatConflictMessage(details);

		expect(message).toBe('Core Router at U40');
	});

	it('falls back to slug when no model', () => {
		// Construct deviceType directly to ensure model is truly undefined
		const details = [
			{
				device: createTestDevice({ position: 40 }),
				deviceType: {
					slug: 'my-device',
					u_height: 1,
					category: 'server' as const,
					colour: '#333'
					// model intentionally omitted
				}
			}
		];

		const message = formatConflictMessage(details);

		expect(message).toContain('my-device at U40');
	});

	it('falls back to "Device" when no device type', () => {
		const details = [
			{
				device: createTestDevice({ position: 40 }),
				deviceType: undefined
			}
		];

		const message = formatConflictMessage(details);

		expect(message).toBe('Device at U40');
	});
});
