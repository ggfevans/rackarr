import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Rack from '$lib/components/Rack.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import type { Rack as RackType, DeviceType } from '$lib/types';

describe('Rack Visual Enhancements', () => {
	let testRack: RackType;
	let layoutStore: ReturnType<typeof getLayoutStore>;

	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();

		layoutStore = getLayoutStore();
		const rack = layoutStore.addRack('Test Rack', 42);
		testRack = rack!;
	});

	describe('Alternating Row Shading', () => {
		it('U slots have alternating shading via even class', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			// Check for u-slot elements with even class
			const evenSlots = container.querySelectorAll('.u-slot.u-slot-even');
			const allSlots = container.querySelectorAll('.u-slot');

			// Should have roughly half even slots (every other U)
			expect(evenSlots.length).toBeGreaterThan(0);
			expect(evenSlots.length).toBe(Math.floor(allSlots.length / 2));
		});

		it('even slots are at even U positions', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const slots = container.querySelectorAll('.u-slot');
			const rackHeight = testRack.height;

			// Check that even positions have even class
			slots.forEach((slot, i) => {
				const uPosition = rackHeight - i;
				const hasEvenClass = slot.classList.contains('u-slot-even');
				expect(hasEvenClass).toBe(uPosition % 2 === 0);
			});
		});
	});

	describe('U Number Highlighting', () => {
		it('every 5th U number is highlighted', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			// Find highlighted U labels
			const highlightedLabels = container.querySelectorAll('.u-label.u-label-highlight');

			// For a 42U rack, positions 5, 10, 15, 20, 25, 30, 35, 40 should be highlighted
			// That's 8 highlighted labels
			expect(highlightedLabels.length).toBe(8);
		});

		it('highlighted labels contain correct U numbers', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const highlightedLabels = container.querySelectorAll('.u-label.u-label-highlight');
			const highlightedNumbers = Array.from(highlightedLabels).map((label) =>
				parseInt(label.textContent || '0', 10)
			);

			// Should contain 5, 10, 15, 20, 25, 30, 35, 40
			const expected = [5, 10, 15, 20, 25, 30, 35, 40];
			expect(highlightedNumbers.sort((a, b) => a - b)).toEqual(expected);
		});

		it('non-5th U numbers are not highlighted', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const allLabels = container.querySelectorAll('.u-label');
			const regularLabels = container.querySelectorAll('.u-label:not(.u-label-highlight)');

			// Regular labels should be 42 - 8 = 34
			expect(regularLabels.length).toBe(allLabels.length - 8);
		});
	});

	describe('Rack Title Position', () => {
		it('rack title is positioned above the rack', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const rackName = container.querySelector('.rack-name');
			expect(rackName).toBeInTheDocument();

			// The y attribute positions the rack name closer to the rack top bar
			const yAttr = rackName?.getAttribute('y');
			expect(yAttr).toBe('16');
		});

		it('rack title displays the rack name', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const rackName = container.querySelector('.rack-name');
			expect(rackName?.textContent).toBe('Test Rack');
		});

		it('rack title is horizontally centered', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const rackName = container.querySelector('.rack-name');
			expect(rackName).toHaveAttribute('text-anchor', 'middle');
		});
	});

	describe('Typography', () => {
		it('U numbers use tabular figures for alignment', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			// Check that u-label class exists (styling is verified separately)
			const uLabels = container.querySelectorAll('.u-label');
			expect(uLabels.length).toBe(42); // All U positions should have labels

			// The actual font-variant-numeric is set via CSS, verified by inspecting styles
			// In tests, we verify the class is applied correctly
		});

		it('highlighted U labels have stronger visual weight', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			// Highlighted labels should have a different class for styling
			const highlightedLabels = container.querySelectorAll('.u-label.u-label-highlight');
			expect(highlightedLabels.length).toBeGreaterThan(0);
		});
	});

	describe('Device Selection', () => {
		it('only the device with selected ID shows selection highlight, not all devices of same type', () => {
			// Create two devices with the same device_type (same device type)
			const deviceType: DeviceType = {
				slug: 'device-type-1',
				model: 'Test Server',
				u_height: 1,
				rackarr: { colour: '#4A90D9', category: 'server' }
			};

			// Place two instances of the same device type in the rack
			const rackWithDevices: RackType = {
				...testRack,
				devices: [
					{ id: 'uuid-1', device_type: 'device-type-1', position: 5, face: 'front' },
					{ id: 'uuid-2', device_type: 'device-type-1', position: 10, face: 'front' } // Same device_type, different position
				]
			};

			// Render with only the first device selected by ID
			const { container } = render(Rack, {
				props: {
					rack: rackWithDevices,
					deviceLibrary: [deviceType],
					selected: false,
					selectedDeviceId: 'uuid-1' // Select the first device only
				}
			});

			// Find all device groups
			const deviceGroups = container.querySelectorAll('.rack-device');
			expect(deviceGroups.length).toBe(2);

			// Find selection outlines
			const selectionOutlines = container.querySelectorAll('.device-selection');

			// Only ONE device should have a selection outline, not both
			expect(selectionOutlines.length).toBe(1);
		});

		it('no devices are selected when selectedDeviceId is null', () => {
			const deviceType: DeviceType = {
				slug: 'device-type-1',
				model: 'Test Server',
				u_height: 1,
				rackarr: { colour: '#4A90D9', category: 'server' }
			};

			const rackWithDevices: RackType = {
				...testRack,
				devices: [
					{ id: 'uuid-1', device_type: 'device-type-1', position: 5, face: 'front' },
					{ id: 'uuid-2', device_type: 'device-type-1', position: 10, face: 'front' }
				]
			};

			const { container } = render(Rack, {
				props: {
					rack: rackWithDevices,
					deviceLibrary: [deviceType],
					selected: false,
					selectedDeviceId: null
				}
			});

			// No selection outlines should be present
			const selectionOutlines = container.querySelectorAll('.device-selection');
			expect(selectionOutlines.length).toBe(0);
		});
	});

	describe('Different Rack Heights', () => {
		it('24U rack has correct number of highlighted labels', () => {
			// Create a 24U rack by modifying the existing one
			const rack24: RackType = { ...testRack, height: 24 };

			const { container } = render(Rack, {
				props: {
					rack: rack24,
					deviceLibrary: [],
					selected: false
				}
			});

			// For 24U: positions 5, 10, 15, 20 should be highlighted (4 total)
			const highlightedLabels = container.querySelectorAll('.u-label.u-label-highlight');
			expect(highlightedLabels.length).toBe(4);
		});

		it('12U rack has correct number of highlighted labels', () => {
			// Create a 12U rack by modifying the existing one
			const rack12: RackType = { ...testRack, height: 12 };

			const { container } = render(Rack, {
				props: {
					rack: rack12,
					deviceLibrary: [],
					selected: false
				}
			});

			// For 12U: positions 5, 10 should be highlighted (2 total)
			const highlightedLabels = container.querySelectorAll('.u-label.u-label-highlight');
			expect(highlightedLabels.length).toBe(2);
		});
	});
});
