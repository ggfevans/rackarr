/**
 * Layout Type Definitions
 * NetBox-compatible data structures with snake_case naming
 */

// Re-export shared enums from main types (these don't change)
export type { DeviceCategory, FormFactor, RackView } from './index';

/**
 * Airflow direction (NetBox-compatible)
 */
export type Airflow =
	| 'front-to-rear'
	| 'rear-to-front'
	| 'left-to-right'
	| 'right-to-left'
	| 'side-to-rear'
	| 'passive';

/**
 * Device face in rack
 */
export type DeviceFace = 'front' | 'rear' | 'both';

/**
 * Weight unit
 */
export type WeightUnit = 'kg' | 'lb';

/**
 * Rackarr-specific extensions to DeviceType
 */
export interface RackarrDeviceTypeExtensions {
	colour: string; // Hex colour for display
	category: import('./index').DeviceCategory; // For UI filtering
	tags?: string[]; // User organization
}

/**
 * Device Type - template definition in library
 * NetBox-compatible with Rackarr extensions
 */
export interface DeviceType {
	// Required fields
	slug: string; // Unique identifier, kebab-case
	u_height: number; // Height in rack units

	// Optional NetBox fields
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnit;
	airflow?: Airflow;
	comments?: string;

	// Rackarr extensions
	rackarr: RackarrDeviceTypeExtensions;
}

/**
 * Device - placed instance in rack
 */
export interface PlacedDevice {
	device_type: string; // Slug reference to DeviceType
	name?: string; // Optional display name override
	position: number; // U position (bottom of device)
	face: DeviceFace;
}

/**
 * Rack definition
 */
export interface Rack {
	name: string;
	height: number; // Total U height
	width: 10 | 19; // Rack width in inches
	desc_units: boolean; // True = number from top down
	form_factor: import('./index').FormFactor;
	starting_unit: number; // First U number (usually 1)
	position: number; // Order in layout (persisted)
	devices: PlacedDevice[];

	// Runtime only (not persisted) - added at load time
	view?: import('./index').RackView;
}

/**
 * Display mode for device rendering
 */
export type DisplayMode = 'label' | 'image';

/**
 * Layout settings
 */
export interface LayoutSettings {
	display_mode: DisplayMode;
	show_labels_on_images: boolean;
}

/**
 * Complete layout/project
 */
export interface Layout {
	version: string;
	name: string;
	rack: Rack; // Single rack
	device_types: DeviceType[];
	settings: LayoutSettings;
}

/**
 * Helper type for creating a DeviceType without requiring all fields
 */
export interface CreateDeviceTypeData {
	name: string;
	u_height: number;
	category: import('./index').DeviceCategory;
	colour: string;
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnit;
	airflow?: Airflow;
	comments?: string;
	tags?: string[];
}

/**
 * Helper type for creating a rack
 */
export interface CreateRackData {
	name: string;
	height: number;
	width?: 10 | 19;
	form_factor?: import('./index').FormFactor;
	desc_units?: boolean;
	starting_unit?: number;
}

// Backwards compatibility aliases (deprecated - use new names)
/** @deprecated Use DeviceType instead */
export type DeviceTypeV02 = DeviceType;
/** @deprecated Use PlacedDevice instead */
export type DeviceV02 = PlacedDevice;
/** @deprecated Use Layout instead */
export type LayoutV02 = Layout;
/** @deprecated Use Rack instead */
export type RackV02 = Rack;
/** @deprecated Use DeviceFace instead */
export type DeviceFaceV02 = DeviceFace;
/** @deprecated Use Airflow instead */
export type AirflowV02 = Airflow;
/** @deprecated Use WeightUnit instead */
export type WeightUnitV02 = WeightUnit;
/** @deprecated Use LayoutSettings instead */
export type LayoutSettingsV02 = LayoutSettings;
/** @deprecated Use CreateRackData instead */
export type CreateRackDataV02 = CreateRackData;
/** @deprecated Use CreateDeviceTypeData instead */
export type CreateDeviceTypeDataV02 = CreateDeviceTypeData;
/** @deprecated Use DisplayMode instead */
export type DisplayModeV02 = DisplayMode;
/** @deprecated Use RackarrDeviceTypeExtensions instead */
export type RackarrExtensionsV02 = RackarrDeviceTypeExtensions;
