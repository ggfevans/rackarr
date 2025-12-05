/**
 * Export utilities for generating images from rack layouts
 */

import type { Rack, Device, ExportOptions, ExportFormat, ExportMetadata } from '$lib/types';
import JSZip from 'jszip';

// Interface for layout metadata (supports both Layout and Layout)
interface LayoutLike {
	version: string;
	name: string;
}

// Interface for rack metadata (supports both Rack and Rack)
interface RackLike {
	name: string;
	height: number;
	devices: { length: number };
}

// Constants matching Rack.svelte dimensions
const U_HEIGHT = 22;
const RACK_WIDTH = 220;
const RAIL_WIDTH = 17;
const RACK_PADDING = 4;
const RACK_GAP = 40;
const LEGEND_PADDING = 20;
const LEGEND_ITEM_HEIGHT = 24;
const EXPORT_PADDING = 20;

// Theme colours
const DARK_BG = '#1a1a1a';
const LIGHT_BG = '#f5f5f5';
const DARK_RACK_INTERIOR = '#2d2d2d';
const LIGHT_RACK_INTERIOR = '#e0e0e0';
const DARK_RACK_RAIL = '#404040';
const LIGHT_RACK_RAIL = '#c0c0c0';
const DARK_TEXT = '#ffffff';
const LIGHT_TEXT = '#1a1a1a';
const DARK_GRID = '#505050';
const LIGHT_GRID = '#a0a0a0';

/**
 * Filter devices by face for export
 */
function filterDevicesByFace(
	devices: Rack['devices'],
	faceFilter: 'front' | 'rear' | undefined
): Rack['devices'] {
	if (!faceFilter) return devices;
	return devices.filter((d) => d.face === faceFilter || d.face === 'both');
}

/**
 * Generate an SVG element for export
 */
