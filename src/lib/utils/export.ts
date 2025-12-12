/**
 * Export utilities for generating images from rack layouts
 */

import type {
	Rack,
	DeviceType,
	ExportOptions,
	ExportFormat,
	DeviceCategory,
	ExportBackground,
	Airflow
} from '$lib/types';
import type { ImageStoreMap } from '$lib/types/images';
import { jsPDF } from 'jspdf';

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

// Airflow colours
const AIRFLOW_INTAKE = '#60a5fa'; // blue-400
const AIRFLOW_EXHAUST = '#f87171'; // red-400
const AIRFLOW_PASSIVE = '#9ca3af'; // neutral-400

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
 * Create SVG elements for a category icon
 * Returns an array of SVG elements to append to a parent group
 */
function createCategoryIconElements(
	category: DeviceCategory,
	color: string,
	bgColor: string
): SVGElement[] {
	const elements: SVGElement[] = [];
	const ns = 'http://www.w3.org/2000/svg';

	switch (category) {
		case 'server': {
			// Server: Horizontal lines (like rack server front)
			for (const [y, h] of [
				[3, 3],
				[7, 3],
				[11, 2]
			] as const) {
				const rect = document.createElementNS(ns, 'rect');
				rect.setAttribute('x', '2');
				rect.setAttribute('y', String(y));
				rect.setAttribute('width', '12');
				rect.setAttribute('height', String(h));
				rect.setAttribute('rx', '0.5');
				rect.setAttribute('fill', color);
				elements.push(rect);
			}
			break;
		}
		case 'network': {
			// Network: Connected nodes
			for (const [cx, cy] of [
				[8, 4],
				[4, 12],
				[12, 12]
			] as const) {
				const circle = document.createElementNS(ns, 'circle');
				circle.setAttribute('cx', String(cx));
				circle.setAttribute('cy', String(cy));
				circle.setAttribute('r', '2');
				circle.setAttribute('fill', color);
				elements.push(circle);
			}
			for (const [x1, y1, x2, y2] of [
				[8, 6, 4, 10],
				[8, 6, 12, 10]
			] as const) {
				const line = document.createElementNS(ns, 'line');
				line.setAttribute('x1', String(x1));
				line.setAttribute('y1', String(y1));
				line.setAttribute('x2', String(x2));
				line.setAttribute('y2', String(y2));
				line.setAttribute('stroke', color);
				line.setAttribute('stroke-width', '1.5');
				elements.push(line);
			}
			break;
		}
		case 'patch-panel': {
			// Patch Panel: Grid of dots
			for (const [cx, cy] of [
				[4, 5],
				[8, 5],
				[12, 5],
				[4, 11],
				[8, 11],
				[12, 11]
			] as const) {
				const circle = document.createElementNS(ns, 'circle');
				circle.setAttribute('cx', String(cx));
				circle.setAttribute('cy', String(cy));
				circle.setAttribute('r', '1.5');
				circle.setAttribute('fill', color);
				elements.push(circle);
			}
			break;
		}
		case 'power': {
			// Power: Lightning bolt
			const polygon = document.createElementNS(ns, 'polygon');
			polygon.setAttribute('points', '9,1 5,8 8,8 7,15 11,6 8,6');
			polygon.setAttribute('fill', color);
			elements.push(polygon);
			break;
		}
		case 'storage': {
			// Storage: Stacked drives
			for (const y of [2, 6, 10]) {
				const rect = document.createElementNS(ns, 'rect');
				rect.setAttribute('x', '2');
				rect.setAttribute('y', String(y));
				rect.setAttribute('width', '12');
				rect.setAttribute('height', '3');
				rect.setAttribute('rx', '0.5');
				rect.setAttribute('fill', color);
				elements.push(rect);
			}
			for (const cy of [3.5, 7.5, 11.5]) {
				const circle = document.createElementNS(ns, 'circle');
				circle.setAttribute('cx', '12');
				circle.setAttribute('cy', String(cy));
				circle.setAttribute('r', '0.75');
				circle.setAttribute('fill', bgColor);
				elements.push(circle);
			}
			break;
		}
		case 'kvm': {
			// KVM: Monitor with keyboard
			const monitor = document.createElementNS(ns, 'rect');
			monitor.setAttribute('x', '3');
			monitor.setAttribute('y', '2');
			monitor.setAttribute('width', '10');
			monitor.setAttribute('height', '7');
			monitor.setAttribute('rx', '0.5');
			monitor.setAttribute('fill', color);
			elements.push(monitor);

			const screen = document.createElementNS(ns, 'rect');
			screen.setAttribute('x', '4');
			screen.setAttribute('y', '3');
			screen.setAttribute('width', '8');
			screen.setAttribute('height', '5');
			screen.setAttribute('fill', bgColor);
			elements.push(screen);

			const keyboard = document.createElementNS(ns, 'rect');
			keyboard.setAttribute('x', '2');
			keyboard.setAttribute('y', '11');
			keyboard.setAttribute('width', '12');
			keyboard.setAttribute('height', '3');
			keyboard.setAttribute('rx', '0.5');
			keyboard.setAttribute('fill', color);
			elements.push(keyboard);
			break;
		}
		case 'av-media': {
			// AV/Media: Speaker
			const base = document.createElementNS(ns, 'rect');
			base.setAttribute('x', '3');
			base.setAttribute('y', '4');
			base.setAttribute('width', '4');
			base.setAttribute('height', '8');
			base.setAttribute('rx', '0.5');
			base.setAttribute('fill', color);
			elements.push(base);

			const cone = document.createElementNS(ns, 'path');
			cone.setAttribute('d', 'M8 3 L12 1 L12 15 L8 13 Z');
			cone.setAttribute('fill', color);
			elements.push(cone);
			break;
		}
		case 'cooling': {
			// Cooling: Fan blades
			const outer = document.createElementNS(ns, 'circle');
			outer.setAttribute('cx', '8');
			outer.setAttribute('cy', '8');
			outer.setAttribute('r', '6');
			outer.setAttribute('fill', 'none');
			outer.setAttribute('stroke', color);
			outer.setAttribute('stroke-width', '1.5');
			elements.push(outer);

			const center = document.createElementNS(ns, 'circle');
			center.setAttribute('cx', '8');
			center.setAttribute('cy', '8');
			center.setAttribute('r', '1.5');
			center.setAttribute('fill', color);
			elements.push(center);

			for (const [x1, y1, x2, y2] of [
				[8, 3, 8, 6],
				[8, 10, 8, 13],
				[3, 8, 6, 8],
				[10, 8, 13, 8]
			] as const) {
				const line = document.createElementNS(ns, 'line');
				line.setAttribute('x1', String(x1));
				line.setAttribute('y1', String(y1));
				line.setAttribute('x2', String(x2));
				line.setAttribute('y2', String(y2));
				line.setAttribute('stroke', color);
				line.setAttribute('stroke-width', '1.5');
				elements.push(line);
			}
			break;
		}
		case 'shelf': {
			// Shelf: Horizontal platform with angled supports
			const platform = document.createElementNS(ns, 'rect');
			platform.setAttribute('x', '2');
			platform.setAttribute('y', '7');
			platform.setAttribute('width', '12');
			platform.setAttribute('height', '2');
			platform.setAttribute('rx', '0.3');
			platform.setAttribute('fill', color);
			elements.push(platform);

			for (const [x1, x2] of [
				[3, 4],
				[13, 12]
			] as const) {
				const leg = document.createElementNS(ns, 'line');
				leg.setAttribute('x1', String(x1));
				leg.setAttribute('y1', '9');
				leg.setAttribute('x2', String(x2));
				leg.setAttribute('y2', '13');
				leg.setAttribute('stroke', color);
				leg.setAttribute('stroke-width', '1.5');
				elements.push(leg);
			}
			break;
		}
		case 'blank': {
			// Blank: Empty rectangle
			const rect = document.createElementNS(ns, 'rect');
			rect.setAttribute('x', '2');
			rect.setAttribute('y', '4');
			rect.setAttribute('width', '12');
			rect.setAttribute('height', '8');
			rect.setAttribute('rx', '0.5');
			rect.setAttribute('fill', 'none');
			rect.setAttribute('stroke', color);
			rect.setAttribute('stroke-width', '1.5');
			elements.push(rect);
			break;
		}
		default: {
			// Other: Question mark in circle
			const circle = document.createElementNS(ns, 'circle');
			circle.setAttribute('cx', '8');
			circle.setAttribute('cy', '8');
			circle.setAttribute('r', '6');
			circle.setAttribute('fill', 'none');
			circle.setAttribute('stroke', color);
			circle.setAttribute('stroke-width', '1.5');
			elements.push(circle);

			const text = document.createElementNS(ns, 'text');
			text.setAttribute('x', '8');
			text.setAttribute('y', '11');
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('font-size', '8');
			text.setAttribute('font-weight', 'bold');
			text.setAttribute('fill', color);
			text.textContent = '?';
			elements.push(text);
			break;
		}
	}

	return elements;
}

