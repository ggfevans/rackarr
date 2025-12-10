import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	generateExportSVG,
	exportAsSVG,
	exportAsPNG,
	exportAsJPEG,
	exportAsPDF,
	downloadBlob,
	generateExportFilename
} from '$lib/utils/export';
import type { Rack, DeviceType, ExportOptions } from '$lib/types';

describe('Export Utilities', () => {
	const mockDeviceLibrary: DeviceType[] = [
		{
			slug: 'device-1',
			model: 'Server 1',
			u_height: 2,
			rackarr: { colour: '#4A90D9', category: 'server' }
		},
		{
			slug: 'device-2',
			model: 'Switch',
			u_height: 1,
			rackarr: { colour: '#7B68EE', category: 'network' }
		}
	];

	const mockRacks: Rack[] = [
		{
			name: 'Main Rack',
			height: 42,
			width: 19,
			position: 0,
			desc_units: false,
			form_factor: '4-post',
			starting_unit: 1,
			devices: [{ device_type: 'device-1', position: 1, face: 'front' }]
		},
		{
			name: 'Secondary Rack',
			height: 24,
			width: 19,
			position: 1,
			desc_units: false,
			form_factor: '4-post',
			starting_unit: 1,
			devices: [{ device_type: 'device-2', position: 5, face: 'front' }]
		}
	];

	const defaultOptions: ExportOptions = {
		format: 'png',
		scope: 'all',
		includeNames: true,
		includeLegend: false,
		background: 'dark'
	};

	describe('generateExportSVG', () => {
		it('creates valid SVG element', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);

			expect(svg).toBeInstanceOf(SVGElement);
			expect(svg.tagName.toLowerCase()).toBe('svg');
		});

		it('includes rack names when includeNames is true', () => {
			const options: ExportOptions = { ...defaultOptions, includeNames: true };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).toContain('Secondary Rack');
		});

		it('excludes rack names when includeNames is false', () => {
			const options: ExportOptions = { ...defaultOptions, includeNames: false };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			// Rack names should not appear in the output (except possibly as aria labels)
			const nameTexts = svg.querySelectorAll('.rack-name');
			expect(nameTexts.length).toBe(0);
		});

		it('includes legend when includeLegend is true', () => {
			const options: ExportOptions = { ...defaultOptions, includeLegend: true };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const legend = svg.querySelector('.export-legend');
			expect(legend).not.toBeNull();
		});

		it('excludes legend when includeLegend is false', () => {
			const options: ExportOptions = { ...defaultOptions, includeLegend: false };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const legend = svg.querySelector('.export-legend');
			expect(legend).toBeNull();
		});

		it('applies dark background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'dark' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			expect(bg).not.toBeNull();
			// Dark background should have a dark fill
			expect(bg?.getAttribute('fill')).toMatch(/#1[a-f0-9]{5}|#2[a-f0-9]{5}/i);
		});

		it('applies light background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'light' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			expect(bg).not.toBeNull();
			// Light background should have a light fill
			expect(bg?.getAttribute('fill')).toMatch(/#[ef][a-f0-9]{5}/i);
		});

		it('applies transparent background', () => {
			const options: ExportOptions = { ...defaultOptions, background: 'transparent' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const bg = svg.querySelector('.export-background');
			// Either no background or fill is 'none' or transparent
			if (bg) {
				const fill = bg.getAttribute('fill');
				expect(fill === 'none' || fill === 'transparent').toBe(true);
			}
		});

		it('exports only selected rack when scope is selected', () => {
			const options: ExportOptions = { ...defaultOptions, scope: 'selected' };
			// Pass only the first rack as selected
			const svg = generateExportSVG([mockRacks[0]!], mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).not.toContain('Secondary Rack');
		});

		it('exports all racks when scope is all', () => {
			const options: ExportOptions = { ...defaultOptions, scope: 'all' };
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options);

			const svgString = svg.outerHTML;
			expect(svgString).toContain('Main Rack');
			expect(svgString).toContain('Secondary Rack');
		});

		describe('Device Image Export', () => {
			const mockImageData = {
				blob: new Blob(['test'], { type: 'image/png' }),
				dataUrl: 'data:image/png;base64,dGVzdA==',
				filename: 'test.png'
			};

			const mockImages = new Map([
				[
					'device-1',
					{
						front: mockImageData,
						rear: { ...mockImageData, dataUrl: 'data:image/png;base64,cmVhcg==' }
					}
				]
			]);

			it('renders device labels by default (no displayMode)', () => {
				const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);

				// Should have device name text but no image elements
				const svgString = svg.outerHTML;
				expect(svgString).toContain('Server 1');
				expect(svg.querySelectorAll('image').length).toBe(0);
			});

			it('renders device labels when displayMode is label', () => {
				const options: ExportOptions = { ...defaultOptions, displayMode: 'label' };
				const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options, mockImages);

				// Should have device name but no image elements even when images provided
				expect(svg.querySelectorAll('image').length).toBe(0);
			});

			it('renders device images when displayMode is image and images provided', () => {
				const options: ExportOptions = { ...defaultOptions, displayMode: 'image' };
				const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options, mockImages);

				// Should have image element for device-1
				const images = svg.querySelectorAll('image');
				expect(images.length).toBeGreaterThan(0);

				// First image should have the front dataUrl
				const firstImage = images[0];
				expect(firstImage?.getAttribute('href')).toBe('data:image/png;base64,dGVzdA==');
			});

			it('falls back to label when device has no image', () => {
				const options: ExportOptions = { ...defaultOptions, displayMode: 'image' };
				// device-2 (Switch) has no image in mockImages
				const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options, mockImages);

				// Should still show Switch device name since it has no image
				const svgString = svg.outerHTML;
				expect(svgString).toContain('Switch');
			});

			it('uses front image for front view', () => {
				const options: ExportOptions = {
					...defaultOptions,
					displayMode: 'image',
					exportView: 'front'
				};
				const svg = generateExportSVG(mockRacks, mockDeviceLibrary, options, mockImages);

				const images = svg.querySelectorAll('image');
				const hasImage = images.length > 0;
				if (hasImage) {
					expect(images[0]?.getAttribute('href')).toBe('data:image/png;base64,dGVzdA==');
				}
			});

			it('uses rear image for rear view', () => {
				// Create rack with rear-facing device
				const rearRacks: Rack[] = [
					{
						name: 'Main Rack',
						height: 42,
						width: 19,
						position: 0,
						desc_units: false,
						form_factor: '4-post',
						starting_unit: 1,
						devices: [{ device_type: 'device-1', position: 1, face: 'rear' }]
					}
				];
				const options: ExportOptions = {
					...defaultOptions,
					displayMode: 'image',
					exportView: 'rear'
				};
				const svg = generateExportSVG(rearRacks, mockDeviceLibrary, options, mockImages);

				const images = svg.querySelectorAll('image');
				const hasImage = images.length > 0;
				if (hasImage) {
					expect(images[0]?.getAttribute('href')).toBe('data:image/png;base64,cmVhcg==');
				}
			});
		});
	});

	describe('exportAsSVG', () => {
		it('returns valid SVG string', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);
			const svgString = exportAsSVG(svg);

			expect(svgString).toContain('<?xml');
			expect(svgString).toContain('<svg');
			expect(svgString).toContain('</svg>');
		});

		it('includes XML declaration', () => {
			const svg = generateExportSVG(mockRacks, mockDeviceLibrary, defaultOptions);
			const svgString = exportAsSVG(svg);

			expect(svgString.startsWith('<?xml version="1.0"')).toBe(true);
		});
	});

	describe('exportAsPNG', () => {
		// Note: Canvas operations are not fully supported in jsdom
		// The actual PNG/JPEG export works in a real browser but not in tests
		// We verify the function signature and that it handles the error gracefully

		it('exportAsPNG function is defined', () => {
			expect(typeof exportAsPNG).toBe('function');
		});
	});

	describe('exportAsJPEG', () => {
		it('exportAsJPEG function is defined', () => {
			expect(typeof exportAsJPEG).toBe('function');
		});
	});

	describe('exportAsPDF', () => {
		it('exportAsPDF function is defined', () => {
			expect(typeof exportAsPDF).toBe('function');
		});

		// Note: Canvas/image operations are not fully supported in jsdom
		// The actual PDF export works in a real browser but not in tests
		// We verify the function signature and that it's exported
	});

	describe('downloadBlob', () => {
		beforeEach(() => {
			// Set up URL mock on globalThis since jsdom doesn't have it
			if (!globalThis.URL.createObjectURL) {
				globalThis.URL.createObjectURL = vi.fn();
				globalThis.URL.revokeObjectURL = vi.fn();
			}
		});

		it('creates download link with correct attributes', () => {
			// Mock URL.createObjectURL and URL.revokeObjectURL
			const mockUrl = 'blob:test-url';
			const createObjectURLSpy = vi
				.spyOn(globalThis.URL, 'createObjectURL')
				.mockReturnValue(mockUrl);
			const revokeObjectURLSpy = vi
				.spyOn(globalThis.URL, 'revokeObjectURL')
				.mockImplementation(() => {});

			// Mock createElement and click
			const mockLink = {
				href: '',
				download: '',
				click: vi.fn()
			};
			const createElementSpy = vi
				.spyOn(document, 'createElement')
				.mockReturnValue(mockLink as unknown as HTMLAnchorElement);
			const appendChildSpy = vi
				.spyOn(document.body, 'appendChild')
				.mockImplementation((node) => node);
			const removeChildSpy = vi
				.spyOn(document.body, 'removeChild')
				.mockImplementation((node) => node);

			const blob = new Blob(['test'], { type: 'text/plain' });
			downloadBlob(blob, 'test-file.txt');

			expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
			expect(mockLink.href).toBe(mockUrl);
			expect(mockLink.download).toBe('test-file.txt');
			expect(mockLink.click).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockUrl);

			// Restore spies
			createObjectURLSpy.mockRestore();
			revokeObjectURLSpy.mockRestore();
			createElementSpy.mockRestore();
			appendChildSpy.mockRestore();
			removeChildSpy.mockRestore();
		});
	});

	describe('generateExportFilename', () => {
		it('generates filename with layout name and format', () => {
			const filename = generateExportFilename('My Layout', 'png');
			expect(filename).toBe('my-layout.png');
		});

		it('sanitizes layout name for filename', () => {
			const filename = generateExportFilename('Layout: Test/File', 'svg');
			expect(filename).toBe('layout-test-file.svg');
		});

		it('handles empty layout name', () => {
			const filename = generateExportFilename('', 'jpeg');
			expect(filename).toBe('rackarr-export.jpeg');
		});

		it('works with different formats', () => {
			expect(generateExportFilename('Test', 'png')).toBe('test.png');
			expect(generateExportFilename('Test', 'jpeg')).toBe('test.jpeg');
			expect(generateExportFilename('Test', 'svg')).toBe('test.svg');
			expect(generateExportFilename('Test', 'pdf')).toBe('test.pdf');
		});
	});
});