export function generateExportSVG(
	racks: Rack[],
	deviceLibrary: Device[],
	options: ExportOptions
): SVGElement {
	const { includeNames, includeLegend, background, exportView } = options;

	// Determine if we're doing dual-view export
	const isDualView = exportView === 'both';

	// Get unique devices used in racks for legend
	const usedDeviceIds = new Set<string>();
	for (const rack of racks) {
		for (const device of rack.devices) {
			usedDeviceIds.add(device.libraryId);
		}
	}
	const usedDevices = deviceLibrary.filter((d) => usedDeviceIds.has(d.id));

	// Calculate dimensions
	const maxRackHeight = Math.max(...racks.map((r) => r.height), 0);
	// For dual view: each rack takes 2x width + gap between front/rear
	const singleRackWidth = racks.length * RACK_WIDTH + (racks.length - 1) * RACK_GAP;
	const totalRackWidth = isDualView
		? racks.length * (RACK_WIDTH * 2 + RACK_GAP) + (racks.length - 1) * RACK_GAP
		: singleRackWidth;

	const rackAreaHeight = maxRackHeight * U_HEIGHT + RACK_PADDING * 2;
	const legendWidth = includeLegend ? 180 : 0;
	const legendHeight = includeLegend
		? usedDevices.length * LEGEND_ITEM_HEIGHT + LEGEND_PADDING * 2
		: 0;

	const contentWidth = totalRackWidth + (includeLegend ? LEGEND_PADDING + legendWidth : 0);
	const contentHeight = Math.max(rackAreaHeight, legendHeight);

	const svgWidth = contentWidth + EXPORT_PADDING * 2;
	const svgHeight = contentHeight + EXPORT_PADDING * 2;

	// Determine colours based on background
	const isDark = background === 'dark';
	const bgColor =
		background === 'transparent' ? 'none' : background === 'dark' ? DARK_BG : LIGHT_BG;
	const rackInterior = isDark ? DARK_RACK_INTERIOR : LIGHT_RACK_INTERIOR;
	const rackRail = isDark ? DARK_RACK_RAIL : LIGHT_RACK_RAIL;
	const textColor = isDark ? DARK_TEXT : LIGHT_TEXT;
	const gridColor = isDark ? DARK_GRID : LIGHT_GRID;

	// Create SVG
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', String(svgWidth));
	svg.setAttribute('height', String(svgHeight));
	svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

	// Background
	if (background !== 'transparent') {
		const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bgRect.setAttribute('class', 'export-background');
		bgRect.setAttribute('x', '0');
		bgRect.setAttribute('y', '0');
		bgRect.setAttribute('width', String(svgWidth));
		bgRect.setAttribute('height', String(svgHeight));
		bgRect.setAttribute('fill', bgColor);
		svg.appendChild(bgRect);
	} else {
		// Add transparent background marker for tests
		const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bgRect.setAttribute('class', 'export-background');
		bgRect.setAttribute('x', '0');
		bgRect.setAttribute('y', '0');
		bgRect.setAttribute('width', String(svgWidth));
		bgRect.setAttribute('height', String(svgHeight));
		bgRect.setAttribute('fill', 'none');
		svg.appendChild(bgRect);
	}

	// Helper function to render a single rack view
	function renderRackView(
		rack: Rack,
		xOffset: number,
		yOffset: number,
		faceFilter: 'front' | 'rear' | undefined,
		viewLabel?: string
	): SVGGElement {
		const rackGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		rackGroup.setAttribute('transform', `translate(${xOffset}, ${yOffset})`);

		const rackHeight = rack.height * U_HEIGHT;

		// Rack interior
		const interior = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		interior.setAttribute('x', String(RAIL_WIDTH));
		interior.setAttribute('y', String(RACK_PADDING + RAIL_WIDTH));
		interior.setAttribute('width', String(RACK_WIDTH - RAIL_WIDTH * 2));
		interior.setAttribute('height', String(rackHeight));
		interior.setAttribute('fill', rackInterior);
		rackGroup.appendChild(interior);

		// Top bar (horizontal)
		const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		topBar.setAttribute('x', '0');
		topBar.setAttribute('y', String(RACK_PADDING));
		topBar.setAttribute('width', String(RACK_WIDTH));
		topBar.setAttribute('height', String(RAIL_WIDTH));
		topBar.setAttribute('fill', rackRail);
		rackGroup.appendChild(topBar);

		// Bottom bar (horizontal)
		const bottomBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bottomBar.setAttribute('x', '0');
		bottomBar.setAttribute('y', String(RACK_PADDING + RAIL_WIDTH + rackHeight));
		bottomBar.setAttribute('width', String(RACK_WIDTH));
		bottomBar.setAttribute('height', String(RAIL_WIDTH));
		bottomBar.setAttribute('fill', rackRail);
		rackGroup.appendChild(bottomBar);

		// Left rail (vertical)
		const leftRail = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		leftRail.setAttribute('x', '0');
		leftRail.setAttribute('y', String(RACK_PADDING + RAIL_WIDTH));
		leftRail.setAttribute('width', String(RAIL_WIDTH));
		leftRail.setAttribute('height', String(rackHeight));
		leftRail.setAttribute('fill', rackRail);
		rackGroup.appendChild(leftRail);

		// Right rail (vertical)
		const rightRail = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rightRail.setAttribute('x', String(RACK_WIDTH - RAIL_WIDTH));
		rightRail.setAttribute('y', String(RACK_PADDING + RAIL_WIDTH));
		rightRail.setAttribute('width', String(RAIL_WIDTH));
		rightRail.setAttribute('height', String(rackHeight));
		rightRail.setAttribute('fill', rackRail);
		rackGroup.appendChild(rightRail);

		// Grid lines
		for (let i = 0; i <= rack.height; i++) {
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			const y = i * U_HEIGHT + RACK_PADDING + RAIL_WIDTH;
			line.setAttribute('x1', String(RAIL_WIDTH));
			line.setAttribute('y1', String(y));
			line.setAttribute('x2', String(RACK_WIDTH - RAIL_WIDTH));
			line.setAttribute('y2', String(y));
			line.setAttribute('stroke', gridColor);
			line.setAttribute('stroke-width', '1');
			rackGroup.appendChild(line);
		}

		// Mounting holes on right rail (3 per U)
		const holeColor = isDark ? '#505050' : '#a0a0a0';
		for (let i = 0; i < rack.height; i++) {
			const baseY = i * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 4;
			const holeX = RACK_WIDTH - RAIL_WIDTH / 2;

			for (const offsetY of [0, 7, 14]) {
				const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				hole.setAttribute('cx', String(holeX));
				hole.setAttribute('cy', String(baseY + offsetY));
				hole.setAttribute('r', '2');
				hole.setAttribute('fill', holeColor);
				rackGroup.appendChild(hole);
			}
		}

		// U labels on left rail
		for (let i = 0; i < rack.height; i++) {
			const uNumber = rack.height - i;
			const labelY = i * U_HEIGHT + U_HEIGHT / 2 + RACK_PADDING + RAIL_WIDTH;

			const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			label.setAttribute('x', String(RAIL_WIDTH / 2));
			label.setAttribute('y', String(labelY));
			label.setAttribute('fill', textColor);
			label.setAttribute('font-size', '10');
			label.setAttribute('text-anchor', 'middle');
			label.setAttribute('dominant-baseline', 'middle');
			label.setAttribute('font-family', 'system-ui, sans-serif');
			label.textContent = String(uNumber);
			rackGroup.appendChild(label);
		}

		// Filter and render devices
		const filteredDevices = filterDevicesByFace(rack.devices, faceFilter);
		for (const placedDevice of filteredDevices) {
			const device = deviceLibrary.find((d) => d.id === placedDevice.libraryId);
			if (!device) continue;

			// Device Y position matches Rack.svelte: includes RACK_PADDING + RAIL_WIDTH offset
			const deviceY =
				(rack.height - placedDevice.position - device.height + 1) * U_HEIGHT +
				RACK_PADDING +
				RAIL_WIDTH;
			const deviceHeight = device.height * U_HEIGHT - 2;
			const deviceWidth = RACK_WIDTH - RAIL_WIDTH * 2 - 4;

			const deviceRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			deviceRect.setAttribute('x', String(RAIL_WIDTH + 2));
			deviceRect.setAttribute('y', String(deviceY + 1));
			deviceRect.setAttribute('width', String(deviceWidth));
			deviceRect.setAttribute('height', String(deviceHeight));
			deviceRect.setAttribute('fill', device.colour);
			deviceRect.setAttribute('rx', '2');
			deviceRect.setAttribute('ry', '2');
			rackGroup.appendChild(deviceRect);

			// Device name
			const deviceName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			deviceName.setAttribute('x', String(RACK_WIDTH / 2));
			deviceName.setAttribute('y', String(deviceY + deviceHeight / 2 + 1));
			deviceName.setAttribute('fill', '#ffffff');
			deviceName.setAttribute('font-size', '12');
			deviceName.setAttribute('text-anchor', 'middle');
			deviceName.setAttribute('dominant-baseline', 'middle');
			deviceName.setAttribute('font-family', 'system-ui, sans-serif');
			deviceName.textContent = device.name;
			rackGroup.appendChild(deviceName);
		}

		// View label (FRONT/REAR) for dual-view export
		if (viewLabel) {
			const viewLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			viewLabelText.setAttribute('x', String(RACK_WIDTH / 2));
			viewLabelText.setAttribute('y', '-8');
			viewLabelText.setAttribute('fill', textColor);
			viewLabelText.setAttribute('font-size', '11');
			viewLabelText.setAttribute('text-anchor', 'middle');
			viewLabelText.setAttribute('font-family', 'system-ui, sans-serif');
			viewLabelText.setAttribute('font-weight', '500');
			viewLabelText.textContent = viewLabel;
			rackGroup.appendChild(viewLabelText);
		}

		// Rack name (positioned above rack, or above view label if present)
		if (includeNames && !viewLabel) {
			const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			nameText.setAttribute('class', 'rack-name');
			nameText.setAttribute('x', String(RACK_WIDTH / 2));
			nameText.setAttribute('y', '2');
			nameText.setAttribute('fill', textColor);
			nameText.setAttribute('font-size', '13');
			nameText.setAttribute('text-anchor', 'middle');
			nameText.setAttribute('font-family', 'system-ui, sans-serif');
			nameText.textContent = rack.name;
			rackGroup.appendChild(nameText);
		}

		return rackGroup;
	}

	// Render each rack (single or dual view)
	racks.forEach((rack, index) => {
		const rackY = EXPORT_PADDING + (maxRackHeight - rack.height) * U_HEIGHT;

		if (isDualView) {
			// Dual view: render front and rear side-by-side
			const dualRackWidth = RACK_WIDTH * 2 + RACK_GAP;
			const baseX = EXPORT_PADDING + index * (dualRackWidth + RACK_GAP);

			// Render rack name centered above both views
			if (includeNames) {
				const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				nameText.setAttribute('class', 'rack-name');
				nameText.setAttribute('x', String(baseX + dualRackWidth / 2));
				nameText.setAttribute('y', String(rackY - 5));
				nameText.setAttribute('fill', textColor);
				nameText.setAttribute('font-size', '13');
				nameText.setAttribute('text-anchor', 'middle');
				nameText.setAttribute('font-family', 'system-ui, sans-serif');
				nameText.textContent = rack.name;
				svg.appendChild(nameText);
			}

			// Front view on the left
			const frontGroup = renderRackView(rack, baseX, rackY, 'front', 'FRONT');
			svg.appendChild(frontGroup);

			// Rear view on the right
			const rearX = baseX + RACK_WIDTH + RACK_GAP;
			const rearGroup = renderRackView(rack, rearX, rackY, 'rear', 'REAR');
			svg.appendChild(rearGroup);
		} else {
			// Single view: render with optional face filter
			const rackX = EXPORT_PADDING + index * (RACK_WIDTH + RACK_GAP);
			const faceFilter = exportView === 'front' || exportView === 'rear' ? exportView : undefined;
			const rackGroup = renderRackView(rack, rackX, rackY, faceFilter);

			// Add rack name for single view (not handled in renderRackView when viewLabel is not present)
			if (includeNames) {
				const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				nameText.setAttribute('class', 'rack-name');
				nameText.setAttribute('x', String(RACK_WIDTH / 2));
				nameText.setAttribute('y', '2');
				nameText.setAttribute('fill', textColor);
				nameText.setAttribute('font-size', '13');
				nameText.setAttribute('text-anchor', 'middle');
				nameText.setAttribute('font-family', 'system-ui, sans-serif');
				nameText.textContent = rack.name;
				rackGroup.appendChild(nameText);
			}

			svg.appendChild(rackGroup);
		}
	});

	// Legend
	if (includeLegend && usedDevices.length > 0) {
		const legendX = EXPORT_PADDING + totalRackWidth + LEGEND_PADDING;
		const legendY = EXPORT_PADDING;

		const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		legendGroup.setAttribute('class', 'export-legend');
		legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);

		// Legend title
		const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		legendTitle.setAttribute('x', '0');
		legendTitle.setAttribute('y', '16');
		legendTitle.setAttribute('fill', textColor);
		legendTitle.setAttribute('font-size', '14');
		legendTitle.setAttribute('font-weight', 'bold');
		legendTitle.setAttribute('font-family', 'system-ui, sans-serif');
		legendTitle.textContent = 'Legend';
		legendGroup.appendChild(legendTitle);

		// Legend items
		usedDevices.forEach((device, i) => {
			const itemY = LEGEND_PADDING + 8 + i * LEGEND_ITEM_HEIGHT;

			const itemGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			itemGroup.setAttribute('class', 'legend-item');

			// Colour swatch
			const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			swatch.setAttribute('x', '0');
			swatch.setAttribute('y', String(itemY));
			swatch.setAttribute('width', '16');
			swatch.setAttribute('height', '16');
			swatch.setAttribute('fill', device.colour);
			swatch.setAttribute('rx', '2');
			itemGroup.appendChild(swatch);

			// Device name
			const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			nameText.setAttribute('x', '24');
			nameText.setAttribute('y', String(itemY + 12));
			nameText.setAttribute('fill', textColor);
			nameText.setAttribute('font-size', '12');
			nameText.setAttribute('font-family', 'system-ui, sans-serif');
			nameText.textContent = `${device.name} (${device.height}U)`;
			itemGroup.appendChild(nameText);

			legendGroup.appendChild(itemGroup);
		});

		svg.appendChild(legendGroup);
	}

	return svg;
}

