/**
 * YAML Serialization Utilities
 * For folder-based project format
 */

import yaml from 'js-yaml';
import type { Layout } from '$lib/types';
import { LayoutSchema, type LayoutZod } from '$lib/schemas';

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
 * Serialize a layout to YAML string
 * Excludes runtime-only fields (view)
 */
export function serializeLayoutToYaml(layout: Layout): string {
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
 * Convert Zod-validated layout to runtime Layout type
 * Adds runtime defaults (e.g., rack.view)
 */
function toRuntimeLayout(parsed: LayoutZod): Layout {
	return {
		...parsed,
		rack: {
			...parsed.rack,
			view: 'front'
		}
	};
}

/**
 * Parse YAML string to layout
 * Validates against schema and adds runtime defaults
 */
export function parseLayoutYaml(yamlString: string): Layout {
	// Parse YAML (may throw on invalid syntax)
	const parsed = parseYaml(yamlString);

	// Validate against schema - result.data is typed as LayoutZod
	const result = LayoutSchema.safeParse(parsed);

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

	// Convert to runtime Layout type with defaults
	return toRuntimeLayout(result.data);
}
