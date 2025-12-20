import { describe, it, expect } from 'vitest';
import { calculateRacksBoundingBox, calculateFitAll, racksToPositions } from '$lib/utils/canvas';
import { createTestRack } from './factories';

describe('calculateRacksBoundingBox', () => {
	it('returns zero bounds for empty array', () => {
		const bounds = calculateRacksBoundingBox([]);
		expect(bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
	});

	it('returns rack bounds for single rack', () => {
		const racks = [{ x: 100, y: 50, width: 200, height: 800 }];
		const bounds = calculateRacksBoundingBox(racks);
		expect(bounds).toEqual({ x: 100, y: 50, width: 200, height: 800 });
	});

	it('calculates encompassing bounds for multiple racks', () => {
		const racks = [
			{ x: 0, y: 0, width: 100, height: 100 },
			{ x: 200, y: 50, width: 100, height: 150 }
		];
		const bounds = calculateRacksBoundingBox(racks);
		expect(bounds).toEqual({ x: 0, y: 0, width: 300, height: 200 });
	});

	it('handles racks at negative coordinates', () => {
		const racks = [
			{ x: -50, y: -25, width: 100, height: 100 },
			{ x: 100, y: 50, width: 100, height: 100 }
		];
		const bounds = calculateRacksBoundingBox(racks);
		expect(bounds).toEqual({ x: -50, y: -25, width: 250, height: 175 });
	});

	it('handles overlapping racks', () => {
		const racks = [
			{ x: 0, y: 0, width: 150, height: 150 },
			{ x: 50, y: 50, width: 150, height: 150 }
		];
		const bounds = calculateRacksBoundingBox(racks);
		expect(bounds).toEqual({ x: 0, y: 0, width: 200, height: 200 });
	});

	it('handles racks with same position', () => {
		const racks = [
			{ x: 100, y: 100, width: 200, height: 300 },
			{ x: 100, y: 100, width: 200, height: 300 }
		];
		const bounds = calculateRacksBoundingBox(racks);
		expect(bounds).toEqual({ x: 100, y: 100, width: 200, height: 300 });
	});
});

describe('calculateFitAll', () => {
	it('returns default values for empty racks', () => {
		const result = calculateFitAll([], 800, 600);
		expect(result).toEqual({ zoom: 1, panX: 0, panY: 0 });
	});

	it('calculates zoom with 48px padding', () => {
		// Rack of 200x400, viewport of 800x600
		// With 48px padding on each side: content area = 800-96=704 x 600-96=504
		// Available for content: 704 x 504
		// Rack needs: 200 x 400
		// zoomX = 704 / 200 = 3.52, zoomY = 504 / 400 = 1.26
		// zoom = min(3.52, 1.26, 2) = 1.26
		const racks = [{ x: 0, y: 0, width: 200, height: 400 }];
		const result = calculateFitAll(racks, 800, 600);
		expect(result.zoom).toBeGreaterThan(0);
		expect(result.zoom).toBeLessThanOrEqual(2);
	});

	it('caps zoom at 200%', () => {
		// Very small rack in large viewport should cap at 200%
		const racks = [{ x: 0, y: 0, width: 50, height: 50 }];
		const result = calculateFitAll(racks, 800, 600);
		expect(result.zoom).toBe(2);
	});

	it('clamps zoom to minimum (25%) for large content', () => {
		// Very large rack that would require less than min zoom (0.25)
		const racks = [{ x: 0, y: 0, width: 4000, height: 3000 }];
		const result = calculateFitAll(racks, 800, 600);
		// Should be clamped to minimum zoom
		expect(result.zoom).toBe(0.25);
	});

	it('centers content in viewport horizontally', () => {
		// Rack of 200x400 at origin, viewport 800x600
		const racks = [{ x: 0, y: 0, width: 200, height: 400 }];
		const result = calculateFitAll(racks, 800, 600);
		// panX should center the content
		expect(result.panX).toBeGreaterThan(0);
	});

	it('centers content in viewport vertically', () => {
		// Wide rack: 600x100 at origin, viewport 800x600
		const racks = [{ x: 0, y: 0, width: 600, height: 100 }];
		const result = calculateFitAll(racks, 800, 600);
		// panY should center the content
		expect(result.panY).toBeGreaterThan(0);
	});

	it('handles content not at origin', () => {
		// Rack at x=200, y=100
		const racks = [{ x: 200, y: 100, width: 200, height: 400 }];
		const result = calculateFitAll(racks, 800, 600);
		// Should still calculate valid zoom and pan
		expect(result.zoom).toBeGreaterThan(0);
		expect(result.zoom).toBeLessThanOrEqual(2);
	});

	it('handles multiple racks spread out', () => {
		const racks = [
			{ x: 0, y: 0, width: 220, height: 500 },
			{ x: 244, y: 0, width: 220, height: 500 },
			{ x: 488, y: 0, width: 220, height: 500 }
		];
		const result = calculateFitAll(racks, 800, 600);
		// Total bounds: 708 x 500
		expect(result.zoom).toBeGreaterThan(0);
		expect(result.zoom).toBeLessThanOrEqual(2);
	});

	it('returns same result for same input', () => {
		const racks = [{ x: 50, y: 50, width: 300, height: 400 }];
		const result1 = calculateFitAll(racks, 800, 600);
		const result2 = calculateFitAll(racks, 800, 600);
		expect(result1).toEqual(result2);
	});

	it('adjusts for different viewport sizes', () => {
		const racks = [{ x: 0, y: 0, width: 400, height: 400 }];
		const resultSmall = calculateFitAll(racks, 500, 500);
		const resultLarge = calculateFitAll(racks, 1000, 1000);
		// Larger viewport should allow for larger zoom (up to cap)
		expect(resultLarge.zoom).toBeGreaterThanOrEqual(resultSmall.zoom);
	});
});

// =============================================================================
// racksToPositions Tests
// =============================================================================

// Constants matching canvas.ts
const U_HEIGHT = 22;
const RACK_WIDTH = 220;
const RAIL_WIDTH = 17;
const RACK_PADDING = 18;
const RACK_GAP = 24;
const RACK_ROW_PADDING = 16;
const DUAL_VIEW_GAP = 24;
const DUAL_VIEW_EXTRA_HEIGHT = 56;

// Helper to calculate expected rack height
const getRackHeight = (height: number) =>
	RACK_PADDING + RAIL_WIDTH * 2 + height * U_HEIGHT + DUAL_VIEW_EXTRA_HEIGHT;

// Helper to get dual-view width
const getDualViewWidth = () => RACK_WIDTH * 2 + DUAL_VIEW_GAP;

describe('racksToPositions', () => {
	describe('empty array handling', () => {
		it('returns empty array for empty input', () => {
			const result = racksToPositions([]);
			expect(result).toEqual([]);
		});
	});

	describe('single rack positioning', () => {
		it('positions single rack at rack-row padding offset', () => {
			const rack = createTestRack({ height: 42, position: 0 });
			const result = racksToPositions([rack]);

			expect(result).toHaveLength(1);
			expect(result[0].x).toBe(RACK_ROW_PADDING);
			expect(result[0].y).toBe(RACK_ROW_PADDING);
		});

		it('calculates correct width for dual-view mode', () => {
			const rack = createTestRack({ height: 42, position: 0 });
			const result = racksToPositions([rack]);

			// Width = 2 * RACK_WIDTH + DUAL_VIEW_GAP = 2 * 220 + 24 = 464
			expect(result[0].width).toBe(getDualViewWidth());
		});

		it('calculates correct height based on U count', () => {
			const rack = createTestRack({ height: 42, position: 0 });
			const result = racksToPositions([rack]);

			// Height = RACK_PADDING + RAIL_WIDTH * 2 + height * U_HEIGHT + DUAL_VIEW_EXTRA_HEIGHT
			// = 18 + 17 * 2 + 42 * 22 + 56 = 18 + 34 + 924 + 56 = 1032
			expect(result[0].height).toBe(getRackHeight(42));
		});

		it('handles different rack heights', () => {
			const smallRack = createTestRack({ height: 12, position: 0 });
			const largeRack = createTestRack({ height: 48, position: 0 });

			const smallResult = racksToPositions([smallRack]);
			const largeResult = racksToPositions([largeRack]);

			expect(smallResult[0].height).toBe(getRackHeight(12));
			expect(largeResult[0].height).toBe(getRackHeight(48));
			expect(largeResult[0].height).toBeGreaterThan(smallResult[0].height);
		});
	});

	describe('multiple rack positioning', () => {
		it('positions racks side by side with gap', () => {
			const rack1 = createTestRack({ height: 42, position: 0 });
			const rack2 = createTestRack({ height: 42, position: 1 });
			const result = racksToPositions([rack1, rack2]);

			expect(result).toHaveLength(2);
			// First rack at row padding
			expect(result[0].x).toBe(RACK_ROW_PADDING);
			// Second rack at: RACK_ROW_PADDING + getDualViewWidth() + RACK_GAP
			expect(result[1].x).toBe(RACK_ROW_PADDING + getDualViewWidth() + RACK_GAP);
		});

		it('sorts racks by position', () => {
			const rack1 = createTestRack({ height: 42, position: 2 });
			const rack2 = createTestRack({ height: 42, position: 0 });
			const rack3 = createTestRack({ height: 42, position: 1 });
			const result = racksToPositions([rack1, rack2, rack3]);

			expect(result).toHaveLength(3);
			// All should have same height, verify they're in order by x position
			expect(result[0].x).toBeLessThan(result[1].x);
			expect(result[1].x).toBeLessThan(result[2].x);
		});

		it('vertically aligns racks of different heights to bottom', () => {
			const shortRack = createTestRack({ height: 24, position: 0 });
			const tallRack = createTestRack({ height: 42, position: 1 });
			const result = racksToPositions([shortRack, tallRack]);

			// Both should end at the same y + height (bottom aligned to max height)
			const shortBottom = result[0].y + result[0].height;
			const tallBottom = result[1].y + result[1].height;
			expect(shortBottom).toBe(tallBottom);

			// Short rack should have larger y to account for height difference
			expect(result[0].y).toBeGreaterThan(result[1].y);
		});

		it('positions three racks correctly', () => {
			const rack1 = createTestRack({ height: 42, position: 0 });
			const rack2 = createTestRack({ height: 42, position: 1 });
			const rack3 = createTestRack({ height: 42, position: 2 });
			const result = racksToPositions([rack1, rack2, rack3]);

			expect(result).toHaveLength(3);

			// Verify spacing between racks
			const spacing01 = result[1].x - (result[0].x + result[0].width);
			const spacing12 = result[2].x - (result[1].x + result[1].width);

			expect(spacing01).toBe(RACK_GAP);
			expect(spacing12).toBe(RACK_GAP);
		});
	});

	describe('edge cases', () => {
		it('handles minimum rack height (1U)', () => {
			const rack = createTestRack({ height: 1, position: 0 });
			const result = racksToPositions([rack]);

			expect(result[0].height).toBe(getRackHeight(1));
			expect(result[0].height).toBeGreaterThan(0);
		});

		it('handles very tall racks', () => {
			const rack = createTestRack({ height: 100, position: 0 });
			const result = racksToPositions([rack]);

			expect(result[0].height).toBe(getRackHeight(100));
		});

		it('handles racks with same position value', () => {
			// Edge case - shouldn't happen in practice but should be handled
			const rack1 = createTestRack({ height: 42, position: 0 });
			const rack2 = createTestRack({ height: 42, position: 0 });
			const result = racksToPositions([rack1, rack2]);

			expect(result).toHaveLength(2);
			// Both should be positioned
			expect(result[0].x).toBeDefined();
			expect(result[1].x).toBeDefined();
		});

		it('preserves original racks array (non-mutating)', () => {
			const racks = [
				createTestRack({ height: 42, position: 1 }),
				createTestRack({ height: 42, position: 0 })
			];
			const originalOrder = [...racks];

			racksToPositions(racks);

			// Original array should not be modified
			expect(racks[0].position).toBe(originalOrder[0].position);
			expect(racks[1].position).toBe(originalOrder[1].position);
		});
	});

	describe('position calculation accuracy', () => {
		it('produces consistent results for same input', () => {
			const rack = createTestRack({ height: 42, position: 0 });
			const result1 = racksToPositions([rack]);
			const result2 = racksToPositions([rack]);

			expect(result1).toEqual(result2);
		});

		it('all positions have positive coordinates', () => {
			const racks = [
				createTestRack({ height: 42, position: 0 }),
				createTestRack({ height: 24, position: 1 }),
				createTestRack({ height: 48, position: 2 })
			];
			const result = racksToPositions(racks);

			for (const pos of result) {
				expect(pos.x).toBeGreaterThanOrEqual(0);
				expect(pos.y).toBeGreaterThanOrEqual(0);
				expect(pos.width).toBeGreaterThan(0);
				expect(pos.height).toBeGreaterThan(0);
			}
		});

		it('no racks overlap horizontally', () => {
			const racks = [
				createTestRack({ height: 42, position: 0 }),
				createTestRack({ height: 42, position: 1 }),
				createTestRack({ height: 42, position: 2 })
			];
			const result = racksToPositions(racks);

			for (let i = 0; i < result.length - 1; i++) {
				const current = result[i];
				const next = result[i + 1];
				const currentRight = current.x + current.width;
				expect(currentRight).toBeLessThan(next.x);
			}
		});
	});
});
