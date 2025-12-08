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
 */
export const AirflowSchema = z.enum([
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

// ============================================================================
// Backwards Compatibility Aliases (deprecated - use new names)
// ============================================================================

/** @deprecated Use SlugSchema instead */
export const SlugSchemaV02 = SlugSchema;
/** @deprecated Use DeviceCategorySchema instead */
export const DeviceCategorySchemaV02 = DeviceCategorySchema;
/** @deprecated Use FormFactorSchema instead */
export const FormFactorSchemaV02 = FormFactorSchema;
/** @deprecated Use AirflowSchema instead */
export const AirflowSchemaV02 = AirflowSchema;
/** @deprecated Use DeviceFaceSchema instead */
export const DeviceFaceSchemaV02 = DeviceFaceSchema;
/** @deprecated Use WeightUnitSchema instead */
export const WeightUnitSchemaV02 = WeightUnitSchema;
/** @deprecated Use DisplayModeSchema instead */
export const DisplayModeSchemaV02 = DisplayModeSchema;
/** @deprecated Use RackarrExtensionsSchema instead */
export const RackarrExtensionsSchemaV02 = RackarrExtensionsSchema;
/** @deprecated Use DeviceTypeSchema instead */
export const DeviceTypeSchemaV02 = DeviceTypeSchema;
/** @deprecated Use PlacedDeviceSchema instead */
export const DeviceSchemaV02 = PlacedDeviceSchema;
/** @deprecated Use RackSchema instead */
export const RackSchemaV02 = RackSchema;
/** @deprecated Use LayoutSettingsSchema instead */
export const LayoutSettingsSchemaV02 = LayoutSettingsSchema;
/** @deprecated Use LayoutSchema instead */
export const LayoutSchemaV02 = LayoutSchema;

// Type aliases for backwards compatibility
/** @deprecated Use Slug instead */
export type SlugV02 = Slug;
/** @deprecated Use DeviceCategory instead */
export type DeviceCategoryV02 = DeviceCategory;
/** @deprecated Use FormFactor instead */
export type FormFactorV02 = FormFactor;
/** @deprecated Use Airflow instead */
export type AirflowV02 = Airflow;
/** @deprecated Use DeviceFace instead */
export type DeviceFaceV02 = DeviceFace;
/** @deprecated Use WeightUnit instead */
export type WeightUnitV02 = WeightUnit;
/** @deprecated Use DisplayMode instead */
export type DisplayModeV02 = DisplayMode;
/** @deprecated Use RackarrExtensions instead */
export type RackarrExtensionsV02 = RackarrExtensions;
/** @deprecated Use DeviceTypeZod instead */
export type DeviceTypeZodV02 = DeviceTypeZod;
/** @deprecated Use PlacedDeviceZod instead */
export type DeviceZodV02 = PlacedDeviceZod;
/** @deprecated Use RackZod instead */
export type RackZodV02 = RackZod;
/** @deprecated Use LayoutSettingsZod instead */
export type LayoutSettingsZodV02 = LayoutSettingsZod;
/** @deprecated Use LayoutZod instead */
export type LayoutZodV02 = LayoutZod;
