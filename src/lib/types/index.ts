/**
 * Rackarr Core Type Definitions
 * NetBox-compatible data structures with snake_case naming
 */

// =============================================================================
// Enums and Primitive Types
// =============================================================================

/**
 * Rack view types - front or rear view
 */
export type RackView = 'front' | 'rear';

/**
 * Device face types - which face(s) of rack device occupies
 */
export type DeviceFace = 'front' | 'rear' | 'both';

/**
 * Device category types - 12 predefined categories
 */
export type DeviceCategory =
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

/**
 * Airflow direction types (NetBox-compatible)
 * Simplified to 4 types for Rackarr
 */
export type Airflow = 'passive' | 'front-to-rear' | 'rear-to-front' | 'side-to-rear';

/**
 * Weight unit types (NetBox-compatible)
 */
export type WeightUnit = 'kg' | 'lb';

/**
 * Rack form factor types (NetBox-compatible)
 */
export type FormFactor = '2-post' | '4-post' | '4-post-cabinet' | 'wall-mount' | 'open-frame';

/**
 * Display mode for devices in rack visualization
 * - 'label': Show device name as text
 * - 'image': Show device image only
 * - 'image-label': Show device image with name overlay
 */
export type DisplayMode = 'label' | 'image' | 'image-label';

// =============================================================================
// Device Types (Storage/Serialization - NetBox-compatible)
// =============================================================================

/**
 * Rackarr-specific extensions to DeviceType
 */
export interface RackarrDeviceTypeExtensions {
	/** Hex colour for display (e.g., '#4A90D9') */
	colour: string;
	/** Device category for UI filtering */
	category: DeviceCategory;
	/** User organization tags */
	tags?: string[];
}

/**
 * Device Type - template definition in library (Storage format)
 * NetBox-compatible with Rackarr extensions
 */
export interface DeviceType {
	/** Unique identifier, kebab-case slug */
	slug: string;
	/** Height in rack units (0.5-42U) */
	u_height: number;
	/** Manufacturer name */
	manufacturer?: string;
	/** Model name */
	model?: string;
	/** Whether device occupies full rack depth (default: true) */
	is_full_depth?: boolean;
	/** Device weight */
	weight?: number;
	/** Weight unit (required if weight is provided) */
	weight_unit?: WeightUnit;
	/** Airflow direction */
	airflow?: Airflow;
	/** Notes/comments */
	comments?: string;
	// Power device properties (category: 'power')
	/** Number of outlets (e.g., 8, 12, 16) */
	outlet_count?: number;
	/** VA capacity (e.g., 1500, 3000) */
	va_rating?: number;
	/** Rackarr-specific extensions */
	rackarr: RackarrDeviceTypeExtensions;
}

/**
 * Placed device - storage format
 * References a DeviceType by slug
 */
export interface PlacedDevice {
	/** Reference to DeviceType.slug */
	device_type: string;
	/** Optional custom display name for this placement */
	name?: string;
	/** Bottom U position (1-indexed, U1 is at the bottom) */
	position: number;
	/** Which face(s) of the rack the device occupies */
	face: DeviceFace;
}

// =============================================================================
// Rack Types
// =============================================================================

/**
 * A rack unit container
 */
export interface Rack {
	/** Display name */
	name: string;
	/** Height in rack units (1-100U) */
	height: number;
	/** Width in inches (10 or 19) */
	width: 10 | 19;
	/** Descending units - if true, U1 is at top (default: false) */
	desc_units: boolean;
	/** Rack form factor */
	form_factor: FormFactor;
	/** Starting unit number (default: 1) */
	starting_unit: number;
	/** Order position (for future multi-rack) */
	position: number;
	/** Devices placed in this rack */
	devices: PlacedDevice[];
	/** Current view mode - runtime only, not persisted */
	view?: RackView;
}

// =============================================================================
// Layout Types
// =============================================================================

/**
 * Layout settings
 */
export interface LayoutSettings {
	/** Display mode for devices (default: label) */
	display_mode: DisplayMode;
	/** Show labels overlaid on device images (default: false) */
	show_labels_on_images: boolean;
}

/**
 * Complete layout structure
 */
export interface Layout {
	/** Schema version */
	version: string;
	/** Layout name */
	name: string;
	/** Single rack (Rackarr is single-rack mode) */
	rack: Rack;
	/** Device type library */
	device_types: DeviceType[];
	/** Layout settings */
	settings: LayoutSettings;
}

// =============================================================================
// Helper Types for Creation
// =============================================================================

/**
 * Helper type for creating a DeviceType
 */
export interface CreateDeviceTypeData {
	name: string;
	u_height: number;
	category: DeviceCategory;
	colour: string;
	manufacturer?: string;
	model?: string;
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: WeightUnit;
	airflow?: Airflow;
	comments?: string;
	tags?: string[];
	// Power device properties
	outlet_count?: number;
	va_rating?: number;
}

/**
 * Helper type for creating a rack
 */
export interface CreateRackData {
	name: string;
	height: number;
	width?: 10 | 19;
	form_factor?: FormFactor;
	desc_units?: boolean;
	starting_unit?: number;
}

// =============================================================================
// Export Types
// =============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv';

/**
 * Export scope options
 */
export type ExportScope = 'all' | 'selected';

/**
 * Export background options
 */
export type ExportBackground = 'dark' | 'light' | 'transparent';

/**
 * Export view options - which rack face(s) to include
 */
export type ExportView = 'front' | 'rear' | 'both';

/**
 * Export options for generating images/files
 */
export interface ExportOptions {
	/** Output format */
	format: ExportFormat;
	/** Which racks to include */
	scope: ExportScope;
	/** Include rack names in export */
	includeNames: boolean;
	/** Include device legend */
	includeLegend: boolean;
	/** Background style */
	background: ExportBackground;
	/** Which view(s) to export */
	exportView?: ExportView;
	/** Display mode */
	displayMode?: DisplayMode;
	/** Show airflow indicators */
	airflowMode?: boolean;
}
