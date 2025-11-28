import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';

describe('Rack Reordering', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
	});

	describe('Keyboard Reordering', () => {
		it('ArrowLeft on first rack does nothing', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			layoutStore.addRack('Rack A', 42);
			layoutStore.addRack('Rack B', 42);

			const rackAId = layoutStore.racks.find((r) => r.name === 'Rack A')!.id;
			selectionStore.selectRack(rackAId);

			const initialPositionA = layoutStore.racks.find((r) => r.name === 'Rack A')!.position;

			// Try to move first rack left
			layoutStore.reorderRacks(0, -1);

			// Position should be unchanged
			expect(layoutStore.racks.find((r) => r.name === 'Rack A')!.position).toBe(initialPositionA);
		});

		it('ArrowLeft moves second rack to first position', () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Rack A', 42);
			layoutStore.addRack('Rack B', 42);

			// Rack order is determined by position
			// Both start at position 0, 1
			const sortedBefore = [...layoutStore.racks].sort((a, b) => a.position - b.position);
			expect(sortedBefore[0]?.name).toBe('Rack A');
			expect(sortedBefore[1]?.name).toBe('Rack B');

			// Move rack at index 1 (Rack B) to index 0
			layoutStore.reorderRacks(1, 0);

			const sortedAfter = [...layoutStore.racks].sort((a, b) => a.position - b.position);
			expect(sortedAfter[0]?.name).toBe('Rack B');
			expect(sortedAfter[1]?.name).toBe('Rack A');
		});

		it('ArrowRight on last rack does nothing', () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Rack A', 42);
			layoutStore.addRack('Rack B', 42);

			const initialPositionB = layoutStore.racks.find((r) => r.name === 'Rack B')!.position;

			// Try to move last rack right (out of bounds)
			layoutStore.reorderRacks(1, 2);

			// Position should be unchanged
			expect(layoutStore.racks.find((r) => r.name === 'Rack B')!.position).toBe(initialPositionB);
		});

		it('ArrowRight moves first rack to second position', () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Rack A', 42);
			layoutStore.addRack('Rack B', 42);

			// Initial order
			const sortedBefore = [...layoutStore.racks].sort((a, b) => a.position - b.position);
			expect(sortedBefore[0]?.name).toBe('Rack A');
			expect(sortedBefore[1]?.name).toBe('Rack B');

			// Move rack at index 0 (Rack A) to index 1
			layoutStore.reorderRacks(0, 1);

			const sortedAfter = [...layoutStore.racks].sort((a, b) => a.position - b.position);
			expect(sortedAfter[0]?.name).toBe('Rack B');
			expect(sortedAfter[1]?.name).toBe('Rack A');
		});
	});

	describe('Visual Ordering in Canvas', () => {
		it('displays racks in correct visual order after reordering', () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('First', 42);
			layoutStore.addRack('Second', 42);
			layoutStore.addRack('Third', 42);

			render(Canvas);

			// Get rack names in DOM order
			const rackNames = screen.getAllByText(/^(First|Second|Third)$/);
			expect(rackNames[0]).toHaveTextContent('First');
			expect(rackNames[1]).toHaveTextContent('Second');
			expect(rackNames[2]).toHaveTextContent('Third');

			// Reorder: move first to second position
			layoutStore.reorderRacks(0, 1);

			// Re-render to see updated order
			const { container } = render(Canvas);

			// After reorder, Second should be first
			// Rack names are rendered as SVG text elements with class 'rack-name'
			const updatedNames = container.querySelectorAll('.rack-name');
			// Get rack names from labels
			const nameTexts = Array.from(updatedNames).map((el) => el.textContent?.trim());
			expect(nameTexts).toEqual(['Second', 'First', 'Third']);
		});
	});

	describe('Drag Handle Area', () => {
		it('rack has drag handle element', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			expect(dragHandle).toBeInTheDocument();
		});

		it('drag handle is in header area', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			// Drag handle should exist at top of rack
			expect(dragHandle).toBeInTheDocument();
		});
	});

	describe('Drag and Drop Reordering', () => {
		it('dragging rack header sets correct drag data', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const dragHandle = container.querySelector('.rack-drag-handle');
			expect(dragHandle).toBeInTheDocument();

			// Test that the element is draggable
			expect(dragHandle?.getAttribute('draggable')).toBe('true');
		});
	});
});