/**
 * Export SVG element as string with XML declaration
 */
export function exportAsSVG(svg: SVGElement): string {
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(svg);
	return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
}

/**
 * Export SVG as PNG blob
 */
export async function exportAsPNG(svg: SVGElement, scale: number = 2): Promise<Blob> {
	return exportAsRaster(svg, 'image/png', scale);
}

/**
 * Export SVG as JPEG blob
 */
export async function exportAsJPEG(
	svg: SVGElement,
	scale: number = 2,
	quality: number = 0.92
): Promise<Blob> {
	return exportAsRaster(svg, 'image/jpeg', scale, quality);
}

/**
 * Internal function to render SVG to canvas and export as raster image
 */
async function exportAsRaster(
	svg: SVGElement,
	mimeType: string,
	scale: number,
	quality?: number
): Promise<Blob> {
	const width = parseInt(svg.getAttribute('width') || '0', 10);
	const height = parseInt(svg.getAttribute('height') || '0', 10);

	// Create canvas
	const canvas = document.createElement('canvas');
	canvas.width = width * scale;
	canvas.height = height * scale;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	// Scale the canvas
	ctx.scale(scale, scale);

	// For JPEG, fill with white background first (no transparency)
	if (mimeType === 'image/jpeg') {
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, width, height);
	}

	// Convert SVG to data URL
	const svgString = new XMLSerializer().serializeToString(svg);
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	try {
		// Load image
		const img = await loadImage(url);

		// Draw to canvas
		ctx.drawImage(img, 0, 0);

		// Convert to blob
		return new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error('Failed to create blob'));
					}
				},
				mimeType,
				quality
			);
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * Load an image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = url;
	});
}

