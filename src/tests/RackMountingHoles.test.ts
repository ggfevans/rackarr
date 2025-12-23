import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Rack from '$lib/components/Rack.svelte';
import { generateExportSVG } from '$lib/utils/export';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import type { Rack as RackType, ExportOptions, DeviceType } from '$lib/types';

/**
 * Issue #134: Rack mounting holes positioned incorrectly in center of posts
 *
 * On real server racks, mounting holes are located near the inner edge of the rails
 * (facing the device mounting area), not centered in the post.
 *
 * Current: holes at RAIL_WIDTH / 2 (~8.5px from outer edge)
 * Expected: holes at ~12-14px from outer edge (3-5px from inner edge)
 *
 * RAIL_WIDTH = 17px, so inner edge is at x=17 for left rail
 */
describe('Rack Mounting Holes Position (#134)', () => {
	// Constants matching Rack.svelte
	const RAIL_WIDTH = 17;
	const RACK_WIDTH = 220;

	let testRack: RackType;

	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();

		const layoutStore = getLayoutStore();
		const rack = layoutStore.addRack('Test Rack', 12);
		testRack = rack!;
	});

	describe('Interactive Rack Component', () => {
		it('renders 3 mounting holes per U on left rail', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const holes = container.querySelectorAll('.rack-hole');
			// 12U rack = 12 * 3 holes per side * 2 sides = 72 holes
			expect(holes.length).toBe(72);
		});

		it('positions left rail holes near inner edge of rail (12-14px from outer edge)', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const holes = container.querySelectorAll('.rack-hole');
			// Get the first hole (left rail)
			const firstHole = holes[0] as SVGRectElement;
			const holeX = parseFloat(firstHole.getAttribute('x') || '0');

			// Holes should be positioned 12-14px from outer edge (x = 0)
			// This means x should be between 12 and 14 (accounting for hole width of 3px)
			// The x attribute is the left edge of the hole rect
			expect(holeX).toBeGreaterThanOrEqual(11);
			expect(holeX).toBeLessThanOrEqual(15);
		});

		it('positions right rail holes near inner edge of rail (3-5px from inner edge)', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const holes = container.querySelectorAll('.rack-hole');
			// Right rail holes start after left rail holes (first 36 are left, next 36 are right for 12U)
			// In the current code, holes are rendered: 3 left, then 3 right per U
			// So right rail first hole is at index 3
			const rightHole = holes[3] as SVGRectElement;
			const holeX = parseFloat(rightHole.getAttribute('x') || '0');

			// Right rail starts at RACK_WIDTH - RAIL_WIDTH = 203
			// Holes should be 3-5px from inner edge, meaning x should be between 203 and 207
			const rightRailInnerEdge = RACK_WIDTH - RAIL_WIDTH;
			expect(holeX).toBeGreaterThanOrEqual(rightRailInnerEdge);
			expect(holeX).toBeLessThanOrEqual(rightRailInnerEdge + 6);
		});

		it('left rail holes do not extend into device mounting area', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const holes = container.querySelectorAll('.rack-hole');
			// Check all left rail holes (every 6th hole starting from 0, 1, 2)
			for (let i = 0; i < holes.length; i += 6) {
				for (let j = 0; j < 3; j++) {
					const hole = holes[i + j] as SVGRectElement;
					const holeX = parseFloat(hole.getAttribute('x') || '0');
					const holeWidth = parseFloat(hole.getAttribute('width') || '0');
					// Hole right edge should not exceed RAIL_WIDTH
					expect(holeX + holeWidth).toBeLessThanOrEqual(RAIL_WIDTH);
				}
			}
		});

		it('right rail holes do not extend beyond rack width', () => {
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const holes = container.querySelectorAll('.rack-hole');
			// Check right rail holes (every 6th hole starting from 3, 4, 5)
			for (let i = 3; i < holes.length; i += 6) {
				for (let j = 0; j < 3 && i + j < holes.length; j++) {
					const hole = holes[i + j] as SVGRectElement;
					const holeX = parseFloat(hole.getAttribute('x') || '0');
					const holeWidth = parseFloat(hole.getAttribute('width') || '0');
					// Hole right edge should not exceed RACK_WIDTH
					expect(holeX + holeWidth).toBeLessThanOrEqual(RACK_WIDTH);
				}
			}
		});
	});

	describe('Export SVG', () => {
		const mockDeviceLibrary: DeviceType[] = [];
		const defaultOptions: ExportOptions = {
			format: 'png',
			scope: 'all',
			includeNames: false,
			includeLegend: false,
			background: 'dark'
		};

		it('renders holes on both rails in export (matching canvas)', () => {
			const svg = generateExportSVG([testRack], mockDeviceLibrary, defaultOptions);

			// Export now uses rects (matching Rack.svelte)
			// Find rects with rx="0.5" which are the mounting holes
			const allRects = svg.querySelectorAll('rect[rx="0.5"]');
			// 12U rack = 12 * 3 holes per side * 2 sides = 72 holes
			expect(allRects.length).toBe(72);
		});

		it('positions left rail holes near inner edge in export', () => {
			const svg = generateExportSVG([testRack], mockDeviceLibrary, defaultOptions);

			// Get hole rects (those with rx="0.5")
			const holes = svg.querySelectorAll('rect[rx="0.5"]');
			expect(holes.length).toBeGreaterThan(0);

			// First hole is left rail
			const leftHole = holes[0] as SVGRectElement;
			const holeX = parseFloat(leftHole.getAttribute('x') || '0');

			// Left rail holes should be positioned 12-14px from outer edge
			expect(holeX).toBeGreaterThanOrEqual(11);
			expect(holeX).toBeLessThanOrEqual(15);
		});

		it('positions right rail holes near inner edge in export', () => {
			const svg = generateExportSVG([testRack], mockDeviceLibrary, defaultOptions);

			// Get hole rects (those with rx="0.5")
			const holes = svg.querySelectorAll('rect[rx="0.5"]');
			expect(holes.length).toBeGreaterThan(0);

			// Second hole is right rail (holes rendered: left, right, left, right per offset)
			const rightHole = holes[1] as SVGRectElement;
			const holeX = parseFloat(rightHole.getAttribute('x') || '0');

			// Right rail starts at RACK_WIDTH - RAIL_WIDTH = 203
			// Holes should be near inner edge: x should be between 203 and 207
			const rightRailInnerEdge = RACK_WIDTH - RAIL_WIDTH;
			expect(holeX).toBeGreaterThanOrEqual(rightRailInnerEdge);
			expect(holeX).toBeLessThanOrEqual(rightRailInnerEdge + 6);
		});

		it('export holes are positioned identically to interactive component', () => {
			// Render interactive component
			const { container } = render(Rack, {
				props: {
					rack: testRack,
					deviceLibrary: [],
					selected: false
				}
			});

			// Generate export SVG
			const svg = generateExportSVG([testRack], mockDeviceLibrary, defaultOptions);

			// Get left rail hole from interactive (first hole)
			const interactiveHoles = container.querySelectorAll('.rack-hole');
			const interactiveHole = interactiveHoles[0] as SVGRectElement;
			const interactiveX = parseFloat(interactiveHole.getAttribute('x') || '0');

			// Get left rail hole from export (first hole with rx="0.5")
			const exportHoles = svg.querySelectorAll('rect[rx="0.5"]');
			const exportHole = exportHoles[0] as SVGRectElement;
			const exportX = parseFloat(exportHole.getAttribute('x') || '0');

			// Both should be at the same X position (left rail, near inner edge)
			expect(exportX).toBe(interactiveX);

			// Both should use same dimensions
			const interactiveWidth = parseFloat(interactiveHole.getAttribute('width') || '0');
			const exportWidth = parseFloat(exportHole.getAttribute('width') || '0');
			expect(exportWidth).toBe(interactiveWidth);
		});
	});
});
