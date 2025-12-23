/**
 * Canvas Utility Functions
 * Calculations for fit-all zoom and rack positioning
 * v0.1.1: Single-rack mode - code supports multi-rack for v0.3 restoration
 */

import type { Rack } from '$lib/types';
import {
	U_HEIGHT_PX,
	BASE_RACK_WIDTH,
	RAIL_WIDTH,
	BASE_RACK_PADDING,
	RACK_GAP,
	RACK_ROW_PADDING,
	DUAL_VIEW_GAP,
	DUAL_VIEW_EXTRA_HEIGHT,
	FIT_ALL_PADDING,
	FIT_ALL_MAX_ZOOM
} from '$lib/constants/layout';

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

// FIT_ALL_PADDING and FIT_ALL_MAX_ZOOM imported from layout constants

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
 * v0.4: Dual-view mode shows front and rear side-by-side.
 * Multi-rack layout logic preserved for v0.3 restoration.
 *
 * @param racks - Array of racks from the layout store (max 1 in v0.1.1)
 * @returns Array of RackPosition objects with calculated coordinates
 */
export function racksToPositions(racks: Rack[]): RackPosition[] {
	if (racks.length === 0) return [];

	// Sort by position (no-op for single rack, preserved for v0.3)
	const sorted = [...racks].sort((a, b) => a.position - b.position);

	// Calculate total rendered height
	// SVG viewBoxHeight = BASE_RACK_PADDING + RAIL_WIDTH * 2 + rack.height * U_HEIGHT_PX
	// (rack name padding + top bar + U slots + bottom bar)
	// Plus dual-view wrapper extra height (v0.4)
	const getRackHeight = (rack: Rack) =>
		BASE_RACK_PADDING + RAIL_WIDTH * 2 + rack.height * U_HEIGHT_PX + DUAL_VIEW_EXTRA_HEIGHT;

	// v0.4: Dual-view mode shows two racks side by side
	// Visual width = 2 * BASE_RACK_WIDTH + DUAL_VIEW_GAP
	const getDualViewWidth = () => BASE_RACK_WIDTH * 2 + DUAL_VIEW_GAP;

	// Find max height for vertical alignment (single value in v0.1.1)
	const maxHeight = Math.max(...sorted.map(getRackHeight));

	// Account for rack-row padding
	let currentX = RACK_ROW_PADDING;
	const startY = RACK_ROW_PADDING;

	return sorted.map((rack) => {
		const height = getRackHeight(rack);
		const position: RackPosition = {
			x: currentX,
			y: startY + (maxHeight - height),
			width: getDualViewWidth(), // v0.4: Use dual-view width
			height
		};
		// Gap only applied between racks (none in single-rack mode)
		currentX += getDualViewWidth() + RACK_GAP;
		return position;
	});
}
