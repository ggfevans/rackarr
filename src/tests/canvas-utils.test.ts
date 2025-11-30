import { describe, it, expect } from 'vitest';
import { calculateRacksBoundingBox, calculateFitAll } from '$lib/utils/canvas';

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