/**
 * Create SVG elements for an airflow indicator
 * Edge stripe + small arrow design matching AirflowIndicator.svelte
 * @param airflow - Airflow direction
 * @param faceFilter - Current view (front or rear)
 * @param width - Width of the indicator area
 * @param height - Height of the indicator area
 * @returns SVG group element containing the airflow indicator
 */
function createAirflowIndicator(
	airflow: Airflow,
	faceFilter: 'front' | 'rear',
	width: number,
	height: number
): SVGGElement {
	const ns = 'http://www.w3.org/2000/svg';
	const group = document.createElementNS(ns, 'g');
	group.setAttribute('class', 'airflow-indicator');

	const STRIPE_WIDTH = 4;
	const ARROW_SIZE = 8;

	if (airflow === 'passive') {
		// Passive: hollow circle
		const circle = document.createElementNS(ns, 'circle');
		circle.setAttribute('cx', String(width / 2));
		circle.setAttribute('cy', String(height / 2));
		circle.setAttribute('r', String(Math.min(10, height / 4)));
		circle.setAttribute('stroke', AIRFLOW_PASSIVE);
		circle.setAttribute('stroke-width', '2');
		circle.setAttribute('fill', 'none');
		circle.setAttribute('opacity', '0.7');
		group.appendChild(circle);
		return group;
	}

	// Determine if this view shows intake or exhaust
	let isIntakeSide = false;
	if (airflow === 'front-to-rear') {
		isIntakeSide = faceFilter === 'front';
	} else if (airflow === 'rear-to-front') {
		isIntakeSide = faceFilter === 'rear';
	} else if (airflow === 'side-to-rear') {
		isIntakeSide = faceFilter === 'front';
	}

	// Stripe color based on intake/exhaust
	const stripeColor = isIntakeSide ? AIRFLOW_INTAKE : AIRFLOW_EXHAUST;

	// Stripe position: LEFT for front view, RIGHT for rear view
	const stripeX = faceFilter === 'front' ? 0 : width - STRIPE_WIDTH;

	// Edge stripe
	const stripe = document.createElementNS(ns, 'rect');
	stripe.setAttribute('x', String(stripeX));
	stripe.setAttribute('y', '0');
	stripe.setAttribute('width', String(STRIPE_WIDTH));
	stripe.setAttribute('height', String(height));
	stripe.setAttribute('fill', stripeColor);
	stripe.setAttribute('opacity', '0.85');
	group.appendChild(stripe);

	// Arrow positioning - next to stripe, centered vertically
	const arrowX = faceFilter === 'front' ? STRIPE_WIDTH + 8 : width - STRIPE_WIDTH - ARROW_SIZE - 8;
	const arrowY = height / 2;

	// Arrow points - chevron shape
	let arrowPoints: string;
	if (faceFilter === 'front') {
		if (isIntakeSide) {
			// Intake on front: arrow points right (into device)
			arrowPoints = `${arrowX},${arrowY - ARROW_SIZE / 2} ${arrowX + ARROW_SIZE},${arrowY} ${arrowX},${arrowY + ARROW_SIZE / 2}`;
		} else {
			// Exhaust on front: arrow points left (out of device)
			arrowPoints = `${arrowX + ARROW_SIZE},${arrowY - ARROW_SIZE / 2} ${arrowX},${arrowY} ${arrowX + ARROW_SIZE},${arrowY + ARROW_SIZE / 2}`;
		}
	} else {
		if (isIntakeSide) {
			// Intake on rear: arrow points left (into device)
			arrowPoints = `${arrowX + ARROW_SIZE},${arrowY - ARROW_SIZE / 2} ${arrowX},${arrowY} ${arrowX + ARROW_SIZE},${arrowY + ARROW_SIZE / 2}`;
		} else {
			// Exhaust on rear: arrow points right (out of device)
			arrowPoints = `${arrowX},${arrowY - ARROW_SIZE / 2} ${arrowX + ARROW_SIZE},${arrowY} ${arrowX},${arrowY + ARROW_SIZE / 2}`;
		}
	}

	// Directional arrow (static in exports - no animation)
	const arrow = document.createElementNS(ns, 'polyline');
	arrow.setAttribute('points', arrowPoints);
	arrow.setAttribute('stroke', stripeColor);
	arrow.setAttribute('stroke-width', '2');
	arrow.setAttribute('stroke-linecap', 'round');
	arrow.setAttribute('stroke-linejoin', 'round');
	arrow.setAttribute('fill', 'none');
	group.appendChild(arrow);

	return group;
}

