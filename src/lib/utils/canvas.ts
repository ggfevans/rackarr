/**
 * Canvas Utility Functions
 * Calculations for fit-all zoom and rack bounding boxes
 */

import type { Rack } from '$lib/types';

// Rack rendering constants (must match Rack.svelte)
const U_HEIGHT = 22;
const RACK_WIDTH = 220;
const NAME_HEIGHT = 28;
const RACK_GAP = 24;

/**
 * Bounding box interface
 */
export interface Bounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Rack position interface for bounding box calculation
 */
export interface RackPosition {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Fit-all result with zoom and pan values
 */
export interface FitAllResult {
	zoom: number;
	panX: number;
	panY: number;
}

/**
 * Padding around content for fit-all calculation (in pixels)
 */
const FIT_ALL_PADDING = 48;

/**
 * Maximum zoom level for fit-all
 */
const FIT_ALL_MAX_ZOOM = 2;

/**
 * Calculate the bounding box that encompasses all racks.
 *
 * @param racks - Array of rack positions with x, y, width, height
 * @returns Bounding box { x, y, width, height } or zero bounds for empty array
 */
export function calculateRacksBoundingBox(racks: RackPosition[]): Bounds {
	if (racks.length === 0) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const rack of racks) {
		minX = Math.min(minX, rack.x);
		minY = Math.min(minY, rack.y);
		maxX = Math.max(maxX, rack.x + rack.width);
		maxY = Math.max(maxY, rack.y + rack.height);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}

/**
 * Calculate zoom and pan values to fit all racks in the viewport.
 *
 * The calculation:
 * 1. Find bounding box of all racks
 * 2. Add padding around the content
 * 3. Calculate zoom to fit content in viewport
 * 4. Cap zoom at maximum (200%)
 * 5. Calculate pan to center content
 *
 * @param racks - Array of rack positions
 * @param viewportWidth - Width of the viewport in pixels
 * @param viewportHeight - Height of the viewport in pixels
 * @returns { zoom, panX, panY } values for panzoom
 */
export function calculateFitAll(
	racks: RackPosition[],
	viewportWidth: number,
	viewportHeight: number
): FitAllResult {
	if (racks.length === 0) {
		return { zoom: 1, panX: 0, panY: 0 };
	}

	const bounds = calculateRacksBoundingBox(racks);

	// Add padding to content dimensions
	const contentWidth = bounds.width + FIT_ALL_PADDING * 2;
	const contentHeight = bounds.height + FIT_ALL_PADDING * 2;

	// Calculate zoom to fit content in viewport
	const zoomX = viewportWidth / contentWidth;
	const zoomY = viewportHeight / contentHeight;

	// Use smaller zoom to ensure content fits, cap at max zoom
	const zoom = Math.min(zoomX, zoomY, FIT_ALL_MAX_ZOOM);

	// Calculate pan to center content in viewport
	// Pan formula: (viewport - content*zoom) / 2 - bounds.origin*zoom
	const panX = (viewportWidth - bounds.width * zoom) / 2 - bounds.x * zoom;
	const panY = (viewportHeight - bounds.height * zoom) / 2 - bounds.y * zoom;

	return { zoom, panX, panY };
}

/**
 * Convert racks to RackPosition array for bounding box calculation.
 * Sorts racks by position and calculates x coordinates based on layout.
 *
 * @param racks - Array of racks from the layout store
 * @returns Array of RackPosition objects with calculated coordinates
 */
export function racksToPositions(racks: Rack[]): RackPosition[] {
	if (racks.length === 0) return [];

	// Sort by position
	const sorted = [...racks].sort((a, b) => a.position - b.position);

	// Find max height for vertical alignment (racks align at bottom)
	const maxHeight = Math.max(...sorted.map((r) => r.height * U_HEIGHT + NAME_HEIGHT));

	let currentX = 0;
	return sorted.map((rack) => {
		const height = rack.height * U_HEIGHT + NAME_HEIGHT;
		const position: RackPosition = {
			x: currentX,
			y: maxHeight - height, // Align to bottom
			width: RACK_WIDTH,
			height
		};
		currentX += RACK_WIDTH + RACK_GAP;
		return position;
	});
}
