/**
 * YAML Serialization Utilities
 * For v0.2 folder-based project format
 */

import yaml from 'js-yaml';
import type { LayoutV02, RackV02 } from '$lib/types/v02';
import { LayoutSchemaV02 } from '$lib/schemas/v02';

/**
 * Serialize object to YAML string
 */
export function serializeToYaml(data: unknown): string {
	return yaml.dump(data, {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
		sortKeys: false,
		quotingType: '"'
	});
}

/**
 * Parse YAML string to object
 */
export function parseYaml<T = unknown>(yamlString: string): T {
	return yaml.load(yamlString) as T;
}

/**
 * Serialize a v0.2 layout to YAML string
 * Excludes runtime-only fields (view)
 */
export function serializeLayoutToYaml(layout: LayoutV02): string {
	// Create a copy without runtime-only fields
	const { view: _view, ...rackWithoutView } = layout.rack;

	const layoutForSerialization = {
		version: layout.version,
		name: layout.name,
		rack: rackWithoutView,
		device_types: layout.device_types,
		settings: layout.settings
	};

	return serializeToYaml(layoutForSerialization);
}

/**
 * Parse YAML string to v0.2 layout
 * Validates against schema and adds runtime defaults
 */
export function parseLayoutYaml(yamlString: string): LayoutV02 {
	// Parse YAML (may throw on invalid syntax)
	const parsed = parseYaml(yamlString);

	// Validate against schema
	const result = LayoutSchemaV02.safeParse(parsed);

	if (!result.success) {
		// Format error message with details
		const errors = result.error.issues
			.map((issue) => {
				const path = issue.path.join('.');
				return `${path}: ${issue.message}`;
			})
			.join(', ');

		throw new Error(`Invalid layout: ${errors}`);
	}

	// Add runtime defaults
	const layout = result.data as LayoutV02;
	(layout.rack as RackV02).view = 'front';

	return layout;
}
