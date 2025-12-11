/**
 * Layout Zod Validation Schemas
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
export const SlugSchema = z
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
export const DeviceCategorySchema = z.enum([
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
	'cable-management',
	'other'
]);

/**
 * Rack form factor enum
 */
export const FormFactorSchema = z.enum([
	'2-post',
	'4-post',
	'4-post-cabinet',
	'wall-mount',
	'open-frame'
]);

/**
 * Airflow direction enum (NetBox-compatible)
 * - passive: No active cooling
 * - front-to-rear: Standard server airflow
 * - rear-to-front: Reverse airflow
 * - side-to-rear: Side intake (e.g., network switches)
 */
export const AirflowSchema = z.enum(['passive', 'front-to-rear', 'rear-to-front', 'side-to-rear']);

/**
 * Device face in rack
 */
export const DeviceFaceSchema = z.enum(['front', 'rear', 'both']);

/**
 * Weight unit enum
 */
export const WeightUnitSchema = z.enum(['kg', 'lb']);

/**
 * Display mode enum
 */
export const DisplayModeSchema = z.enum(['label', 'image']);

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
export const RackarrExtensionsSchema = z.object({
	colour: z.string().regex(HEX_COLOUR_PATTERN, 'Colour must be a valid 6-character hex code'),
	category: DeviceCategorySchema,
	tags: z.array(z.string()).optional()
});

/**
 * Device Type schema - library template definition
 */
export const DeviceTypeSchema = z.object({
	// Required fields
	slug: SlugSchema,
	u_height: z
		.number()
		.min(0.5, 'Height must be at least 0.5U')
		.max(50, 'Height cannot exceed 50U')
		.refine((val) => val % 0.5 === 0, 'Height must be a multiple of 0.5U'),

	// Optional NetBox fields
	manufacturer: z.string().max(100).optional(),
	model: z.string().max(100).optional(),
	is_full_depth: z.boolean().optional(),
	weight: z.number().positive().optional(),
	weight_unit: WeightUnitSchema.optional(),
	airflow: AirflowSchema.optional(),
	comments: z.string().max(1000).optional(),

	// Rackarr extensions
	rackarr: RackarrExtensionsSchema
});

/**
 * Placed device schema - instance in rack
 */
export const PlacedDeviceSchema = z.object({
	device_type: SlugSchema, // Reference to DeviceType.slug
	name: z.string().max(100, 'Name must be 100 characters or less').optional(),
	position: z.number().int().min(1, 'Position must be at least 1'),
	face: DeviceFaceSchema
});

/**
 * Rack schema
 */
export const RackSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	height: z.number().int().min(1, 'Height must be at least 1U').max(50, 'Height cannot exceed 50U'),
	width: z.union([z.literal(10), z.literal(19)]),
	desc_units: z.boolean(),
	form_factor: FormFactorSchema,
	starting_unit: z.number().int().min(1),
	position: z.number().int().min(0),
	devices: z.array(PlacedDeviceSchema)
});

/**
 * Layout settings schema
 */
export const LayoutSettingsSchema = z.object({
	display_mode: DisplayModeSchema,
	show_labels_on_images: z.boolean()
});

/**
 * Complete layout schema (base, without refinements)
 */
const LayoutSchemaBase = z.object({
	version: z.string(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	rack: RackSchema,
	device_types: z.array(DeviceTypeSchema),
	settings: LayoutSettingsSchema
});

/**
 * Complete layout schema with slug uniqueness validation
 */
export const LayoutSchema = LayoutSchemaBase.superRefine((data, ctx) => {
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

export type Slug = z.infer<typeof SlugSchema>;
export type DeviceCategory = z.infer<typeof DeviceCategorySchema>;
export type FormFactor = z.infer<typeof FormFactorSchema>;
export type Airflow = z.infer<typeof AirflowSchema>;
export type DeviceFace = z.infer<typeof DeviceFaceSchema>;
export type WeightUnit = z.infer<typeof WeightUnitSchema>;
export type DisplayMode = z.infer<typeof DisplayModeSchema>;
export type RackarrExtensions = z.infer<typeof RackarrExtensionsSchema>;
export type DeviceTypeZod = z.infer<typeof DeviceTypeSchema>;
export type PlacedDeviceZod = z.infer<typeof PlacedDeviceSchema>;
export type RackZod = z.infer<typeof RackSchema>;
export type LayoutSettingsZod = z.infer<typeof LayoutSettingsSchema>;
export type LayoutZod = z.infer<typeof LayoutSchema>;
