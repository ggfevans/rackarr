/**
 * Drag and Drop Utilities
 * Handles drag data, position calculation, and drop validation
 */

import type { DeviceType, Rack } from '$lib/types';
import { canPlaceDevice } from './collision';

/**
 * Drag data structure for drag-and-drop operations
 */
export interface DragData {
	/** Type of drag operation */
	type: 'palette' | 'rack-device';
	/** Device type being dragged */
	device: DeviceType;
	/** Source rack ID (for rack-device type) */
	sourceRackId?: string;
	/** Source device index in rack (for rack-device type) */
	sourceIndex?: number;
}

/**
 * Drop feedback states
 */
export type DropFeedback = 'valid' | 'invalid' | 'blocked';

/**
 * Calculate the target U position from mouse Y coordinate
 * @param mouseY - Mouse Y position relative to rack SVG
 * @param rackHeight - Rack height in U
 * @param uHeight - Height of one U in pixels
 * @param rackPadding - Top padding of rack SVG
 * @returns Target U position (1-indexed, 1 is at bottom)
 */
export function calculateDropPosition(
	mouseY: number,
	rackHeight: number,
	uHeight: number,
	_rackPadding: number
): number {
	// SVG coordinate system: y=0 at top
	// U1 is at bottom, U{rackHeight} is at top
	// Total rack height in pixels = rackHeight * uHeight
	const totalHeight = rackHeight * uHeight;

	// Calculate which U the mouse is over
	// mouseY=0 -> top -> U{rackHeight}
	// mouseY=totalHeight -> bottom -> U1

	// First, clamp mouseY to valid range
	const clampedY = Math.max(0, Math.min(mouseY, totalHeight));

	// Calculate U from bottom (U1 = bottom)
	// At y=totalHeight, U=1. At y=0, U=rackHeight
	const uFromTop = Math.floor(clampedY / uHeight);
	const uPosition = rackHeight - uFromTop;

	// Clamp to valid range [1, rackHeight]
	return Math.max(1, Math.min(uPosition, rackHeight));
}

/**
 * Get drop feedback for a potential placement
 * @param rack - Target rack
 * @param deviceLibrary - Device library for height lookup
 * @param deviceHeight - Height of device being dropped
 * @param targetU - Target U position
 * @param excludeIndex - Optional device index to exclude from collision check (for moves within same rack)
 * @returns Feedback: 'valid', 'invalid', or 'blocked'
 */
export function getDropFeedback(
	rack: Rack,
	deviceLibrary: DeviceType[],
	deviceHeight: number,
	targetU: number,
	excludeIndex?: number
): DropFeedback {
	// Check bounds first
	if (targetU < 1) {
		return 'invalid';
	}

	if (targetU + deviceHeight - 1 > rack.height) {
		return 'invalid';
	}

	// Check for collisions
	const canPlace = canPlaceDevice(rack, deviceLibrary, deviceHeight, targetU, excludeIndex);

	if (!canPlace) {
		return 'blocked';
	}

	return 'valid';
}

/**
 * Create drag data for palette item
 * @param device - DeviceType being dragged
 * @returns DragData for palette drag
 */
export function createPaletteDragData(device: DeviceType): DragData {
	return {
		type: 'palette',
		device
	};
}

/**
 * Create drag data for rack device
 * @param device - DeviceType being dragged
 * @param rackId - Source rack ID
 * @param deviceIndex - Index of device in rack
 * @returns DragData for rack device drag
 */
export function createRackDeviceDragData(
	device: DeviceType,
	rackId: string,
	deviceIndex: number
): DragData {
	return {
		type: 'rack-device',
		device,
		sourceRackId: rackId,
		sourceIndex: deviceIndex
	};
}

/**
 * Serialize drag data to string for dataTransfer
 * @param data - Drag data to serialize
 * @returns JSON string
 */
export function serializeDragData(data: DragData): string {
	return JSON.stringify(data);
}

/**
 * Parse drag data from dataTransfer string
 * @param dataString - JSON string from dataTransfer
 * @returns Parsed DragData or null if invalid
 */
export function parseDragData(dataString: string): DragData | null {
	try {
		const data = JSON.parse(dataString) as DragData;
		if (data.type && data.device) {
			return data;
		}
		return null;
	} catch {
		return null;
	}
}
