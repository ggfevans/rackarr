/**
 * Device Zod Schema
 * Validation schemas for device types per spec Section 3.6
 */

import { z } from 'zod';

/**
 * Airflow direction schema - 10 valid airflow patterns
 */
export const AirflowSchema = z.enum([
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
]);

/**
 * Weight unit schema
 */
export const WeightUnitSchema = z.enum(['kg', 'g', 'lb', 'oz']);

/**
 * Device face schema - which side(s) the device occupies
 */
export const DeviceFaceSchema = z.enum(['front', 'rear', 'both']);

/**
 * Device category schema - 11 fixed categories
 */
export const CategorySchema = z.enum([
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
 * Device images schema - front and rear image paths
 */
export const DeviceImagesSchema = z.object({
	front: z.string().optional(),
	rear: z.string().optional()
});

/**
 * Device schema - validates device library entries
 *
 * Uses spec naming conventions:
 * - slug: unique identifier (lowercase, hyphens, underscores, numbers)
 * - u_height: height in rack units (0.5-100, multiples of 0.5)
 */
export const DeviceSchema = z
	.object({
		// Required fields
		slug: z.string().regex(/^[-a-z0-9_]+$/, {
			message: 'Slug must contain only lowercase letters, numbers, hyphens, and underscores'
		}),
		name: z.string().min(1, { message: 'Name is required' }),
		u_height: z
			.number()
			.min(0.5, { message: 'Height must be at least 0.5U' })
			.max(100, { message: 'Height cannot exceed 100U' })
			.multipleOf(0.5, { message: 'Height must be a multiple of 0.5U' }),
		category: CategorySchema,
		colour: z.string().regex(/^#[a-fA-F0-9]{6}$/, {
			message: 'Colour must be a valid hex colour (e.g., #4A90D9)'
		}),
		is_full_depth: z.boolean().default(true),

		// Optional fields
		manufacturer: z
			.string()
			.max(100, { message: 'Manufacturer cannot exceed 100 characters' })
			.optional(),
		model: z.string().max(100, { message: 'Model cannot exceed 100 characters' }).optional(),
		part_number: z
			.string()
			.max(50, { message: 'Part number cannot exceed 50 characters' })
			.optional(),
		airflow: AirflowSchema.optional(),
		weight: z
			.number()
			.min(0, { message: 'Weight cannot be negative' })
			.multipleOf(0.01, { message: 'Weight must be a multiple of 0.01' })
			.optional(),
		weight_unit: WeightUnitSchema.optional(),
		face: DeviceFaceSchema.default('both'),
		images: DeviceImagesSchema.optional(),
		notes: z.string().optional()
	})
	.refine((data) => data.weight === undefined || data.weight_unit !== undefined, {
		message: 'weight_unit required when weight is specified'
	});

/**
 * Type inferred from DeviceSchema
 * This represents a validated device from the schema
 */
export type SchemaDevice = z.infer<typeof DeviceSchema>;

/**
 * Input type for DeviceSchema (before defaults are applied)
 */
export type SchemaDeviceInput = z.input<typeof DeviceSchema>;
