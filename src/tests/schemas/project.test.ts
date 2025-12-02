import { describe, it, expect } from 'vitest';
import {
	ProjectSchema,
	LayoutSchema,
	SettingsSchema,
	ViewSchema,
	DisplayModeSchema
} from '$lib/schemas/project';

describe('Project Schema', () => {
	describe('ViewSchema', () => {
		it('accepts front and rear values', () => {
			expect(ViewSchema.safeParse('front').success).toBe(true);
			expect(ViewSchema.safeParse('rear').success).toBe(true);
		});

		it('rejects invalid view values', () => {
			expect(ViewSchema.safeParse('side').success).toBe(false);
			expect(ViewSchema.safeParse('').success).toBe(false);
		});
	});

	describe('DisplayModeSchema', () => {
		it('accepts label and image values', () => {
			expect(DisplayModeSchema.safeParse('label').success).toBe(true);
			expect(DisplayModeSchema.safeParse('image').success).toBe(true);
		});

		it('rejects invalid display mode values', () => {
			expect(DisplayModeSchema.safeParse('text').success).toBe(false);
			expect(DisplayModeSchema.safeParse('').success).toBe(false);
		});
	});

	describe('SettingsSchema', () => {
		it('accepts valid settings with all fields', () => {
			const settings = {
				theme: 'dark',
				view: 'front',
				displayMode: 'label',
				showLabelsOnImages: false
			};
			expect(SettingsSchema.safeParse(settings).success).toBe(true);
		});

		it('accepts settings with only theme', () => {
			const settings = { theme: 'dark' };
			const result = SettingsSchema.safeParse(settings);
			expect(result.success).toBe(true);
		});

		it('applies default values', () => {
			const settings = { theme: 'dark' };
			const result = SettingsSchema.safeParse(settings);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.theme).toBe('dark');
				expect(result.data.view).toBe('front');
				expect(result.data.displayMode).toBe('label');
				expect(result.data.showLabelsOnImages).toBe(false);
			}
		});

		it('rejects invalid theme', () => {
			const settings = { theme: 'blue' };
			expect(SettingsSchema.safeParse(settings).success).toBe(false);
		});

		it('accepts light theme', () => {
			const settings = { theme: 'light' };
			expect(SettingsSchema.safeParse(settings).success).toBe(true);
		});

		it('rejects settings without theme', () => {
			const settings = {};
			expect(SettingsSchema.safeParse(settings).success).toBe(false);
		});
	});

	describe('ProjectSchema', () => {
		const validProject = {
			version: '0.2.0',
			name: 'My Homelab',
			created: '2025-01-15T10:30:00.000Z',
			modified: '2025-01-15T10:30:00.000Z',
			settings: { theme: 'dark' },
			deviceLibrary: [],
			racks: []
		};

		describe('required fields', () => {
			it('accepts valid project with all required fields', () => {
				expect(ProjectSchema.safeParse(validProject).success).toBe(true);
			});

			it('fails without version', () => {
				const { version: _version, ...invalid } = validProject;
				expect(ProjectSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without name', () => {
				const { name: _name, ...invalid } = validProject;
				expect(ProjectSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without created', () => {
				const { created: _created, ...invalid } = validProject;
				expect(ProjectSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without modified', () => {
				const { modified: _modified, ...invalid } = validProject;
				expect(ProjectSchema.safeParse(invalid).success).toBe(false);
			});

			it('fails without settings', () => {
				const { settings: _settings, ...invalid } = validProject;
				expect(ProjectSchema.safeParse(invalid).success).toBe(false);
			});
		});

		describe('version validation', () => {
			it('accepts any version string', () => {
				const project = { ...validProject, version: '1.0.0' };
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('accepts semantic version', () => {
				const project = { ...validProject, version: '0.2.1' };
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});
		});

		describe('name validation', () => {
			it('accepts valid name', () => {
				const project = { ...validProject, name: 'Production Rack Layout' };
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('rejects empty name', () => {
				const project = { ...validProject, name: '' };
				expect(ProjectSchema.safeParse(project).success).toBe(false);
			});
		});

		describe('datetime validation', () => {
			it('accepts valid ISO datetime for created', () => {
				const project = { ...validProject, created: '2025-01-15T10:30:00Z' };
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('accepts valid ISO datetime with milliseconds', () => {
				const project = { ...validProject, created: '2025-01-15T10:30:00.123Z' };
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('rejects invalid datetime format for created', () => {
				const project = { ...validProject, created: 'invalid-date' };
				expect(ProjectSchema.safeParse(project).success).toBe(false);
			});

			it('rejects invalid datetime format for modified', () => {
				const project = { ...validProject, modified: '2025-01-15' };
				expect(ProjectSchema.safeParse(project).success).toBe(false);
			});
		});

		describe('settings validation', () => {
			it('accepts valid settings', () => {
				const project = {
					...validProject,
					settings: {
						theme: 'light',
						view: 'rear',
						displayMode: 'image',
						showLabelsOnImages: true
					}
				};
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('applies default settings values', () => {
				const project = { ...validProject, settings: { theme: 'dark' } };
				const result = ProjectSchema.safeParse(project);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.settings.view).toBe('front');
					expect(result.data.settings.displayMode).toBe('label');
					expect(result.data.settings.showLabelsOnImages).toBe(false);
				}
			});
		});

		describe('deviceLibrary validation', () => {
			it('accepts empty device library', () => {
				expect(ProjectSchema.safeParse(validProject).success).toBe(true);
			});

			it('defaults to empty array', () => {
				const { deviceLibrary: _lib, ...project } = validProject;
				const result = ProjectSchema.safeParse(project);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.deviceLibrary).toEqual([]);
				}
			});

			it('accepts valid devices', () => {
				const project = {
					...validProject,
					deviceLibrary: [
						{
							slug: 'server-1',
							name: 'Dell R740',
							u_height: 2,
							category: 'server',
							colour: '#4A90D9',
							is_full_depth: true
						}
					]
				};
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('rejects invalid devices', () => {
				const project = {
					...validProject,
					deviceLibrary: [{ name: 'Missing fields' }]
				};
				expect(ProjectSchema.safeParse(project).success).toBe(false);
			});
		});

		describe('racks validation', () => {
			it('accepts empty racks array', () => {
				expect(ProjectSchema.safeParse(validProject).success).toBe(true);
			});

			it('defaults to empty array', () => {
				const { racks: _racks, ...project } = validProject;
				const result = ProjectSchema.safeParse(project);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.racks).toEqual([]);
				}
			});

			it('accepts valid racks', () => {
				const project = {
					...validProject,
					racks: [
						{
							id: '550e8400-e29b-41d4-a716-446655440000',
							name: 'Main Rack',
							height: 42
						}
					]
				};
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('accepts multiple racks', () => {
				const project = {
					...validProject,
					racks: [
						{
							id: '550e8400-e29b-41d4-a716-446655440000',
							name: 'Rack A',
							height: 42
						},
						{
							id: '550e8400-e29b-41d4-a716-446655440001',
							name: 'Rack B',
							height: 24
						}
					]
				};
				expect(ProjectSchema.safeParse(project).success).toBe(true);
			});

			it('rejects invalid racks', () => {
				const project = {
					...validProject,
					racks: [{ name: 'Missing fields' }]
				};
				expect(ProjectSchema.safeParse(project).success).toBe(false);
			});
		});

		describe('full project', () => {
			it('accepts complete project with all fields', () => {
				const fullProject = {
					version: '0.2.1',
					name: 'Production Datacenter',
					created: '2025-01-01T00:00:00.000Z',
					modified: '2025-01-15T12:30:00.000Z',
					settings: {
						theme: 'dark',
						view: 'front',
						displayMode: 'image',
						showLabelsOnImages: true
					},
					deviceLibrary: [
						{
							slug: 'dell-r740',
							name: 'Dell PowerEdge R740',
							u_height: 2,
							category: 'server',
							colour: '#4A90D9',
							is_full_depth: true,
							manufacturer: 'Dell',
							model: 'R740'
						}
					],
					racks: [
						{
							id: '550e8400-e29b-41d4-a716-446655440000',
							name: 'Production Rack A1',
							height: 42,
							width: 19,
							form_factor: '4-post-cabinet',
							desc_units: false,
							starting_unit: 1,
							devices: [{ slug: 'dell-r740', position: 1, face: 'front' }]
						}
					]
				};

				const result = ProjectSchema.safeParse(fullProject);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.name).toBe('Production Datacenter');
					expect(result.data.deviceLibrary.length).toBe(1);
					expect(result.data.racks.length).toBe(1);
				}
			});
		});

		describe('type inference', () => {
			it('infers correct types from schema', () => {
				const result = ProjectSchema.safeParse(validProject);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(typeof result.data.version).toBe('string');
					expect(typeof result.data.name).toBe('string');
					expect(typeof result.data.created).toBe('string');
					expect(typeof result.data.modified).toBe('string');
					expect(typeof result.data.settings).toBe('object');
					expect(Array.isArray(result.data.deviceLibrary)).toBe(true);
					expect(Array.isArray(result.data.racks)).toBe(true);
				}
			});
		});
	});

	describe('LayoutSchema alias', () => {
		it('is the same as ProjectSchema', () => {
			expect(LayoutSchema).toBe(ProjectSchema);
		});

		it('validates the same data', () => {
			const validLayout = {
				version: '0.2.0',
				name: 'Layout Test',
				created: '2025-01-15T10:30:00.000Z',
				modified: '2025-01-15T10:30:00.000Z',
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			};

			const projectResult = ProjectSchema.safeParse(validLayout);
			const layoutResult = LayoutSchema.safeParse(validLayout);

			expect(projectResult.success).toBe(layoutResult.success);
		});
	});
});
