/**
 * v0.2 Layout Serialization and Factory Functions
 */

import type { Layout, Rack } from '$lib/types/v02';
import type { FormFactor } from '$lib/types';
import { getStarterLibraryV02 } from '$lib/data/starterLibraryV02';

/**
 * Create a new empty v0.2 layout
 * @param name - Layout name (default: "Racky McRackface")
 * @returns New Layout object with starter device type library
 */
export function createLayout(name: string = 'Racky McRackface'): Layout {
	return {
		version: '0.2.0',
		name,
		rack: createDefaultRack(name),
		device_types: getStarterLibraryV02(),
		settings: {
			display_mode: 'label',
			show_labels_on_images: false
		}
	};
}

/**
 * Create a default rack for a new layout
 * @param name - Rack name
 * @returns A default Rack with empty devices
 */
function createDefaultRack(name: string): Rack {
	return {
		name,
		height: 42,
		width: 19,
		desc_units: false,
		form_factor: '4-post-cabinet',
		starting_unit: 1,
		position: 0,
		devices: [],
		view: 'front' // Runtime only
	};
}

/**
 * Create a v0.2 rack with the given parameters
 * @param name - Rack name
 * @param height - Rack height in U
 * @param width - Rack width (10 or 19)
 * @param form_factor - Form factor
 * @param desc_units - Whether units are numbered top-down
 * @param starting_unit - First U number
 * @returns A new Rack object
 */
export function createRack(
	name: string,
	height: number,
	width: 10 | 19 = 19,
	form_factor: FormFactor = '4-post-cabinet',
	desc_units: boolean = false,
	starting_unit: number = 1
): Rack {
	return {
		name,
		height,
		width,
		desc_units,
		form_factor,
		starting_unit,
		position: 0,
		devices: [],
		view: 'front' // Runtime only
	};
}
