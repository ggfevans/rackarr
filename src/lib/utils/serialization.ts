/**
 * Layout Serialization and Persistence
 * JSON serialization, deserialization, and validation
 */

import { z } from 'zod';
import type { Layout, Device, Rack } from '$lib/types';
import { CURRENT_VERSION } from '$lib/types/constants';
import { getDeviceURange, doRangesOverlap } from './collision';
import { getStarterLibrary } from '$lib/data/starterLibrary';
import { migrateLayout } from './migration';

/**
 * Zod validation result type
 */
export interface ZodValidationResult {
	success: boolean;
	errors: string[];
}

/**
 * Compatible Device schema using existing naming conventions
 * (id/height instead of spec's slug/u_height)
 */
const CompatDeviceSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1, { message: 'Device name is required' }),
	height: z.number().min(0.5).max(100).multipleOf(0.5),
	colour: z.string().regex(/^#[a-fA-F0-9]{6}$/),
	category: z.enum([
		'server',
		'network',
		'patch-panel',
		'power',
		'storage',
		'kvm',
		'av-media',
		'cooling',
		'shelf',
		'blank',
		'other'
	]),
	notes: z.string().optional(),
	manufacturer: z.string().max(100).optional(),
	model: z.string().max(100).optional(),
	part_number: z.string().max(50).optional(),
	airflow: z
		.enum([
			'front-to-rear',
			'rear-to-front',
			'left-to-right',
			'right-to-left',
			'side-to-rear',
			'rear-to-side',
			'bottom-to-top',
			'top-to-bottom',
			'passive',
			'mixed'
		])
		.optional(),
	weight: z.number().min(0).optional(),
	weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional(),
	is_full_depth: z.boolean().optional(),
	face: z.enum(['front', 'rear', 'both']).optional(),
	images: z
		.object({
			front: z.string().optional(),
			rear: z.string().optional()
		})
		.optional()
});

/**
 * Compatible PlacedDevice schema using libraryId instead of slug
 */
const CompatPlacedDeviceSchema = z.object({
	libraryId: z.string(),
	position: z.number().int().min(1),
	face: z.enum(['front', 'rear', 'both']).optional()
});

/**
 * Compatible Rack schema
 */
const CompatRackSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	height: z.number().int().min(1).max(100),
	width: z.number().int(),
	position: z.number().int().min(0),
	view: z.enum(['front', 'rear']),
	devices: z.array(CompatPlacedDeviceSchema),
	form_factor: z
		.enum([
			'4-post-cabinet',
			'4-post-frame',
			'2-post-frame',
			'wall-cabinet',
			'wall-frame',
			'wall-frame-vertical',
			'wall-cabinet-vertical'
		])
		.optional(),
	desc_units: z.boolean().optional(),
	starting_unit: z.number().int().min(1).optional()
});

/**
 * Compatible Layout schema for validation
 */
const CompatLayoutSchema = z.object({
	version: z.string(),
	name: z.string().min(1, { message: 'Layout name is required' }),
	created: z.string().datetime({ message: 'Created must be a valid ISO datetime' }),
	modified: z.string().datetime({ message: 'Modified must be a valid ISO datetime' }),
	settings: z.object({
		theme: z.enum(['dark', 'light']),
		view: z.enum(['front', 'rear']).optional(),
		displayMode: z.enum(['label', 'image']).optional(),
		showLabelsOnImages: z.boolean().optional()
	}),
	deviceLibrary: z.array(CompatDeviceSchema),
	racks: z.array(CompatRackSchema)
});

/**
 * Schema using spec naming (slug, u_height) for import validation
 */
