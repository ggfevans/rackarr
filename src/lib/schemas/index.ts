/**
 * Zod Schema Exports
 * Central export point for all validation schemas
 */

// Device schemas
export {
	DeviceSchema,
	AirflowSchema,
	WeightUnitSchema,
	DeviceFaceSchema,
	CategorySchema,
	DeviceImagesSchema,
	type SchemaDevice,
	type SchemaDeviceInput
} from './device';

// Rack schemas
export {
	RackSchema,
	FormFactorSchema,
	PlacedDeviceSchema,
	type SchemaRack,
	type SchemaPlacedDevice,
	type SchemaRackInput
} from './rack';

// Project/Layout schemas
export {
	ProjectSchema,
	LayoutSchema,
	SettingsSchema,
	ThemeSchema,
	ViewSchema,
	DisplayModeSchema,
	type SchemaProject,
	type SchemaLayout,
	type SchemaProjectInput,
	type SchemaSettings
} from './project';