/**
 * Trigger download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Generate a sanitized filename for export
 */
export function generateExportFilename(layoutName: string, format: ExportFormat): string {
	if (!layoutName || layoutName.trim() === '') {
		return `rackarr-export.${format}`;
	}

	// Sanitize the layout name for filename
	const sanitized = layoutName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return `${sanitized || 'rackarr-export'}.${format}`;
}

/**
 * Generate metadata for bundled export
 */
export function generateExportMetadata(
	layout: LayoutLike,
	rack: RackLike,
	options: ExportOptions,
	includeSource: boolean
): ExportMetadata {
	return {
		version: layout.version,
		exportedAt: new Date().toISOString(),
		layoutName: layout.name,
		rackName: rack.name,
		rackHeight: rack.height,
		deviceCount: rack.devices.length,
		exportOptions: options,
		sourceIncluded: includeSource
	};
}

/**
 * Generate filename for bundled export (ZIP)
 */
export function generateBundledExportFilename(layoutName: string, _format: ExportFormat): string {
	if (!layoutName || layoutName.trim() === '') {
		return 'rackarr-export.zip';
	}

	// Sanitize the layout name for filename
	const sanitized = layoutName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return `${sanitized || 'rackarr'}-export.zip`;
}

/**
 * Create a bundled export ZIP containing image, metadata, and optionally source
 */
export async function createBundledExport(
	imageBlob: Blob,
	layout: LayoutLike,
	rack: RackLike,
	options: ExportOptions,
	includeSource: boolean,
	sourceBlob?: Blob
): Promise<Blob> {
	const zip = new JSZip();

	// Add image file
	const imageFilename = `rack.${options.format}`;
	zip.file(imageFilename, imageBlob);

	// Generate and add metadata
	const metadata = generateExportMetadata(layout, rack, options, includeSource);
	zip.file('metadata.json', JSON.stringify(metadata, null, 2));

	// Add source layout if requested
	if (includeSource && sourceBlob) {
		zip.file('source.rackarr.zip', sourceBlob);
	}

	// Generate ZIP blob
	return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}