const SpecDeviceSchema = z.object({
	slug: z.string().regex(/^[-a-z0-9_]+$/, { message: 'Slug must be lowercase with hyphens only' }),
	name: z.string().min(1),
	u_height: z.number().min(0.5).max(100).multipleOf(0.5),
	category: z.enum([
		'server',
		'network',
		'patch-panel',
		'power',
		'storage',
		'kvm',
		'av-media',
		'cooling',
		'shelf',
		'blank',
		'other'
	]),
	colour: z.string().regex(/^#[a-fA-F0-9]{6}$/),
	is_full_depth: z.boolean().optional(),
	manufacturer: z.string().max(100).optional(),
	model: z.string().max(100).optional(),
	part_number: z.string().max(50).optional(),
	airflow: z
		.enum([
			'front-to-rear',
			'rear-to-front',
			'left-to-right',
			'right-to-left',
			'side-to-rear',
			'rear-to-side',
			'bottom-to-top',
			'top-to-bottom',
			'passive',
			'mixed'
		])
		.optional(),
	weight: z.number().min(0).optional(),
	weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional(),
	face: z.enum(['front', 'rear', 'both']).optional(),
	images: z
		.object({
			front: z.string().optional(),
			rear: z.string().optional()
		})
		.optional(),
	notes: z.string().optional()
});

const SpecLayoutSchema = z.object({
	version: z.string(),
	name: z.string().min(1, { message: 'Layout name is required' }),
	created: z.string().datetime({ message: 'Created must be a valid ISO datetime' }),
	modified: z.string().datetime({ message: 'Modified must be a valid ISO datetime' }),
	settings: z.object({
		theme: z.enum(['dark', 'light']),
		view: z.enum(['front', 'rear']).optional(),
		displayMode: z.enum(['label', 'image']).optional(),
		showLabelsOnImages: z.boolean().optional()
	}),
	deviceLibrary: z.array(SpecDeviceSchema),
	racks: z.array(CompatRackSchema)
});

/**
 * Format Zod errors into user-friendly messages
 */
function formatZodErrors(error: z.ZodError): string[] {
	// Use issues property (errors is an alias)
	const issues = error?.issues ?? error?.errors ?? [];
	return issues.map((e) => {
		const path = e.path.join('.');
		return path ? `${path}: ${e.message}` : e.message;
	});
}

/**
 * Validate a layout using Zod schema
 * @param obj - Object to validate
 * @returns Validation result with success flag and error messages
 */
export function validateLayoutWithZod(obj: unknown): ZodValidationResult {
	// First try the compatible schema (existing naming)
	const compatResult = CompatLayoutSchema.safeParse(obj);
	if (compatResult.success) {
		return { success: true, errors: [] };
	}

	// Then try the spec schema (slug/u_height naming)
	const specResult = SpecLayoutSchema.safeParse(obj);
	if (specResult.success) {
		return { success: true, errors: [] };
	}

	// Return errors - prefer compat errors, fall back to spec errors
	const errors = compatResult.error
		? formatZodErrors(compatResult.error)
		: specResult.error
			? formatZodErrors(specResult.error)
			: ['Unknown validation error'];

	return {
		success: false,
		errors
	};
}

/**
 * Create a new empty layout
 * @param name - Layout name (default: "Untitled Layout")
 * @returns New Layout object with starter device library
 */
export function createLayout(name: string = 'Untitled Layout'): Layout {
	const now = new Date().toISOString();

	return {
		version: CURRENT_VERSION,
		name,
		created: now,
		modified: now,
		settings: {
			theme: 'dark',
			view: 'front',
			displayMode: 'label',
			showLabelsOnImages: false
		},
		deviceLibrary: getStarterLibrary(),
		racks: []
	};
}

/**
 * Serialize a layout to JSON string
 * Updates the modified timestamp
 * @param layout - Layout to serialize
 * @returns JSON string
 */
export function serializeLayout(layout: Layout): string {
	const serialized: Layout = {
		...layout,
		modified: new Date().toISOString()
	};

	return JSON.stringify(serialized, null, 2);
}

/**
 * Deserialize a layout from JSON string
 * Automatically migrates older layout versions
 * @param json - JSON string to parse
 * @returns Layout object (migrated to current version if needed)
 * @throws Error if JSON is invalid or layout structure is invalid
 */
export function deserializeLayout(json: string): Layout {
	let parsed: unknown;

	try {
		parsed = JSON.parse(json);
	} catch {
		throw new Error('Invalid JSON syntax');
	}

	if (!validateLayoutStructure(parsed)) {
		throw new Error('Invalid layout structure');
	}

	// Migrate if needed (supports v0.1.0 and v1.0)
	if (parsed.version === '0.1.0' || parsed.version === '1.0') {
		return migrateLayout(parsed);
	}

	// Check version compatibility for other versions
	if (parsed.version !== CURRENT_VERSION) {
		throw new Error(`Unsupported layout version: ${parsed.version}`);
	}

	return parsed;
}

/**
 * Type guard to validate layout structure
 * @param obj - Object to validate
 * @returns true if obj is a valid Layout
 */
export function validateLayoutStructure(obj: unknown): obj is Layout {
	// Must be an object
	if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
		return false;
	}

	const layout = obj as Record<string, unknown>;

	// Check required fields exist
	if (
		typeof layout['version'] !== 'string' ||
		typeof layout['name'] !== 'string' ||
		typeof layout['created'] !== 'string' ||
		typeof layout['modified'] !== 'string' ||
		typeof layout['settings'] !== 'object' ||
		layout['settings'] === null ||
		!Array.isArray(layout['deviceLibrary']) ||
		!Array.isArray(layout['racks'])
	) {
		return false;
	}

	const settings = layout['settings'] as Record<string, unknown>;
	if (settings['theme'] !== 'dark' && settings['theme'] !== 'light') {
		return false;
	}

	const deviceLibrary = layout['deviceLibrary'] as Device[];
	const racks = layout['racks'] as Rack[];

	// Validate device references
	const deviceIds = new Set(deviceLibrary.map((d) => d.id));
	for (const rack of racks) {
		for (const placedDevice of rack.devices) {
			if (!deviceIds.has(placedDevice.libraryId)) {
				return false;
			}
		}
	}

	// Validate no overlapping devices in each rack
	for (const rack of racks) {
		const placedDevices = rack.devices;
		for (let i = 0; i < placedDevices.length; i++) {
			const deviceA = placedDevices[i]!;
			const deviceInfoA = deviceLibrary.find((d) => d.id === deviceA.libraryId);
			if (!deviceInfoA) continue;

			const rangeA = getDeviceURange(deviceA.position, deviceInfoA.height);

			for (let j = i + 1; j < placedDevices.length; j++) {
				const deviceB = placedDevices[j]!;
				const deviceInfoB = deviceLibrary.find((d) => d.id === deviceB.libraryId);
				if (!deviceInfoB) continue;

				const rangeB = getDeviceURange(deviceB.position, deviceInfoB.height);

				if (doRangesOverlap(rangeA, rangeB)) {
					return false;
				}
			}
		}
	}

	return true;
}
