/**
 * Project/Layout Zod Schema
 * Validation schemas for the complete layout/project structure per spec Section 3.6
 *
 * Note: The spec uses "Project" terminology but existing code uses "Layout".
 * Both names are exported for compatibility.
 */

import { z } from 'zod';
import { DeviceSchema } from './device';
import { RackSchema } from './rack';

/**
 * Theme schema
 */
export const ThemeSchema = z.enum(['dark', 'light']);

/**
 * View schema - front or rear view
 */
export const ViewSchema = z.enum(['front', 'rear']);

/**
 * Display mode schema - label or image display
 */
export const DisplayModeSchema = z.enum(['label', 'image']);

/**
 * Settings schema - layout display settings
 */
export const SettingsSchema = z.object({
	theme: ThemeSchema,
	view: ViewSchema.default('front'),
	displayMode: DisplayModeSchema.default('label'),
	showLabelsOnImages: z.boolean().default(false)
});

/**
 * Project/Layout schema - the complete project structure
 *
 * Note: Uses `racks` (array) for compatibility with existing code,
 * though spec defines single `rack`. This allows multiple racks.
 */
export const ProjectSchema = z.object({
	// Required fields
	version: z.string(),
	name: z.string().min(1, { message: 'Name is required' }),
	created: z.string().datetime({ message: 'Created must be a valid ISO datetime' }),
	modified: z.string().datetime({ message: 'Modified must be a valid ISO datetime' }),
	settings: SettingsSchema,

	// Optional fields with defaults
	deviceLibrary: z.array(DeviceSchema).default([]),
	racks: z.array(RackSchema).default([])
});

/**
 * Layout schema - alias for ProjectSchema for compatibility with existing code
 */
export const LayoutSchema = ProjectSchema;

/**
 * Type inferred from ProjectSchema
 */
export type SchemaProject = z.infer<typeof ProjectSchema>;

/**
 * Type alias for Layout - same as SchemaProject
 */
export type SchemaLayout = SchemaProject;

/**
 * Input type for ProjectSchema (before defaults are applied)
 */
export type SchemaProjectInput = z.input<typeof ProjectSchema>;

/**
 * Type inferred from SettingsSchema
 */
export type SchemaSettings = z.infer<typeof SettingsSchema>;
