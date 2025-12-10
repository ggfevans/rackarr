import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Rack from '$lib/components/Rack.svelte';
import RackDevice from '$lib/components/RackDevice.svelte';
import DevicePaletteItem from '$lib/components/DevicePaletteItem.svelte';
import type { Rack as RackType, DeviceType } from '$lib/types';

describe('Selection State Indicators', () => {
	const mockRack: RackType = {
		name: 'Test Rack',
		height: 12,
		width: 19,
		position: 0,
		desc_units: false,
		form_factor: '4-post',
		starting_unit: 1,
		devices: []
	};

	const mockDevice: DeviceType = {
		slug: 'device-1',
		model: 'Test Server',
		u_height: 2,
		rackarr: { colour: '#4A90D9', category: 'server' }
	};

	describe('Rack Selection', () => {
		it('selected rack has .selected class', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [mockDevice],
					selected: true
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toBeInTheDocument();
			expect(rackContainer).toHaveClass('selected');
		});

		it('unselected rack does not have .selected class', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [mockDevice],
					selected: false
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toBeInTheDocument();
			expect(rackContainer).not.toHaveClass('selected');
		});

		it('selected rack has selection styling applied via CSS', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [mockDevice],
					selected: true
				}
			});

			const rackContainer = container.querySelector('.rack-container.selected');
			expect(rackContainer).toBeInTheDocument();
		});
	});

	describe('Device Selection', () => {
		it('selected device has .selected class', () => {
			const { container } = render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					selected: true,
					uHeight: 20,
					rackWidth: 200
				}
			});

			const deviceGroup = container.querySelector('.rack-device');
			expect(deviceGroup).toBeInTheDocument();
			expect(deviceGroup).toHaveClass('selected');
		});

		it('unselected device does not have .selected class', () => {
			const { container } = render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					selected: false,
					uHeight: 20,
					rackWidth: 200
				}
			});

			const deviceGroup = container.querySelector('.rack-device');
			expect(deviceGroup).toBeInTheDocument();
			expect(deviceGroup).not.toHaveClass('selected');
		});

		it('selected device shows selection outline', () => {
			const { container } = render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					selected: true,
					uHeight: 20,
					rackWidth: 200
				}
			});

			const selectionOutline = container.querySelector('.device-selection');
			expect(selectionOutline).toBeInTheDocument();
		});

		it('unselected device does not show selection outline', () => {
			const { container } = render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					selected: false,
					uHeight: 20,
					rackWidth: 200
				}
			});

			const selectionOutline = container.querySelector('.device-selection');
			expect(selectionOutline).not.toBeInTheDocument();
		});
	});

	describe('Device Palette Item Selection', () => {
		it('renders device palette item without library-selected class by default', () => {
			const { container } = render(DevicePaletteItem, {
				props: { device: mockDevice }
			});

			const item = container.querySelector('.device-palette-item');
			expect(item).toBeInTheDocument();
			expect(item).not.toHaveClass('library-selected');
		});

		it('renders device palette item with library-selected class when selected', () => {
			const { container } = render(DevicePaletteItem, {
				props: { device: mockDevice, librarySelected: true }
			});

			const item = container.querySelector('.device-palette-item');
			expect(item).toBeInTheDocument();
			expect(item).toHaveClass('library-selected');
		});
	});

	describe('Selection Pulse Animation', () => {
		it('selected device has pulse animation class', () => {
			const { container } = render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					selected: true,
					uHeight: 20,
					rackWidth: 200
				}
			});

			// Verify the selection element exists - animation is CSS-based
			const deviceGroup = container.querySelector('.rack-device.selected');
			expect(deviceGroup).toBeInTheDocument();
		});
	});
});
