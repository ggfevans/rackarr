#!/usr/bin/env npx tsx
/**
 * Curated NetBox Device Import Script
 * Generates a ~420 device library with popular models from each vendor
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const NETBOX_RAW_BASE =
	'https://raw.githubusercontent.com/netbox-community/devicetype-library/master';
const NETBOX_API_BASE = 'https://api.github.com/repos/netbox-community/devicetype-library/contents';

const STARTER_LIBRARY_PATH = join(ROOT_DIR, 'src/lib/data/starterLibrary.ts');

const RATE_LIMIT_DELAY = 80;

type DeviceCategory =
	| 'server'
	| 'network'
	| 'patch-panel'
	| 'power'
	| 'storage'
	| 'kvm'
	| 'av-media'
	| 'cooling'
	| 'shelf'
	| 'blank'
	| 'cable-management'
	| 'other';

interface VendorConfig {
	name: string;
	maxDevices: number;
	defaultCategory: DeviceCategory;
	filter?: (device: NetBoxDevice) => boolean;
	priority?: (device: NetBoxDevice) => number; // Higher = more priority
}

// Target: 420 devices total
// Generic: 43 devices
// Branded: 377 devices
const VENDORS: VendorConfig[] = [
	// Networking - 120 devices
	{
		name: 'Ubiquiti',
		maxDevices: 50,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1 && !d.model.toLowerCase().includes('camera'),
		priority: (d) => {
			// Prioritize UniFi switches and dream machines
			if (d.model.includes('USW') || d.model.includes('Dream')) return 100;
			if (d.model.includes('EdgeSwitch') || d.model.includes('EdgeRouter')) return 80;
			return 50;
		}
	},
	{
		name: 'MikroTik',
		maxDevices: 30,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1,
		priority: (d) => {
			if (d.model.includes('CRS3')) return 100; // Cloud Router Switches
			if (d.model.includes('CCR')) return 90; // Cloud Core Routers
			if (d.model.includes('RB')) return 70;
			return 50;
		}
	},
	{
		name: 'TP-Link',
		maxDevices: 20,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1
	},
	{
		name: 'Netgate',
		maxDevices: 8,
		defaultCategory: 'network'
	},
	{
		name: 'Netgear',
		maxDevices: 18,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1
	},

	// Servers - 80 devices
	{
		name: 'Dell',
		maxDevices: 45,
		defaultCategory: 'server',
		filter: (d) => d.u_height >= 1 && d.model.includes('PowerEdge'),
		priority: (d) => {
			// Prioritize newer generations
			if (d.model.includes('R7') || d.model.includes('R6')) return 100;
			if (d.model.includes('R5') || d.model.includes('R4')) return 90;
			if (d.model.includes('R3')) return 80;
			return 50;
		}
	},
	{
		name: 'HPE',
		maxDevices: 45,
		defaultCategory: 'server',
		filter: (d) => d.u_height >= 1 && d.model.includes('ProLiant'),
		priority: (d) => {
			if (d.model.includes('Gen11')) return 100;
			if (d.model.includes('Gen10')) return 90;
			if (d.model.includes('Gen9')) return 80;
			if (d.model.includes('DL3')) return 70; // DL360, DL380
			return 50;
		}
	},
	{
		name: 'Supermicro',
		maxDevices: 15,
		defaultCategory: 'server',
		filter: (d) => d.u_height >= 1 && !d.model.includes('MBD') // Skip motherboards
	},

	// Storage/NAS - 50 devices
	{
		name: 'Synology',
		maxDevices: 25,
		defaultCategory: 'storage',
		filter: (d) => d.u_height >= 1,
		priority: (d) => {
			if (d.model.includes('RS')) return 100; // RackStation
			if (d.model.includes('FS')) return 90; // FlashStation
			return 50;
		}
	},
	{
		name: 'QNAP',
		maxDevices: 20,
		defaultCategory: 'storage',
		filter: (d) => d.u_height >= 1,
		priority: (d) => {
			if (d.model.includes('-RP') || d.model.includes('U-RP')) return 100; // Rackmount
			if (d.model.includes('XU') || d.model.includes('883')) return 90;
			return 50;
		}
	},

	// Power - 60 devices
	{
		name: 'APC',
		maxDevices: 40,
		defaultCategory: 'power',
		filter: (d) => d.u_height >= 1,
		priority: (d) => {
			if (d.model.includes('SMT') || d.model.includes('SMX')) return 100; // Smart-UPS
			if (d.model.includes('SRT')) return 90; // Smart-UPS RT
			if (d.model.toLowerCase().includes('pdu')) return 80;
			return 50;
		}
	},
	{
		name: 'CyberPower',
		maxDevices: 10,
		defaultCategory: 'power',
		filter: (d) => d.u_height >= 1
	},
	{
		name: 'Eaton',
		maxDevices: 20,
		defaultCategory: 'power',
		filter: (d) => d.u_height >= 1
	},

	// AV/Broadcast - 10 devices
	{
		name: 'Blackmagicdesign',
		maxDevices: 7,
		defaultCategory: 'av-media',
		filter: (d) => d.u_height >= 1
	},

	// Security/Firewalls - 25 devices
	{
		name: 'Fortinet',
		maxDevices: 20,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1 && d.model.includes('FortiGate'),
		priority: (d) => {
			if (d.model.includes('100') || d.model.includes('200')) return 100;
			if (d.model.includes('60') || d.model.includes('80')) return 90;
			return 50;
		}
	},
	{
		name: 'Palo Alto',
		maxDevices: 15,
		defaultCategory: 'network',
		filter: (d) => d.u_height >= 1 && d.model.includes('PA-')
	},

	// Additional Servers
	{
		name: 'Lenovo',
		maxDevices: 10,
		defaultCategory: 'server',
		filter: (d) => d.u_height >= 1 && d.model.includes('ThinkSystem')
	}
];

interface NetBoxDevice {
	manufacturer: string;
	model: string;
	slug: string;
	u_height: number;
	is_full_depth?: boolean;
	front_image?: boolean;
	rear_image?: boolean;
	airflow?: string;
	weight?: number;
	weight_unit?: string;
	subdevice_role?: string;
}

interface ImportedDevice {
	slug: string;
	manufacturer: string;
	model: string;
	u_height: number;
	is_full_depth: boolean;
	category: DeviceCategory;
	airflow?: string;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
	await sleep(RATE_LIMIT_DELAY);
	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
			'User-Agent': 'Rackarr-Curated-Import'
		}
	});

	if (!response.ok) {
		if (response.status === 403) {
			console.log('Rate limited, waiting 60s...');
			await sleep(60000);
			return fetchJson(url);
		}
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
	await sleep(RATE_LIMIT_DELAY);
	const response = await fetch(url, {
		headers: { 'User-Agent': 'Rackarr-Curated-Import' }
	});
	if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
	return response.text();
}

async function listVendorDevices(vendor: string): Promise<string[]> {
	const url = `${NETBOX_API_BASE}/device-types/${vendor}`;
	try {
		const files = await fetchJson<Array<{ name: string }>>(url);
		return files.filter((f) => f.name.endsWith('.yaml')).map((f) => f.name.replace('.yaml', ''));
	} catch {
		console.log(`  Could not list devices for ${vendor}`);
		return [];
	}
}

async function fetchDeviceYaml(vendor: string, deviceSlug: string): Promise<NetBoxDevice | null> {
	const url = `${NETBOX_RAW_BASE}/device-types/${vendor}/${deviceSlug}.yaml`;
	try {
		const yamlText = await fetchText(url);
		return yaml.load(yamlText) as NetBoxDevice;
	} catch {
		return null;
	}
}

function inferCategory(device: NetBoxDevice, defaultCategory: DeviceCategory): DeviceCategory {
	const model = device.model.toLowerCase();
	const slug = device.slug.toLowerCase();

	if (model.includes('pdu') || slug.includes('pdu')) return 'power';
	if (model.includes('ups') || slug.includes('ups')) return 'power';
	if (model.includes('switch') || slug.includes('switch')) return 'network';
	if (model.includes('router') || slug.includes('router')) return 'network';
	if (model.includes('firewall') || model.includes('fortigate')) return 'network';
	if (model.includes('nas') || model.includes('diskstation') || model.includes('rackstation'))
		return 'storage';
	if (model.includes('atem')) return 'av-media';

	return defaultCategory;
}

async function importVendorDevices(config: VendorConfig): Promise<ImportedDevice[]> {
	console.log(`\n${config.name} (max: ${config.maxDevices})`);

	const deviceSlugs = await listVendorDevices(config.name);
	console.log(`  Found ${deviceSlugs.length} device files`);

	// Fetch all devices first
	const allDevices: { device: NetBoxDevice; priority: number }[] = [];

	for (const slug of deviceSlugs) {
		const device = await fetchDeviceYaml(config.name, slug);
		if (!device) continue;

		// Apply filter
		if (config.filter && !config.filter(device)) continue;
		if (device.u_height < 1) continue;
		if (device.subdevice_role === 'child') continue;

		const priority = config.priority ? config.priority(device) : 50;
		allDevices.push({ device, priority });
	}

	// Sort by priority (descending) and take top N
	allDevices.sort((a, b) => b.priority - a.priority);
	const selected = allDevices.slice(0, config.maxDevices);

	console.log(`  Selected ${selected.length} devices`);

	return selected.map(({ device }) => ({
		slug: device.slug,
		manufacturer: device.manufacturer,
		model: device.model,
		u_height: device.u_height,
		is_full_depth: device.is_full_depth ?? true,
		category: inferCategory(device, config.defaultCategory),
		airflow: device.airflow
	}));
}

function getGenericDevices(): ImportedDevice[] {
	return [
		// Servers - generic (6)
		{ slug: '1u-server', manufacturer: '', model: 'Server', u_height: 1, is_full_depth: true, category: 'server' },
		{ slug: '2u-server', manufacturer: '', model: 'Server', u_height: 2, is_full_depth: true, category: 'server' },
		{ slug: '3u-server', manufacturer: '', model: 'Server', u_height: 3, is_full_depth: true, category: 'server' },
		{ slug: '4u-server', manufacturer: '', model: 'Server', u_height: 4, is_full_depth: true, category: 'server' },

		// Network - generic (4)
		{ slug: '24-port-switch', manufacturer: '', model: 'Switch (24-Port)', u_height: 1, is_full_depth: true, category: 'network' },
		{ slug: '48-port-switch', manufacturer: '', model: 'Switch (48-Port)', u_height: 1, is_full_depth: true, category: 'network' },
		{ slug: '1u-router-firewall', manufacturer: '', model: 'Router/Firewall', u_height: 1, is_full_depth: true, category: 'network' },
		{ slug: '2u-router-firewall', manufacturer: '', model: 'Router/Firewall', u_height: 2, is_full_depth: true, category: 'network' },

		// Patch panels (3)
		{ slug: '24-port-patch-panel', manufacturer: '', model: 'Patch Panel (24-Port)', u_height: 1, is_full_depth: false, category: 'patch-panel' },
		{ slug: '48-port-patch-panel', manufacturer: '', model: 'Patch Panel (48-Port)', u_height: 2, is_full_depth: false, category: 'patch-panel' },
		{ slug: '1u-fiber-patch-panel', manufacturer: '', model: 'Fiber Patch Panel', u_height: 1, is_full_depth: false, category: 'patch-panel' },

		// Storage - generic (4)
		{ slug: '1u-storage', manufacturer: '', model: 'Storage', u_height: 1, is_full_depth: true, category: 'storage' },
		{ slug: '2u-storage', manufacturer: '', model: 'Storage', u_height: 2, is_full_depth: true, category: 'storage' },
		{ slug: '3u-storage', manufacturer: '', model: 'Storage', u_height: 3, is_full_depth: true, category: 'storage' },
		{ slug: '4u-storage', manufacturer: '', model: 'Storage', u_height: 4, is_full_depth: true, category: 'storage' },

		// Power - generic (4)
		{ slug: '1u-pdu', manufacturer: '', model: 'PDU', u_height: 1, is_full_depth: false, category: 'power' },
		{ slug: '2u-pdu', manufacturer: '', model: 'PDU', u_height: 2, is_full_depth: false, category: 'power' },
		{ slug: '2u-ups', manufacturer: '', model: 'UPS', u_height: 2, is_full_depth: true, category: 'power' },
		{ slug: '4u-ups', manufacturer: '', model: 'UPS', u_height: 4, is_full_depth: true, category: 'power' },

		// KVM (2)
		{ slug: '1u-kvm', manufacturer: '', model: 'KVM Switch', u_height: 1, is_full_depth: true, category: 'kvm' },
		{ slug: '1u-console-drawer', manufacturer: '', model: 'Console Drawer', u_height: 1, is_full_depth: true, category: 'kvm' },

		// AV/Media - generic (8)
		{ slug: '1u-av-receiver', manufacturer: '', model: 'AV Receiver', u_height: 1, is_full_depth: true, category: 'av-media' },
		{ slug: '2u-av-receiver', manufacturer: '', model: 'AV Receiver', u_height: 2, is_full_depth: true, category: 'av-media' },
		{ slug: '1u-amplifier', manufacturer: '', model: 'Amplifier', u_height: 1, is_full_depth: true, category: 'av-media' },
		{ slug: '2u-amplifier', manufacturer: '', model: 'Amplifier', u_height: 2, is_full_depth: true, category: 'av-media' },
		{ slug: '3u-power-amplifier', manufacturer: '', model: 'Power Amplifier', u_height: 3, is_full_depth: true, category: 'av-media' },
		{ slug: '1u-video-switcher', manufacturer: '', model: 'Video Switcher', u_height: 1, is_full_depth: true, category: 'av-media' },
		{ slug: '1u-audio-processor', manufacturer: '', model: 'Audio Processor', u_height: 1, is_full_depth: true, category: 'av-media' },
		{ slug: '1u-streaming-encoder', manufacturer: '', model: 'Streaming Encoder', u_height: 1, is_full_depth: true, category: 'av-media' },

		// Cooling (2)
		{ slug: '1u-fan-panel', manufacturer: '', model: 'Fan Panel', u_height: 1, is_full_depth: false, category: 'cooling' },
		{ slug: '2u-fan-panel', manufacturer: '', model: 'Fan Panel', u_height: 2, is_full_depth: false, category: 'cooling' },

		// Blanks (5)
		{ slug: '0-5u-blank', manufacturer: '', model: 'Blank Panel', u_height: 0.5, is_full_depth: false, category: 'blank' },
		{ slug: '1u-blank', manufacturer: '', model: 'Blank Panel', u_height: 1, is_full_depth: false, category: 'blank' },
		{ slug: '2u-blank', manufacturer: '', model: 'Blank Panel', u_height: 2, is_full_depth: false, category: 'blank' },
		{ slug: '3u-blank', manufacturer: '', model: 'Blank Panel', u_height: 3, is_full_depth: false, category: 'blank' },
		{ slug: '4u-blank', manufacturer: '', model: 'Blank Panel', u_height: 4, is_full_depth: false, category: 'blank' },

		// Shelves (4)
		{ slug: '1u-shelf', manufacturer: '', model: 'Shelf', u_height: 1, is_full_depth: true, category: 'shelf' },
		{ slug: '2u-shelf', manufacturer: '', model: 'Shelf', u_height: 2, is_full_depth: true, category: 'shelf' },
		{ slug: '1u-vented-shelf', manufacturer: '', model: 'Vented Shelf', u_height: 1, is_full_depth: true, category: 'shelf' },
		{ slug: '1u-cantilever-shelf', manufacturer: '', model: 'Cantilever Shelf', u_height: 1, is_full_depth: false, category: 'shelf' },

		// Cable management (2)
		{ slug: '1u-brush-panel', manufacturer: '', model: 'Brush Panel', u_height: 1, is_full_depth: false, category: 'cable-management' },
		{ slug: '1u-cable-management', manufacturer: '', model: 'Cable Management', u_height: 1, is_full_depth: false, category: 'cable-management' }
	];
}

function generateLibraryFile(devices: ImportedDevice[]): string {
	const categoryOrder: DeviceCategory[] = [
		'server', 'network', 'storage', 'power', 'patch-panel',
		'kvm', 'av-media', 'cooling', 'shelf', 'blank', 'cable-management', 'other'
	];

	const byCategory = new Map<DeviceCategory, ImportedDevice[]>();
	for (const device of devices) {
		const list = byCategory.get(device.category) || [];
		list.push(device);
		byCategory.set(device.category, list);
	}

	// Sort within categories: generic first, then by manufacturer, then model
	for (const devs of byCategory.values()) {
		devs.sort((a, b) => {
			const aGeneric = !a.manufacturer;
			const bGeneric = !b.manufacturer;
			if (aGeneric !== bGeneric) return aGeneric ? -1 : 1;
			if (a.manufacturer !== b.manufacturer) return a.manufacturer.localeCompare(b.manufacturer);
			return a.model.localeCompare(b.model);
		});
	}

	const categoryLabels: Record<DeviceCategory, string> = {
		server: 'Servers',
		network: 'Networking',
		storage: 'Storage/NAS',
		power: 'Power',
		'patch-panel': 'Patch Panels',
		kvm: 'KVM/Console',
		'av-media': 'AV/Media',
		cooling: 'Cooling',
		shelf: 'Shelves',
		blank: 'Blank Panels',
		'cable-management': 'Cable Management',
		other: 'Other'
	};

	let entries = '';
	for (const category of categoryOrder) {
		const devs = byCategory.get(category);
		if (!devs || devs.length === 0) continue;

		entries += `\n\t// ${categoryLabels[category]} (${devs.length})\n`;
		for (const d of devs) {
			const parts: string[] = [];
			parts.push(`slug: '${d.slug}'`);
			if (d.manufacturer) parts.push(`manufacturer: '${escape(d.manufacturer)}'`);
			parts.push(`model: '${escape(d.model)}'`);
			parts.push(`u_height: ${d.u_height}`);
			parts.push(`category: '${d.category}'`);
			if (!d.is_full_depth) parts.push(`is_full_depth: false`);
			if (d.airflow) parts.push(`airflow: '${d.airflow}'`);
			entries += `\t{ ${parts.join(', ')} },\n`;
		}
	}

	return `/**
 * Starter Device Type Library
 * Curated selection from NetBox Community Device Type Library
 * https://github.com/netbox-community/devicetype-library
 *
 * Total devices: ${devices.length}
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

import type { DeviceType, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';

interface StarterDeviceSpec {
	slug: string;
	manufacturer?: string;
	model: string;
	u_height: number;
	category: DeviceCategory;
	is_full_depth?: boolean;
	airflow?: string;
	va_rating?: number;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [${entries}];

// Cached starter library (computed once)
let cachedStarterLibrary: DeviceType[] | null = null;

/**
 * Get the starter device type library
 * Returns a cached copy for performance
 */
