/**
 * Rackarr Core Type Definitions
 * Based on spec.md data model
 */

/**
 * Rack view types - front or rear view
 */
export type RackView = 'front' | 'rear';

/**
 * Device face types - which face(s) of rack device occupies
 */
export type DeviceFace = 'front' | 'rear' | 'both';

/**
 * Device category types - 11 predefined categories
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
	| 'other';

/**
 * Airflow direction types for thermal metadata
 */
export type Airflow =
	| 'front-to-rear'
	| 'rear-to-front'
	| 'left-to-right'
	| 'right-to-left'
	| 'side-to-rear'
	| 'rear-to-side'
	| 'bottom-to-top'
	| 'top-to-bottom'
	| 'passive'
	| 'mixed';

/**
 * Weight unit types
 */
export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';

/**
 * Device images - front and rear image paths
 */
export interface DeviceImages {
	/** Path to front image */
	front?: string;
	/** Path to rear image */
	rear?: string;
}

/**
 * Device in the library (template)
 * Can be placed multiple times in racks
 */
export interface Device {
	/** Unique identifier (UUID) */
	id: string;
	/** Display name */
	name: string;
	/** Height in rack units (0.5-42U) */
	height: number;
	/** Hex colour for display (e.g., '#4A90D9') */
	colour: string;
	/** Device category */
	category: DeviceCategory;
	/** Optional notes/description */
	notes?: string;
	/** Manufacturer name (for NetBox imports) */
	manufacturer?: string;
	/** Model name (for NetBox imports) */
	model?: string;
	/** Part number / SKU */
	part_number?: string;
	/** Airflow direction */
	airflow?: Airflow;
	/** Device weight */
	weight?: number;
	/** Weight unit (required if weight is provided) */
	weight_unit?: WeightUnit;
	/** Whether device occupies full rack depth (default: true) */
	is_full_depth?: boolean;
	/** Default face for placement */
	face?: DeviceFace;
	/** Device images */
	images?: DeviceImages;
}

/**
 * A device placed in a rack
 * References a device from the library by ID
 */
export interface PlacedDevice {
	/** Reference to Device.id in the library */
	libraryId: string;
	/** Bottom U position (1-indexed, U1 is at the bottom) */
	position: number;
	/** Which face(s) of the rack the device occupies */
	face: DeviceFace;
}

/**
 * A rack unit container
 */
export interface Rack {
	/** Unique identifier (UUID) */
	id: string;
	/** Display name */
	name: string;
	/** Height in rack units (1-100U) */
	height: number;
	/** Width in inches (fixed at 19 for v0.1) */
	width: number;
	/** Order position in row (0-indexed) */
	position: number;
	/** Current view mode (front or rear) */
	view: RackView;
	/** Devices placed in this rack */
	devices: PlacedDevice[];
}

/**
 * Layout settings
 */
export interface LayoutSettings {
	/** Current theme */
	theme: 'dark' | 'light';
}

/**
 * Complete layout structure - matches JSON schema from spec Section 10
 */
export interface Layout {
	/** Schema version */
	version: string;
	/** Layout name */
	name: string;
	/** Creation timestamp (ISO 8601) */
	created: string;
	/** Last modified timestamp (ISO 8601) */
	modified: string;
	/** Layout settings */
	settings: LayoutSettings;
	/** Device library - all available devices */
	deviceLibrary: Device[];
	/** Racks in this layout */
	racks: Rack[];
}

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf';

/**
 * Export scope options
 */
export type ExportScope = 'all' | 'selected';

/**
 * Export background options
 */
export type ExportBackground = 'dark' | 'light' | 'transparent';

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
}
