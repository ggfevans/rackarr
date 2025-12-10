import { describe, it, expect, beforeEach } from 'vitest';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';

describe('Selection Store', () => {
	beforeEach(() => {
		resetSelectionStore();
	});

	describe('device selection', () => {
		it('stores deviceIndex when selecting a device', () => {
			const store = getSelectionStore();

			store.selectDevice('rack-1', 0, 'device-type-a');

			expect(store.selectedDeviceIndex).toBe(0);
			expect(store.selectedRackId).toBe('rack-1');
			expect(store.selectedType).toBe('device');
		});

		it('selects by index, allowing multiple devices of same type to be distinguished', () => {
			const store = getSelectionStore();

			// Two devices with the same device_type at different indices
			// Select the first one (index 0)
			store.selectDevice('rack-1', 0, 'device-type-a');

			expect(store.selectedDeviceIndex).toBe(0);
			expect(store.selectedRackId).toBe('rack-1');

			// Select the second one (index 1)
			store.selectDevice('rack-1', 1, 'device-type-a');

			expect(store.selectedDeviceIndex).toBe(1);
			expect(store.selectedRackId).toBe('rack-1');
		});

		it('clears selection correctly', () => {
			const store = getSelectionStore();

			store.selectDevice('rack-1', 0, 'device-type-a');
			store.clearSelection();

			expect(store.selectedDeviceIndex).toBeNull();
			expect(store.selectedRackId).toBeNull();
			expect(store.selectedType).toBeNull();
			expect(store.selectedId).toBeNull();
		});

		it('selecting a rack clears device index', () => {
			const store = getSelectionStore();

			store.selectDevice('rack-1', 0, 'device-type-a');
			store.selectRack('rack-1');

			expect(store.selectedDeviceIndex).toBeNull();
			expect(store.selectedType).toBe('rack');
		});
	});

	describe('isDeviceSelected helper', () => {
		it('returns true only for the exact device at the selected index', () => {
			const store = getSelectionStore();

			// Select device at index 0 in rack-1
			store.selectDevice('rack-1', 0, 'device-type-a');

			// Helper function to check if a specific device is selected
			const isSelected = (rackId: string, deviceIndex: number) =>
				store.selectedType === 'device' &&
				store.selectedRackId === rackId &&
				store.selectedDeviceIndex === deviceIndex;

			// Device at index 0 should be selected
			expect(isSelected('rack-1', 0)).toBe(true);

			// Device at index 1 (same type) should NOT be selected
			expect(isSelected('rack-1', 1)).toBe(false);

			// Device in different rack should NOT be selected
			expect(isSelected('rack-2', 0)).toBe(false);
		});
	});
});
