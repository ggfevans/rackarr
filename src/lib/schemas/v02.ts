/**
 * v0.2 Zod Validation Schemas
 * NetBox-compatible validation with snake_case naming
 */

import { z } from 'zod';

/**
 * Slug pattern: lowercase alphanumeric with hyphens, no leading/trailing/consecutive hyphens
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Hex colour pattern: 6-character hex with # prefix
 */
const HEX_COLOUR_PATTERN = /^#[0-9a-fA-F]{6}$/;

// ============================================================================
// Basic Schemas
// ============================================================================

/**
 * Slug schema for device identification
 */
export const SlugSchemaV02 = z
	.string()
	.min(1, 'Slug is required')
	.max(100, 'Slug must be 100 characters or less')
	.regex(
		SLUG_PATTERN,
		'Slug must be lowercase with hyphens only (no leading/trailing/consecutive)'
	);

/**
 * Device category enum
 */
export const DeviceCategorySchemaV02 = z.enum([
	'server',
	'storage',
	'networking',
	'power',
	'cooling',
	'kvm',
	'audio-video',
	'security',
	'cable-management',
	'accessories',
	'other',
	'shelf'
]);

/**
 * Rack form factor enum
 */
export const FormFactorSchemaV02 = z.enum([
	'2-post',
	'4-post',
	'4-post-cabinet',
	'wall-mount',
	'open-frame'
]);

/**
 * Airflow direction enum (NetBox-compatible)
 */
export const AirflowSchemaV02 = z.enum([
	'front-to-rear',
	'rear-to-front',
	'left-to-right',
	'right-to-left',
	'side-to-rear',
	'passive'
]);

/**
 * Device face in rack
 */
export const DeviceFaceSchemaV02 = z.enum(['front', 'rear', 'both']);

/**
 * Weight unit enum
 */
export const WeightUnitSchemaV02 = z.enum(['kg', 'lb']);

/**
 * Display mode enum
 */
export const DisplayModeSchemaV02 = z.enum(['label', 'image']);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates that all slugs in an array are unique
 * @param device_types - Array of objects with slug property
 * @returns Array of duplicate slugs (empty if all unique)
 */
export function validateSlugUniqueness(device_types: { slug: string }[]): string[] {
	const slugCounts = new Map<string, number>();

	for (const dt of device_types) {
		slugCounts.set(dt.slug, (slugCounts.get(dt.slug) ?? 0) + 1);
	}

	const duplicates: string[] = [];
	for (const [slug, count] of slugCounts) {
		if (count > 1) {
			duplicates.push(slug);
		}
	}

	return duplicates;
}

// ============================================================================
// Composite Schemas
// ============================================================================

/**
 * Rackarr-specific extensions for DeviceType
 */
export const RackarrExtensionsSchemaV02 = z.object({
	colour: z.string().regex(HEX_COLOUR_PATTERN, 'Colour must be a valid 6-character hex code'),
	category: DeviceCategorySchemaV02,
	tags: z.array(z.string()).optional()
});

/**
 * Device Type schema - library template definition
 */
export const DeviceTypeSchemaV02 = z.object({
	// Required fields
	slug: SlugSchemaV02,
	u_height: z
		.number()
		.int()
		.min(1, 'Height must be at least 1U')
		.max(50, 'Height cannot exceed 50U'),

	// Optional NetBox fields
	manufacturer: z.string().max(100).optional(),
	model: z.string().max(100).optional(),
	is_full_depth: z.boolean().optional(),
	weight: z.number().positive().optional(),
	weight_unit: WeightUnitSchemaV02.optional(),
	airflow: AirflowSchemaV02.optional(),
	comments: z.string().max(1000).optional(),

	// Rackarr extensions
	rackarr: RackarrExtensionsSchemaV02
});

/**
 * Device schema - placed instance in rack
 */
export const DeviceSchemaV02 = z.object({
	device_type: SlugSchemaV02, // Reference to DeviceType.slug
	name: z.string().max(100, 'Name must be 100 characters or less').optional(),
	position: z.number().int().min(1, 'Position must be at least 1'),
	face: DeviceFaceSchemaV02
});

/**
 * Rack schema
 */
export const RackSchemaV02 = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	height: z.number().int().min(1, 'Height must be at least 1U').max(50, 'Height cannot exceed 50U'),
	width: z.union([z.literal(10), z.literal(19)]),
	desc_units: z.boolean(),
	form_factor: FormFactorSchemaV02,
	starting_unit: z.number().int().min(1),
	position: z.number().int().min(0),
	devices: z.array(DeviceSchemaV02)
});

/**
 * Layout settings schema
 */
export const LayoutSettingsSchemaV02 = z.object({
	display_mode: DisplayModeSchemaV02,
	show_labels_on_images: z.boolean()
});

/**
 * Complete layout schema (base, without refinements)
 */
const LayoutSchemaV02Base = z.object({
	version: z.string(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	rack: RackSchemaV02,
	device_types: z.array(DeviceTypeSchemaV02),
	settings: LayoutSettingsSchemaV02
});

/**
 * Complete layout schema with slug uniqueness validation
 */
export const LayoutSchemaV02 = LayoutSchemaV02Base.superRefine((data, ctx) => {
	const duplicates = validateSlugUniqueness(data.device_types);
	if (duplicates.length > 0) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: `Duplicate device type slugs: ${duplicates.join(', ')}`,
			path: ['device_types']
		});
	}
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type SlugV02 = z.infer<typeof SlugSchemaV02>;
export type DeviceCategoryV02 = z.infer<typeof DeviceCategorySchemaV02>;
export type FormFactorV02 = z.infer<typeof FormFactorSchemaV02>;
export type AirflowV02 = z.infer<typeof AirflowSchemaV02>;
export type DeviceFaceV02 = z.infer<typeof DeviceFaceSchemaV02>;
export type WeightUnitV02 = z.infer<typeof WeightUnitSchemaV02>;
export type DisplayModeV02 = z.infer<typeof DisplayModeSchemaV02>;
export type RackarrExtensionsV02 = z.infer<typeof RackarrExtensionsSchemaV02>;
export type DeviceTypeZodV02 = z.infer<typeof DeviceTypeSchemaV02>;
export type DeviceZodV02 = z.infer<typeof DeviceSchemaV02>;
export type RackZodV02 = z.infer<typeof RackSchemaV02>;
export type LayoutSettingsZodV02 = z.infer<typeof LayoutSettingsSchemaV02>;
export type LayoutZodV02 = z.infer<typeof LayoutSchemaV02>;