export function getStarterLibrary(): DeviceType[] {
	if (!cachedStarterLibrary) {
		cachedStarterLibrary = STARTER_DEVICES.map((spec) => ({
			slug: spec.slug,
			u_height: spec.u_height,
			manufacturer: spec.manufacturer,
			model: spec.model,
			is_full_depth: spec.is_full_depth,
			airflow: spec.airflow as DeviceType['airflow'],
			va_rating: spec.va_rating,
			colour: CATEGORY_COLOURS[spec.category],
			category: spec.category
		}));
	}
	return cachedStarterLibrary;
}

/**
 * Find a device type in the starter library by slug
 */
export function findStarterDevice(slug: string): DeviceType | undefined {
	return getStarterLibrary().find((d) => d.slug === slug);
}

/**
 * Get set of all starter library slugs for efficient lookup
 */
export function getStarterSlugs(): Set<string> {
	return new Set(getStarterLibrary().map((d) => d.slug));
}
`;
}

function escape(str: string): string {
	return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main(): Promise<void> {
	console.log('Curated NetBox Device Import');
	console.log('Target: ~420 devices\n');

	const allDevices: ImportedDevice[] = [];

	// Import from each vendor
	for (const config of VENDORS) {
		try {
			const devices = await importVendorDevices(config);
			allDevices.push(...devices);
		} catch (err) {
			console.log(`  Error: ${err}`);
		}
	}

	// Add generic devices
	const genericDevices = getGenericDevices();
	allDevices.push(...genericDevices);

	console.log('\n========================================');
	console.log(`Total branded: ${allDevices.length - genericDevices.length}`);
	console.log(`Total generic: ${genericDevices.length}`);
	console.log(`Total devices: ${allDevices.length}`);

	// Generate and write file
	const content = generateLibraryFile(allDevices);
	await writeFile(STARTER_LIBRARY_PATH, content);
	console.log(`\nWritten to: ${STARTER_LIBRARY_PATH}`);
}

main().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
