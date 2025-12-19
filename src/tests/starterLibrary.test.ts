import { describe, it, expect } from 'vitest';
import { getStarterLibrary } from '$lib/data/starterLibrary';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { createLayout } from '$lib/utils/serialization';

describe('Starter Device Type Library', () => {
	describe('getStarterLibrary', () => {
		it('returns 26 device types', () => {
			const deviceTypes = getStarterLibrary();
			expect(deviceTypes).toHaveLength(26);
		});

		it('most categories have at least one starter device type', () => {
			const deviceTypes = getStarterLibrary();
			const categoriesWithDevices = new Set(deviceTypes.map((d) => d.category));

			// At minimum, these core categories must have devices
			expect(categoriesWithDevices.has('server')).toBe(true);
			expect(categoriesWithDevices.has('network')).toBe(true);
			expect(categoriesWithDevices.has('blank')).toBe(true);
			expect(categoriesWithDevices.has('cable-management')).toBe(true);
		});

		it('all device types have valid properties', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.slug).toBeTruthy();
				expect(deviceType.u_height).toBeGreaterThanOrEqual(0.5);
				expect(deviceType.u_height).toBeLessThanOrEqual(42);
				expect(deviceType.colour).toBeTruthy();
				expect(deviceType.category).toBeTruthy();
			});
		});

		it('device type slugs are unique', () => {
			const deviceTypes = getStarterLibrary();
			const slugs = deviceTypes.map((d) => d.slug);
			const uniqueSlugs = new Set(slugs);

			expect(uniqueSlugs.size).toBe(slugs.length);
		});

		it('device types have correct category colours', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.colour).toBe(CATEGORY_COLOURS[deviceType.category]);
			});
		});

		it('device type slugs are kebab-case', () => {
			const deviceTypes = getStarterLibrary();

			deviceTypes.forEach((deviceType) => {
				expect(deviceType.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
			});
		});
	});

	describe('server category (3 items)', () => {
		it('includes 1U Server', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Server');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('server');
		});

		it('includes 2U Server', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Server');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(2);
			expect(device?.category).toBe('server');
		});

		it('includes 4U Server', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '4U Server');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(4);
			expect(device?.category).toBe('server');
		});
	});

	describe('network category (3 items)', () => {
		it('includes 24-Port Switch', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '24-Port Switch');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});

		it('includes 48-Port Switch', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '48-Port Switch');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});

		it('includes 1U Router/Firewall', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Router/Firewall');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});
	});

	describe('patch-panel category (2 items)', () => {
		it('includes 24-Port Patch Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '24-Port Patch Panel');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('patch-panel');
		});

		it('includes 48-Port Patch Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '48-Port Patch Panel');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(2);
			expect(device?.category).toBe('patch-panel');
		});
	});

	describe('storage category (3 items)', () => {
		it('includes 1U Storage', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Storage');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('storage');
		});

		it('includes 2U Storage', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Storage');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(2);
			expect(device?.category).toBe('storage');
		});

		it('includes 4U Storage', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '4U Storage');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(4);
			expect(device?.category).toBe('storage');
		});
	});

	describe('power category (3 items)', () => {
		it('includes 1U PDU', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U PDU');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('power');
		});

		it('includes 2U UPS with va_rating', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U UPS');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(2);
			expect(device?.category).toBe('power');
			expect(device?.va_rating).toBe(1500);
		});

		it('includes 4U UPS with va_rating', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '4U UPS');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(4);
			expect(device?.category).toBe('power');
			expect(device?.va_rating).toBe(3000);
		});
	});

	describe('kvm category (2 items)', () => {
		it('includes 1U KVM', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U KVM');
			expect(device).toBeDefined();
			expect(device?.category).toBe('kvm');
		});

		it('includes 1U Console Drawer', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Console Drawer');
			expect(device).toBeDefined();
			expect(device?.category).toBe('kvm');
		});
	});

	describe('av-media category (2 items)', () => {
		it('includes 1U Receiver', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Receiver');
			expect(device).toBeDefined();
			expect(device?.category).toBe('av-media');
		});

		it('includes 2U Amplifier', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Amplifier');
			expect(device).toBeDefined();
			expect(device?.category).toBe('av-media');
		});
	});

	describe('cooling category (1 item)', () => {
		it('includes 1U Fan Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Fan Panel');
			expect(device).toBeDefined();
			expect(device?.category).toBe('cooling');
		});

		it('does NOT include 0.5U Blanking Fan (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '0.5U Blanking Fan');
			expect(device).toBeUndefined();
		});
	});

	describe('blank category (3 items)', () => {
		it('includes 0.5U Blank', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '0.5U Blank');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(0.5);
			expect(device?.category).toBe('blank');
		});

		it('includes 1U Blank', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Blank');
			expect(device).toBeDefined();
			expect(device?.category).toBe('blank');
		});

		it('includes 2U Blank', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Blank');
			expect(device).toBeDefined();
			expect(device?.category).toBe('blank');
		});
	});

	describe('shelf category (2 items)', () => {
		it('includes 1U Shelf', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Shelf');
			expect(device).toBeDefined();
			expect(device?.category).toBe('shelf');
		});

		it('includes 2U Shelf', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Shelf');
			expect(device).toBeDefined();
			expect(device?.category).toBe('shelf');
		});

		it('does NOT include 4U Shelf (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '4U Shelf');
			expect(device).toBeUndefined();
		});

		it('shelf device types have Dracula comment colour', () => {
			const library = getStarterLibrary();
			const shelves = library.filter((d) => d.category === 'shelf');

			shelves.forEach((shelf) => {
				expect(shelf.colour).toBe('#6272A4');
			});
		});
	});

	describe('cable-management category (2 items)', () => {
		it('includes 1U Brush Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Brush Panel');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('cable-management');
		});

		it('includes 1U Cable Management', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Cable Management');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('cable-management');
		});

		it('cable-management devices have Dracula comment colour', () => {
			const library = getStarterLibrary();
			const cableDevices = library.filter((d) => d.category === 'cable-management');

			expect(cableDevices).toHaveLength(2);
			cableDevices.forEach((device) => {
				expect(device.colour).toBe('#6272A4');
			});
		});
	});

	describe('removed items', () => {
		it('does NOT include 1U Generic (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Generic');
			expect(device).toBeUndefined();
		});

		it('does NOT include 2U Generic (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Generic');
			expect(device).toBeUndefined();
		});

		it('does NOT include 1U Router (merged into Router/Firewall)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Router');
			expect(device).toBeUndefined();
		});

		it('does NOT include 1U Firewall (merged into Router/Firewall)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Firewall');
			expect(device).toBeUndefined();
		});

		it('does NOT include 1U Switch (renamed to specific port counts)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Switch');
			expect(device).toBeUndefined();
		});

		it('does NOT include 1U Patch Panel (renamed to 24-Port Patch Panel)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Patch Panel');
			expect(device).toBeUndefined();
		});

		it('does NOT include 2U Patch Panel (renamed to 48-Port Patch Panel)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '2U Patch Panel');
			expect(device).toBeUndefined();
		});
	});

	describe('slug generation', () => {
		it('generates correct slug for 1U Router/Firewall', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Router/Firewall');
			expect(device?.slug).toBe('1u-router-firewall');
		});

		it('generates correct slug for 24-Port Switch', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '24-Port Switch');
			expect(device?.slug).toBe('24-port-switch');
		});

		it('generates correct slug for 0.5U Blank', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '0.5U Blank');
			expect(device?.slug).toBe('0-5u-blank');
		});

		it('generates correct slug for 1U Cable Management', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === '1U Cable Management');
			expect(device?.slug).toBe('1u-cable-management');
		});
	});

	describe('all devices have required properties', () => {
		it('every device has a slug', () => {
			const library = getStarterLibrary();
			library.forEach((device) => {
				expect(device.slug).toBeDefined();
				expect(device.slug.length).toBeGreaterThan(0);
			});
		});

		it('every device has u_height > 0', () => {
			const library = getStarterLibrary();
			library.forEach((device) => {
				expect(device.u_height).toBeGreaterThan(0);
			});
		});

		it('every device has a category color', () => {
			const library = getStarterLibrary();
			library.forEach((device) => {
				expect(device.colour).toBeDefined();
				expect(device.colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
			});
		});
	});

	describe('Layout integration', () => {
		it('new layout includes starter library', () => {
			const layout = createLayout();

			expect(layout.device_types.length).toBe(26);
			expect(layout.device_types[0]?.slug).toBeTruthy();
		});

		it('starter device types have valid structure', () => {
			const layout = createLayout();
			const starterDeviceType = layout.device_types[0];

			expect(starterDeviceType).toBeDefined();
			expect(starterDeviceType!.slug).toBeTruthy();
			expect(starterDeviceType!.u_height).toBeGreaterThan(0);
			expect(starterDeviceType!.category).toBeTruthy();
		});
	});
});
