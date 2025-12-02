/**
 * Rack Zod Schema
 * Validation schemas for rack types per spec Section 3.6
 */

import { z } from 'zod';
import { DeviceFaceSchema } from './device';

/**
 * Form factor schema - 7 rack form factors
 */
export const FormFactorSchema = z.enum([
	'4-post-cabinet',
	'4-post-frame',
	'2-post-frame',
	'wall-cabinet',
	'wall-frame',
	'wall-frame-vertical',
	'wall-cabinet-vertical'
]);

/**
 * Placed device schema - a device reference placed in a rack
 * Uses slug reference to device library, position, and optional face override
 */
export const PlacedDeviceSchema = z.object({
	slug: z.string(),
	position: z.number().int({ message: 'Position must be an integer' }).min(1, {
		message: 'Position must be at least 1'
	}),
	face: DeviceFaceSchema.optional()
});

/**
 * Rack schema - validates rack objects
 */
export const RackSchema = z.object({
	// Required fields
	id: z.string().uuid({ message: 'ID must be a valid UUID' }),
	name: z.string().min(1, { message: 'Name is required' }),
	height: z
		.number()
		.int({ message: 'Height must be an integer' })
		.min(1, { message: 'Height must be at least 1U' })
		.max(100, { message: 'Height cannot exceed 100U' }),

	// Optional fields with defaults
	width: z.number().int({ message: 'Width must be an integer' }).default(19),
	form_factor: FormFactorSchema.default('4-post-cabinet'),
	desc_units: z.boolean().default(false),
	starting_unit: z
		.number()
		.int({ message: 'Starting unit must be an integer' })
		.min(1, { message: 'Starting unit must be at least 1' })
		.default(1),
	devices: z.array(PlacedDeviceSchema).default([])
});

/**
 * Type inferred from RackSchema
 */
export type SchemaRack = z.infer<typeof RackSchema>;

/**
 * Type inferred from PlacedDeviceSchema
 */
export type SchemaPlacedDevice = z.infer<typeof PlacedDeviceSchema>;

/**
 * Input type for RackSchema (before defaults are applied)
 */
export type SchemaRackInput = z.input<typeof RackSchema>;
