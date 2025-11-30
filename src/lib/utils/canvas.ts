/**
 * Canvas Utility Functions
 * Calculations for fit-all zoom and rack bounding boxes
 */

import type { Rack } from '$lib/types';

// Rack rendering constants (must match Rack.svelte and Canvas.svelte)
const U_HEIGHT = 22;
const RACK_WIDTH = 220;
const RACK_PADDING = 18; // Space at top for rack name (must match Rack.svelte)
const RACK_GAP = 24; // Gap between racks in rack-row
const RACK_ROW_PADDING = 16; // Padding around rack-row

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
 * Minimum zoom level (must match ZOOM_MIN in canvas store)
 */
const FIT_ALL_MIN_ZOOM = 0.25;

/**
 * Calculate zoom and pan values to fit all racks in the viewport.
 *
 * The calculation:
 * 1. Find bounding box of all racks
 * 2. Add padding around the content
 * 3. Calculate zoom to fit content in viewport
 * 4. Clamp zoom between min (50%) and max (200%)
 * 5. Calculate pan to center content (using clamped zoom)
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

	// The actual visual content includes the rack-row's CSS padding
	const visualContentWidth = bounds.width + RACK_ROW_PADDING * 2;
	const visualContentHeight = bounds.height + RACK_ROW_PADDING * 2;

	// For zoom calculation, add extra visual margin (FIT_ALL_PADDING) around the content
	const contentWithMarginWidth = visualContentWidth + FIT_ALL_PADDING * 2;
	const contentWithMarginHeight = visualContentHeight + FIT_ALL_PADDING * 2;

	// Calculate zoom to fit content with margin in viewport
	const zoomX = viewportWidth / contentWithMarginWidth;
	const zoomY = viewportHeight / contentWithMarginHeight;

	// Use smaller zoom to ensure content fits, clamp between min and max
	const zoom = Math.max(FIT_ALL_MIN_ZOOM, Math.min(zoomX, zoomY, FIT_ALL_MAX_ZOOM));

	// Calculate pan to center the visual content (rack-row) in viewport
	const scaledContentWidth = visualContentWidth * zoom;
	const scaledContentHeight = visualContentHeight * zoom;

	// Pan formula: center the scaled content in the viewport
	let panX = (viewportWidth - scaledContentWidth) / 2;
	let panY = (viewportHeight - scaledContentHeight) / 2;

	if (scaledContentWidth > viewportWidth) {
		// Content wider than viewport - align to left edge with small padding
		panX = FIT_ALL_PADDING;
	}

	if (scaledContentHeight > viewportHeight) {
		// Content taller than viewport - align to top edge with small padding
		panY = FIT_ALL_PADDING;
	}

	return { zoom, panX, panY };
}

/**
 * Convert racks to RackPosition array for bounding box calculation.
 * Sorts racks by position and calculates x coordinates based on layout.
 * Accounts for rack-row padding and actual rendered heights.
 *
 * @param racks - Array of racks from the layout store
 * @returns Array of RackPosition objects with calculated coordinates
 */
export function racksToPositions(racks: Rack[]): RackPosition[] {
	if (racks.length === 0) return [];

	// Sort by position
	const sorted = [...racks].sort((a, b) => a.position - b.position);

	// Calculate total rendered height
	// SVG viewBoxHeight = rack.height * U_HEIGHT + RACK_PADDING
	// View toggle is now inside the SVG, so no additional height needed
	const getRackHeight = (rack: Rack) => rack.height * U_HEIGHT + RACK_PADDING;

	// Find max height for vertical alignment (racks align at bottom via CSS)
	const maxHeight = Math.max(...sorted.map(getRackHeight));

	// Account for rack-row padding
	let currentX = RACK_ROW_PADDING;
	const startY = RACK_ROW_PADDING;

	return sorted.map((rack) => {
		const height = getRackHeight(rack);
		const position: RackPosition = {
			x: currentX,
			y: startY + (maxHeight - height), // Align to bottom within padded area
			width: RACK_WIDTH,
			height
		};
		currentX += RACK_WIDTH + RACK_GAP;
		return position;
	});
}