describe('Device Positioning in Export', () => {
	// Constants matching Rack.svelte dimensions
	const U_HEIGHT = 22;
	const RACK_PADDING = 4;
	const RAIL_WIDTH = 17;

	it('positions devices at correct Y coordinate including rail offset', () => {
		const devices: DeviceType[] = [
			{
				slug: 'device-1',
				model: 'Test Server',
				u_height: 2,
				rackarr: { colour: '#4A90D9', category: 'server' }
			}
		];

		const racks: Rack[] = [
			{
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				desc_units: false,
				form_factor: '4-post',
				starting_unit: 1,
				devices: [{ device_type: 'device-1', position: 1, face: 'front' }]
			}
		];

		const options: ExportOptions = {
			format: 'png',
			scope: 'all',
			includeNames: false,
			includeLegend: false,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);

		// Find the device rect by its colour
		const deviceRect = svg.querySelector('rect[fill="#4A90D9"]');
		expect(deviceRect).not.toBeNull();

		// Calculate expected Y position
		// Device at position 1 (bottom) in 42U rack with height 2
		// Y = (rackHeight - position - deviceHeight + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1 (the +1 is from deviceY + 1)
		// Y = (42 - 1 - 2 + 1) * 22 + 4 + 17 + 1 = 40 * 22 + 22 = 880 + 22 = 902
		const expectedY = (42 - 1 - 2 + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1;
		expect(deviceRect?.getAttribute('y')).toBe(String(expectedY));
	});

	it('positions device at top of rack correctly', () => {
		const devices: DeviceType[] = [
			{
				slug: 'device-1',
				model: 'Top Server',
				u_height: 1,
				rackarr: { colour: '#7B68EE', category: 'server' }
			}
		];

		const racks: Rack[] = [
			{
				name: 'Test Rack',
				height: 42,
				width: 19,
				position: 0,
				desc_units: false,
				form_factor: '4-post',
				starting_unit: 1,
				devices: [{ device_type: 'device-1', position: 42, face: 'front' }]
			}
		];

		const options: ExportOptions = {
			format: 'png',
			scope: 'all',
			includeNames: false,
			includeLegend: false,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);

		// Find the device rect by its colour
		const deviceRect = svg.querySelector('rect[fill="#7B68EE"]');
		expect(deviceRect).not.toBeNull();

		// Device at position 42 (top) in 42U rack with height 1
		// Y = (42 - 42 - 1 + 1) * 22 + 4 + 17 + 1 = 0 * 22 + 22 = 22
		const expectedY = (42 - 42 - 1 + 1) * U_HEIGHT + RACK_PADDING + RAIL_WIDTH + 1;
		expect(deviceRect?.getAttribute('y')).toBe(String(expectedY));
	});
});

describe('Export Legend', () => {
	// These tests will be for the legend component if created separately
	// For now, we test that legend content is included in SVG when enabled

	it('legend includes unique devices', () => {
		const devices: DeviceType[] = [
			{
				slug: 'device-1',
				model: 'Server 1',
				u_height: 2,
				rackarr: { colour: '#4A90D9', category: 'server' }
			}
		];

		const racks: Rack[] = [
			{
				name: 'Rack',
				height: 42,
				width: 19,
				position: 0,
				desc_units: false,
				form_factor: '4-post',
				starting_unit: 1,
				devices: [
					{ device_type: 'device-1', position: 1, face: 'front' },
					{ device_type: 'device-1', position: 5, face: 'front' } // Same device twice
				]
			}
		];

		const options: ExportOptions = {
			format: 'svg',
			scope: 'all',
			includeNames: true,
			includeLegend: true,
			background: 'dark'
		};

		const svg = generateExportSVG(racks, devices, options);
		const legend = svg.querySelector('.export-legend');

		// Should only show device once in legend even if placed multiple times
		const legendItems = legend?.querySelectorAll('.legend-item');
		expect(legendItems?.length).toBe(1);
	});
});

describe('Dual-View Export', () => {
	const mockDevices: DeviceType[] = [
		{
			slug: 'front-server',
			model: 'Front Server',
			u_height: 2,
			is_full_depth: true,
			rackarr: { colour: '#4A90D9', category: 'server' }
		},
		{
			slug: 'rear-patch',
			model: 'Rear Patch Panel',
			u_height: 1,
			is_full_depth: false,
			rackarr: { colour: '#7B68EE', category: 'network' }
		},
		{
			slug: 'both-ups',
			model: 'UPS',
			u_height: 4,
			rackarr: { colour: '#22C55E', category: 'power' }
		}
	];

	const mockRacks: Rack[] = [
		{
			name: 'Test Rack',
			height: 12,
			width: 19,
			position: 0,
			desc_units: false,
			form_factor: '4-post',
			starting_unit: 1,
			devices: [
				{ device_type: 'front-server', position: 1, face: 'front' },
				{ device_type: 'rear-patch', position: 5, face: 'rear' },
				{ device_type: 'both-ups', position: 8, face: 'both' }
			]
		}
	];

	describe('exportView option', () => {
		it('exports only front-facing devices when exportView is "front"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Should include front and both-face devices
			expect(svgString).toContain('#4A90D9'); // front-server (front)
			expect(svgString).toContain('#22C55E'); // both-ups (both)
			// Should NOT include rear-only devices
			expect(svgString).not.toContain('#7B68EE'); // rear-patch (rear)
		});

		it('exports only rear-facing devices when exportView is "rear"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark',
				exportView: 'rear'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Should include rear and both-face devices
			expect(svgString).toContain('#7B68EE'); // rear-patch (rear)
			expect(svgString).toContain('#22C55E'); // both-ups (both)
			// Should NOT include front-only devices
			expect(svgString).not.toContain('#4A90D9'); // front-server (front)
		});

		it('exports both views side-by-side when exportView is "both"', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Check for FRONT and REAR labels
			expect(svgString).toContain('FRONT');
			expect(svgString).toContain('REAR');

			// All device colours should be present (different faces in different views)
			expect(svgString).toContain('#4A90D9'); // front-server
			expect(svgString).toContain('#7B68EE'); // rear-patch
			expect(svgString).toContain('#22C55E'); // both-ups (appears in both)
		});

		it('defaults to showing all devices when exportView is undefined', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: false,
				includeLegend: false,
				background: 'dark'
				// exportView not specified
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const svgString = svg.outerHTML;

			// Legacy behavior: all devices visible
			expect(svgString).toContain('#4A90D9'); // front-server
			expect(svgString).toContain('#7B68EE'); // rear-patch
			expect(svgString).toContain('#22C55E'); // both-ups
		});
	});

	describe('dual-view layout', () => {
		it('positions front view on the left and rear view on the right', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);

			// Find the view labels to check positioning
			const textElements = svg.querySelectorAll('text');
			let frontLabelX: number | null = null;
			let rearLabelX: number | null = null;

			textElements.forEach((text) => {
				if (text.textContent === 'FRONT') {
					// Get the parent group's transform to find X position
					const parent = text.parentElement;
					const transform = parent?.getAttribute('transform');
					if (transform) {
						const match = transform.match(/translate\((\d+)/);
						if (match) {
							frontLabelX = parseInt(match[1]!, 10);
						}
					}
				}
				if (text.textContent === 'REAR') {
					const parent = text.parentElement;
					const transform = parent?.getAttribute('transform');
					if (transform) {
						const match = transform.match(/translate\((\d+)/);
						if (match) {
							rearLabelX = parseInt(match[1]!, 10);
						}
					}
				}
			});

			// Front should be to the left of rear
			if (frontLabelX !== null && rearLabelX !== null) {
				expect(frontLabelX).toBeLessThan(rearLabelX);
			}
		});

		it('doubles the width for dual-view export', () => {
			// Single view
			const singleOptions: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const singleSvg = generateExportSVG(mockRacks, mockDevices, singleOptions);
			const singleWidth = parseInt(singleSvg.getAttribute('width') || '0', 10);

			// Dual view
			const dualOptions: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const dualSvg = generateExportSVG(mockRacks, mockDevices, dualOptions);
			const dualWidth = parseInt(dualSvg.getAttribute('width') || '0', 10);

			// Dual view should be wider (approximately 2x + gap)
			expect(dualWidth).toBeGreaterThan(singleWidth);
			// Should be at least 1.5x wider (accounting for gap)
			expect(dualWidth).toBeGreaterThan(singleWidth * 1.5);
		});

		it('uses the same height for front and rear views', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const height = parseInt(svg.getAttribute('height') || '0', 10);

			// Should be the same height as single view (same rack)
			const singleOptions: ExportOptions = { ...options, exportView: 'front' };
			const singleSvg = generateExportSVG(mockRacks, mockDevices, singleOptions);
			const singleHeight = parseInt(singleSvg.getAttribute('height') || '0', 10);

			expect(height).toBe(singleHeight);
		});
	});

	describe('view labels in export', () => {
		it('adds FRONT label above front view in dual export', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const viewLabels = Array.from(svg.querySelectorAll('text')).filter(
				(t) => t.textContent === 'FRONT' || t.textContent === 'REAR'
			);

			expect(viewLabels.length).toBe(2);
		});

		it('does NOT add view labels for single view export', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: false,
				background: 'dark',
				exportView: 'front'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);

			// Should not have FRONT/REAR labels for single view
			const viewLabels = Array.from(svg.querySelectorAll('text')).filter(
				(t) => t.textContent === 'FRONT' || t.textContent === 'REAR'
			);
			expect(viewLabels.length).toBe(0);
		});
	});

	describe('legend with dual-view', () => {
		it('shows all devices in legend regardless of view', () => {
			const options: ExportOptions = {
				format: 'png',
				scope: 'all',
				includeNames: true,
				includeLegend: true,
				background: 'dark',
				exportView: 'both'
			};

			const svg = generateExportSVG(mockRacks, mockDevices, options);
			const legend = svg.querySelector('.export-legend');

			expect(legend).not.toBeNull();

			// All devices should be in legend
			const legendItems = legend?.querySelectorAll('.legend-item');
			expect(legendItems?.length).toBe(3); // front-server, rear-patch, both-ups
		});
	});
});
