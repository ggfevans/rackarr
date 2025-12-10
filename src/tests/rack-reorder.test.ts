import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';

// Note: Multi-rack reordering tests removed - single-rack mode only allows 1 rack

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

			expect(layoutStore.rackCount).toBe(1);
			expect(layoutStore.rack!.name).toBe('Only Rack');
		});

		// Note: Selection tests are covered in selection-store.test.ts
		// This file focuses on reordering behavior which is N/A in single-rack mode
	});

	describe('Drag Handle Removed', () => {
		it('drag handle does not exist when rack is selected', () => {
			// NOTE: Drag handle removed (single-rack mode)
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();
			const rack = layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack(rack!.id);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			expect(dragHandle).not.toBeInTheDocument();
		});

		it('drag handle does not exist when rack is not selected', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			expect(dragHandle).not.toBeInTheDocument();
		});
	});
});