/**
 * Generate an SVG element for export
 * @param racks - Racks to export
 * @param deviceLibrary - Device library for device definitions
 * @param options - Export options including displayMode
 * @param images - Optional map of device images (required when displayMode is 'image')
 */
export function generateExportSVG(
	racks: Rack[],
	deviceLibrary: DeviceType[],
	options: ExportOptions,
	images?: ImageStoreMap
): SVGElement {
	const {
		includeNames,
		includeLegend,
		background,
		exportView,
		displayMode = 'label',
		airflowMode = false
	} = options;

	// Determine if we're doing dual-view export
	const isDualView = exportView === 'both';

	// Get unique devices used in racks for legend
	const usedDeviceSlugs = new Set<string>();
	for (const rack of racks) {
		for (const device of rack.devices) {
			usedDeviceSlugs.add(device.device_type);
		}
	}
	const usedDevices = deviceLibrary.filter((d) => usedDeviceSlugs.has(d.slug));

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
			const device = deviceLibrary.find((d) => d.slug === placedDevice.device_type);
			if (!device) continue;

			// Device display name
			const deviceDisplayName = device.model ?? device.slug;

			// Device Y position matches Rack.svelte: includes RACK_PADDING + RAIL_WIDTH offset
			const deviceY =
				(rack.height - placedDevice.position - device.u_height + 1) * U_HEIGHT +
				RACK_PADDING +
				RAIL_WIDTH;
			const deviceHeight = device.u_height * U_HEIGHT - 2;
			const deviceWidth = RACK_WIDTH - RAIL_WIDTH * 2 - 4;

			// Always render device rect as background
			const deviceRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			deviceRect.setAttribute('x', String(RAIL_WIDTH + 2));
			deviceRect.setAttribute('y', String(deviceY + 1));
			deviceRect.setAttribute('width', String(deviceWidth));
			deviceRect.setAttribute('height', String(deviceHeight));
			deviceRect.setAttribute('fill', device.rackarr.colour);
			deviceRect.setAttribute('rx', '2');
			deviceRect.setAttribute('ry', '2');
			rackGroup.appendChild(deviceRect);

			// Check if we should show an image
			const face = faceFilter === 'rear' ? 'rear' : 'front';
			const deviceImages = images?.get(device.slug);
			const deviceImage = deviceImages?.[face];
			// Support both URL-based (bundled) and dataUrl-based (user upload) images
			const imageUrl = deviceImage?.url ?? deviceImage?.dataUrl;
			const isImageMode = displayMode === 'image' || displayMode === 'image-label';
			const showImage = isImageMode && imageUrl;

			if (showImage) {
				// Render device image
				const imageEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
				imageEl.setAttribute('x', String(RAIL_WIDTH + 2));
				imageEl.setAttribute('y', String(deviceY + 1));
				imageEl.setAttribute('width', String(deviceWidth));
				imageEl.setAttribute('height', String(deviceHeight));
				imageEl.setAttribute('href', imageUrl);
				imageEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
				rackGroup.appendChild(imageEl);

				// Clip the image to rounded corners
				const clipId = `clip-${device.slug}-${placedDevice.position}`;
				const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
				clipPath.setAttribute('id', clipId);
				const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				clipRect.setAttribute('x', String(RAIL_WIDTH + 2));
				clipRect.setAttribute('y', String(deviceY + 1));
				clipRect.setAttribute('width', String(deviceWidth));
				clipRect.setAttribute('height', String(deviceHeight));
				clipRect.setAttribute('rx', '2');
				clipRect.setAttribute('ry', '2');
				clipPath.appendChild(clipRect);
				rackGroup.appendChild(clipPath);
				imageEl.setAttribute('clip-path', `url(#${clipId})`);
			} else {
				// Category icon (only for devices tall enough and with a category)
				if (deviceHeight >= 20 && device.rackarr.category) {
					const iconSize = 12;
					const iconX = RAIL_WIDTH + 6;
					const iconY = deviceY + (deviceHeight - iconSize) / 2 + 1;

					const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
					iconSvg.setAttribute('x', String(iconX));
					iconSvg.setAttribute('y', String(iconY));
					iconSvg.setAttribute('width', String(iconSize));
					iconSvg.setAttribute('height', String(iconSize));
					iconSvg.setAttribute('viewBox', '0 0 16 16');

					// White icon with slight transparency for visibility on coloured backgrounds
					const iconColor = 'rgba(255, 255, 255, 0.85)';
					const iconBgColor = device.rackarr.colour;
					const iconElements = createCategoryIconElements(
						device.rackarr.category,
						iconColor,
						iconBgColor
					);
					for (const el of iconElements) {
						iconSvg.appendChild(el);
					}
					rackGroup.appendChild(iconSvg);
				}
			}

			// Device name (always shown unless image mode without labels)
			// In image mode, name is still shown as overlay for accessibility
			const deviceNameEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			deviceNameEl.setAttribute('x', String(RACK_WIDTH / 2));
			deviceNameEl.setAttribute('y', String(deviceY + deviceHeight / 2 + 1));
			deviceNameEl.setAttribute('fill', '#ffffff');
			deviceNameEl.setAttribute('font-size', '12');
			deviceNameEl.setAttribute('text-anchor', 'middle');
			deviceNameEl.setAttribute('dominant-baseline', 'middle');
			deviceNameEl.setAttribute('font-family', 'system-ui, sans-serif');
			if (showImage) {
				// Add text shadow for visibility over images
				deviceNameEl.setAttribute(
					'style',
					'text-shadow: 0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5);'
				);
			}
			deviceNameEl.textContent = placedDevice.name || deviceDisplayName;
			rackGroup.appendChild(deviceNameEl);

			// Airflow indicator (if airflowMode is enabled and device has airflow)
			if (airflowMode && device.airflow) {
				const indicatorGroup = createAirflowIndicator(
					device.airflow,
					faceFilter || 'front',
					deviceWidth,
					deviceHeight
				);
				indicatorGroup.setAttribute('transform', `translate(${RAIL_WIDTH + 2}, ${deviceY + 1})`);
				rackGroup.appendChild(indicatorGroup);
			}
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
			const deviceDisplayName = device.model ?? device.slug;

			const itemGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			itemGroup.setAttribute('class', 'legend-item');

			// Category icon (replaces colour swatch) or fallback to colour swatch
			if (device.rackarr.category) {
				const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				iconGroup.setAttribute('x', '0');
				iconGroup.setAttribute('y', String(itemY));
				iconGroup.setAttribute('width', '16');
				iconGroup.setAttribute('height', '16');
				iconGroup.setAttribute('viewBox', '0 0 16 16');

				const iconElements = createCategoryIconElements(
					device.rackarr.category,
					textColor,
					bgColor
				);
				for (const el of iconElements) {
					iconGroup.appendChild(el);
				}
				itemGroup.appendChild(iconGroup);
			} else {
				// Fallback to colour swatch if no category
				const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				swatch.setAttribute('x', '0');
				swatch.setAttribute('y', String(itemY));
				swatch.setAttribute('width', '16');
				swatch.setAttribute('height', '16');
				swatch.setAttribute('fill', device.rackarr.colour);
				swatch.setAttribute('rx', '2');
				itemGroup.appendChild(swatch);
			}

			// Device name
			const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			nameText.setAttribute('x', '24');
			nameText.setAttribute('y', String(itemY + 12));
			nameText.setAttribute('fill', textColor);
			nameText.setAttribute('font-size', '12');
			nameText.setAttribute('font-family', 'system-ui, sans-serif');
			nameText.textContent = `${deviceDisplayName} (${device.u_height}U)`;
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
 * Export SVG string as PDF blob (US Letter size, centered)
 */
export async function exportAsPDF(svgString: string, background: ExportBackground): Promise<Blob> {
	// Parse SVG to get dimensions
	const parser = new DOMParser();
	const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
	const svgElement = svgDoc.documentElement;

	const imgWidth = parseInt(svgElement.getAttribute('width') || '0', 10);
	const imgHeight = parseInt(svgElement.getAttribute('height') || '0', 10);

	if (imgWidth === 0 || imgHeight === 0) {
		throw new Error('Invalid SVG dimensions');
	}

	// Convert SVG to canvas first
	const canvas = await svgToCanvas(svgString, imgWidth, imgHeight, background);

	// US Letter dimensions in points (72 dpi)
	const letterWidth = 612; // 8.5 inches
	const letterHeight = 792; // 11 inches

	// Create PDF (landscape if image is wider than tall)
	const isLandscape = imgWidth > imgHeight;

	const pdf = new jsPDF({
		orientation: isLandscape ? 'landscape' : 'portrait',
		unit: 'pt',
		format: 'letter'
	});

	// Calculate scaling to fit on page with margins
	const margin = 36; // 0.5 inch margins
	const pageWidth = isLandscape ? letterHeight : letterWidth;
	const pageHeight = isLandscape ? letterWidth : letterHeight;
	const availableWidth = pageWidth - margin * 2;
	const availableHeight = pageHeight - margin * 2;

	const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

	const scaledWidth = imgWidth * scale;
	const scaledHeight = imgHeight * scale;

	// Center on page
	const x = (pageWidth - scaledWidth) / 2;
	const y = (pageHeight - scaledHeight) / 2;

	// Add image to PDF
	const imgData = canvas.toDataURL('image/png');
	pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

	// Return as blob
	return pdf.output('blob');
}

/**
 * Convert SVG string to canvas
 */
async function svgToCanvas(
	svgString: string,
	width: number,
	height: number,
	background: ExportBackground
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement('canvas');
	const scale = 2; // Higher resolution for PDF
	canvas.width = width * scale;
	canvas.height = height * scale;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	ctx.scale(scale, scale);

	// Fill background if not transparent
	if (background !== 'transparent') {
		ctx.fillStyle = background === 'dark' ? DARK_BG : LIGHT_BG;
		ctx.fillRect(0, 0, width, height);
	}

	// Convert SVG to data URL and load as image
	const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	try {
		const img = await loadImage(url);
		ctx.drawImage(img, 0, 0, width, height);
		return canvas;
	} finally {
		URL.revokeObjectURL(url);
	}
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
 * Pattern: {layout-name}-{view}-{YYYY-MM-DD}.{ext}
 * For CSV (view=null): {layout-name}-{YYYY-MM-DD}.{ext}
 *
 * @param layoutName - The layout name to include in filename
 * @param view - The export view ('front', 'rear', 'both') or null for data exports like CSV
 * @param format - The export format extension
 */
export function generateExportFilename(
	layoutName: string,
	view: 'front' | 'rear' | 'both' | null,
	format: ExportFormat
): string {
	// Slugify the layout name: lowercase, hyphens, no special chars
	const slugified = layoutName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	const baseName = slugified || 'rackarr-export';

	// Format date as YYYY-MM-DD
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const dateStr = `${year}-${month}-${day}`;

	// Build filename: include view for image exports, omit for CSV
	if (view) {
		return `${baseName}-${view}-${dateStr}.${format}`;
	}

	return `${baseName}-${dateStr}.${format}`;
}
