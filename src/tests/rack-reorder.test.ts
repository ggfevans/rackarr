import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';

// Note: Multi-rack reordering tests removed - single-rack mode (v0.1.1) only allows 1 rack
// These tests will be restored in v0.3 when multi-rack is re-enabled

describe('Rack Reordering (Single-Rack Mode)', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
	});

	describe('Single Rack Behavior', () => {
		it('reorderRacks is a no-op with single rack', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Only Rack', 42);

			// Attempt to reorder - should do nothing
			layoutStore.reorderRacks(0, 1);

			expect(layoutStore.racks).toHaveLength(1);
			expect(layoutStore.racks[0]!.name).toBe('Only Rack');
		});

		// Note: Selection tests are covered in selection-store.test.ts
		// This file focuses on reordering behavior which is N/A in single-rack mode
	});

	describe('Drag Handle Area', () => {
		it('rack has drag handle element when selected', () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const rack = layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(rack!.id);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			expect(dragHandle).toBeInTheDocument();
		});

		it('drag handle is hidden when rack not selected', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			// Drag handle should not exist when rack is not selected
			expect(dragHandle).not.toBeInTheDocument();
		});
	});
});
