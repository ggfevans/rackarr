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
		it('includes Server (1U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Server' && d.u_height === 1);
			expect(device).toBeDefined();
			expect(device?.category).toBe('server');
		});

		it('includes Server (2U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Server' && d.u_height === 2);
			expect(device).toBeDefined();
			expect(device?.category).toBe('server');
		});

		it('includes Server (4U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Server' && d.u_height === 4);
			expect(device).toBeDefined();
			expect(device?.category).toBe('server');
		});
	});

	describe('network category (3 items)', () => {
		it('includes Switch (24-Port)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Switch (24-Port)');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});

		it('includes Switch (48-Port)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Switch (48-Port)');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});

		it('includes Router/Firewall', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Router/Firewall');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('network');
		});
	});

	describe('patch-panel category (2 items)', () => {
		it('includes Patch Panel (24-Port)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Patch Panel (24-Port)');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('patch-panel');
		});

		it('includes Patch Panel (48-Port)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Patch Panel (48-Port)');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(2);
			expect(device?.category).toBe('patch-panel');
		});
	});

	describe('storage category (3 items)', () => {
		it('includes Storage (1U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Storage' && d.u_height === 1);
			expect(device).toBeDefined();
			expect(device?.category).toBe('storage');
		});

		it('includes Storage (2U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Storage' && d.u_height === 2);
			expect(device).toBeDefined();
			expect(device?.category).toBe('storage');
		});

		it('includes Storage (4U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Storage' && d.u_height === 4);
			expect(device).toBeDefined();
			expect(device?.category).toBe('storage');
		});
	});

	describe('power category (3 items)', () => {
		it('includes PDU', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'PDU');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('power');
		});

		it('includes UPS (2U) with va_rating', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'UPS' && d.u_height === 2);
			expect(device).toBeDefined();
			expect(device?.category).toBe('power');
			expect(device?.va_rating).toBe(1500);
		});

		it('includes UPS (4U) with va_rating', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'UPS' && d.u_height === 4);
			expect(device).toBeDefined();
			expect(device?.category).toBe('power');
			expect(device?.va_rating).toBe(3000);
		});
	});

	describe('kvm category (2 items)', () => {
		it('includes KVM', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'KVM');
			expect(device).toBeDefined();
			expect(device?.category).toBe('kvm');
		});

		it('includes Console Drawer', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Console Drawer');
			expect(device).toBeDefined();
			expect(device?.category).toBe('kvm');
		});
	});

	describe('av-media category (2 items)', () => {
		it('includes Receiver', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Receiver');
			expect(device).toBeDefined();
			expect(device?.category).toBe('av-media');
		});

		it('includes Amplifier', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Amplifier');
			expect(device).toBeDefined();
			expect(device?.category).toBe('av-media');
		});
	});

	describe('cooling category (1 item)', () => {
		it('includes Fan Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Fan Panel');
			expect(device).toBeDefined();
			expect(device?.category).toBe('cooling');
		});

		it('does NOT include Blanking Fan (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Blanking Fan');
			expect(device).toBeUndefined();
		});
	});

	describe('blank category (3 items)', () => {
		it('includes Blank (0.5U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Blank' && d.u_height === 0.5);
			expect(device).toBeDefined();
			expect(device?.category).toBe('blank');
		});

		it('includes Blank (1U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Blank' && d.u_height === 1);
			expect(device).toBeDefined();
			expect(device?.category).toBe('blank');
		});

		it('includes Blank (2U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Blank' && d.u_height === 2);
			expect(device).toBeDefined();
			expect(device?.category).toBe('blank');
		});
	});

	describe('shelf category (2 items)', () => {
		it('includes Shelf (1U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Shelf' && d.u_height === 1);
			expect(device).toBeDefined();
			expect(device?.category).toBe('shelf');
		});

		it('includes Shelf (2U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Shelf' && d.u_height === 2);
			expect(device).toBeDefined();
			expect(device?.category).toBe('shelf');
		});

		it('does NOT include Shelf (4U) (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Shelf' && d.u_height === 4);
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
		it('includes Brush Panel', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Brush Panel');
			expect(device).toBeDefined();
			expect(device?.u_height).toBe(1);
			expect(device?.category).toBe('cable-management');
		});

		it('includes Cable Management', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Cable Management');
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
		it('does NOT include Generic (removed)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Generic');
			expect(device).toBeUndefined();
		});

		it('does NOT include Router (merged into Router/Firewall)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Router');
			expect(device).toBeUndefined();
		});

		it('does NOT include Firewall (merged into Router/Firewall)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Firewall');
			expect(device).toBeUndefined();
		});

		it('does NOT include Switch without port count (renamed to specific port counts)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Switch');
			expect(device).toBeUndefined();
		});
	});

	describe('slug generation', () => {
		it('generates correct slug for Router/Firewall', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Router/Firewall');
			expect(device?.slug).toBe('1u-router-firewall');
		});

		it('generates correct slug for Switch (24-Port)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Switch (24-Port)');
			expect(device?.slug).toBe('24-port-switch');
		});

		it('generates correct slug for Blank (0.5U)', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Blank' && d.u_height === 0.5);
			expect(device?.slug).toBe('0-5u-blank');
		});

		it('generates correct slug for Cable Management', () => {
			const library = getStarterLibrary();
			const device = library.find((d) => d.model === 'Cable Management');
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
		it('new layout has empty device_types (starter library is runtime constant)', () => {
			const layout = createLayout();

			// device_types starts empty - starter library is a runtime constant
			expect(layout.device_types.length).toBe(0);
		});

		it('starter library is available as a constant', () => {
			const starterLibrary = getStarterLibrary();

			// Library should have a substantial number of devices (generic + branded)
			expect(starterLibrary.length).toBeGreaterThanOrEqual(400);
			expect(starterLibrary[0]?.slug).toBeTruthy();
		});

		it('starter device types have valid structure', () => {
			const starterLibrary = getStarterLibrary();
			const starterDeviceType = starterLibrary[0];

			expect(starterDeviceType).toBeDefined();
			expect(starterDeviceType!.slug).toBeTruthy();
			expect(starterDeviceType!.u_height).toBeGreaterThan(0);
			expect(starterDeviceType!.category).toBeTruthy();
		});
	});
});
