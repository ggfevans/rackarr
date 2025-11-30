/**
 * Canvas Store
 * Manages panzoom instance and canvas state for zoom/pan functionality
 */

import type panzoom from 'panzoom';
import type { Rack } from '$lib/types';
import { calculateFitAll, racksToPositions } from '$lib/utils/canvas';

// Panzoom constants
export const ZOOM_MIN = 0.5; // 50%
export const ZOOM_MAX = 2; // 200%
export const ZOOM_STEP = 0.25; // 25%

type PanzoomInstance = ReturnType<typeof panzoom>;

// Module-level state
let panzoomInstance = $state<PanzoomInstance | null>(null);
let currentZoom = $state(1); // 1 = 100%
let canvasElement = $state<HTMLElement | null>(null);

// Derived values
const canZoomIn = $derived(currentZoom < ZOOM_MAX);
const canZoomOut = $derived(currentZoom > ZOOM_MIN);
const zoomPercentage = $derived(Math.round(currentZoom * 100));

/**
 * Reset the store to initial state (primarily for testing)
 */
export function resetCanvasStore(): void {
	if (panzoomInstance) {
		panzoomInstance.dispose();
	}
	panzoomInstance = null;
	currentZoom = 1;
	canvasElement = null;
}

/**
 * Get access to the Canvas store
 * @returns Store object with state and actions
 */
export function getCanvasStore() {
	return {
		// State getters
		get zoom() {
			return currentZoom;
		},
		get zoomPercentage() {
			return zoomPercentage;
		},
		get canZoomIn() {
			return canZoomIn;
		},
		get canZoomOut() {
			return canZoomOut;
		},
		get hasPanzoom() {
			return panzoomInstance !== null;
		},

		// Actions
		setPanzoomInstance,
		setCanvasElement,
		disposePanzoom,
		zoomIn,
		zoomOut,
		setZoom,
		resetZoom,
		getTransform,
		moveTo,
		smoothMoveTo,
		fitAll
	};
}

/**
 * Set the panzoom instance (called from Canvas component on mount)
 */
function setPanzoomInstance(instance: PanzoomInstance): void {
	panzoomInstance = instance;

	// Listen for zoom changes to keep state in sync
	instance.on('zoom', () => {
		const transform = instance.getTransform();
		currentZoom = transform.scale;
	});

	// Initialize currentZoom from panzoom
	const transform = instance.getTransform();
	currentZoom = transform.scale;
}

/**
 * Dispose panzoom instance (called from Canvas component on unmount)
 */
function disposePanzoom(): void {
	if (panzoomInstance) {
		panzoomInstance.dispose();
		panzoomInstance = null;
	}
}

/**
 * Zoom in by one step
 */
function zoomIn(): void {
	if (!panzoomInstance || currentZoom >= ZOOM_MAX) return;

	const newZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
	const transform = panzoomInstance.getTransform();

	// Zoom centered on current view
	panzoomInstance.zoomAbs(transform.x, transform.y, newZoom);
}

/**
 * Zoom out by one step
 */
function zoomOut(): void {
	if (!panzoomInstance || currentZoom <= ZOOM_MIN) return;

	const newZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
	const transform = panzoomInstance.getTransform();

	panzoomInstance.zoomAbs(transform.x, transform.y, newZoom);
}

/**
 * Set zoom to specific level
 * @param scale - Zoom scale (1 = 100%)
 */
function setZoom(scale: number): void {
	if (!panzoomInstance) return;

	const clampedScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, scale));
	const transform = panzoomInstance.getTransform();

	panzoomInstance.zoomAbs(transform.x, transform.y, clampedScale);
}

/**
 * Reset zoom to 100% and center
 */
function resetZoom(): void {
	if (!panzoomInstance) return;

	panzoomInstance.zoomAbs(0, 0, 1);
	panzoomInstance.moveTo(0, 0);
}

/**
 * Get current transform state
 */
function getTransform(): { x: number; y: number; scale: number } {
	if (!panzoomInstance) {
		return { x: 0, y: 0, scale: 1 };
	}
	return panzoomInstance.getTransform();
}

/**
 * Move to specific position
 */
function moveTo(x: number, y: number): void {
	if (!panzoomInstance) return;
	panzoomInstance.moveTo(x, y);
}

/**
 * Smooth animated move to position with zoom
 */
function smoothMoveTo(x: number, y: number, scale: number): void {
	if (!panzoomInstance) return;

	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReducedMotion) {
		panzoomInstance.zoomAbs(x, y, scale);
		panzoomInstance.moveTo(x, y);
	} else {
		// Use panzoom's smooth zoom
		panzoomInstance.smoothZoomAbs(x, y, scale);
	}
}

/**
 * Set the canvas container element (for viewport measurements)
 */
function setCanvasElement(element: HTMLElement): void {
	canvasElement = element;
}

/**
 * Fit all racks in the viewport
 */
function fitAll(racks: Rack[]): void {
	if (!panzoomInstance || !canvasElement || racks.length === 0) return;

	// Get viewport dimensions
	const viewportWidth = canvasElement.clientWidth;
	const viewportHeight = canvasElement.clientHeight;

	// Convert racks to positions and calculate fit
	const rackPositions = racksToPositions(racks);
	const { zoom, panX, panY } = calculateFitAll(rackPositions, viewportWidth, viewportHeight);

	// Apply the transform with animation
	smoothMoveTo(panX, panY, zoom);
}
