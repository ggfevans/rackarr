import { describe, it, expect } from 'vitest';
import { getAirflowDirection, hasAirflowConflict, findAirflowConflicts } from '$lib/utils/airflow';
import type { Rack, Device, PlacedDevice } from '$lib/types';

describe('Airflow Utilities', () => {
	describe('getAirflowDirection', () => {
		it('returns neutral for passive airflow', () => {
			expect(getAirflowDirection('passive', 'front')).toBe('neutral');
			expect(getAirflowDirection('passive', 'rear')).toBe('neutral');
		});

		it('returns neutral for undefined airflow', () => {
			expect(getAirflowDirection(undefined, 'front')).toBe('neutral');
			expect(getAirflowDirection(undefined, 'rear')).toBe('neutral');
		});

		it('returns correct direction for front-to-rear', () => {
			expect(getAirflowDirection('front-to-rear', 'front')).toBe('intake');
			expect(getAirflowDirection('front-to-rear', 'rear')).toBe('exhaust');
		});

		it('returns correct direction for rear-to-front', () => {
			expect(getAirflowDirection('rear-to-front', 'front')).toBe('exhaust');
			expect(getAirflowDirection('rear-to-front', 'rear')).toBe('intake');
		});

		it('returns correct direction for side-to-rear', () => {
			expect(getAirflowDirection('side-to-rear', 'front')).toBe('intake');
			expect(getAirflowDirection('side-to-rear', 'rear')).toBe('exhaust');
		});

		it('returns neutral for lateral flows', () => {
			expect(getAirflowDirection('left-to-right', 'front')).toBe('neutral');
			expect(getAirflowDirection('left-to-right', 'rear')).toBe('neutral');
			expect(getAirflowDirection('right-to-left', 'front')).toBe('neutral');
			expect(getAirflowDirection('right-to-left', 'rear')).toBe('neutral');
		});
	});

	describe('hasAirflowConflict', () => {
		it('returns true when lower exhausts and upper intakes on rear', () => {
			// Lower: front-to-rear (exhausts rear), Upper: rear-to-front (intakes rear)
			expect(hasAirflowConflict('front-to-rear', 'rear-to-front', 'rear')).toBe(true);
		});

		it('returns true when lower exhausts and upper intakes on front', () => {
			// Lower: rear-to-front (exhausts front), Upper: front-to-rear (intakes front)
			expect(hasAirflowConflict('rear-to-front', 'front-to-rear', 'front')).toBe(true);
		});

		it('returns false when both exhaust', () => {
			expect(hasAirflowConflict('front-to-rear', 'front-to-rear', 'rear')).toBe(false);
		});

		it('returns false when both intake', () => {
			expect(hasAirflowConflict('front-to-rear', 'front-to-rear', 'front')).toBe(false);
		});

		it('returns false when lower intakes and upper exhausts', () => {
			// This is actually good airflow (cool air pulled in, hot air exhausted above)
			expect(hasAirflowConflict('front-to-rear', 'front-to-rear', 'front')).toBe(false);
		});

		it('returns false for passive devices', () => {
			expect(hasAirflowConflict('passive', 'front-to-rear', 'front')).toBe(false);
			expect(hasAirflowConflict('front-to-rear', 'passive', 'rear')).toBe(false);
		});

		it('returns false for undefined airflow', () => {
			expect(hasAirflowConflict(undefined, 'front-to-rear', 'front')).toBe(false);
			expect(hasAirflowConflict('front-to-rear', undefined, 'rear')).toBe(false);
		});
	});

	describe('findAirflowConflicts', () => {
		const createDevice = (id: string, height: number, airflow?: string): Device => ({
			id,
			name: `Device ${id}`,
			height,
			category: 'server',
			colour: '#3b82f6',
			airflow: airflow as Device['airflow']
		});

		const createPlacedDevice = (
			libraryId: string,
			position: number,
			face: 'front' | 'rear' | 'both' = 'both'
		): PlacedDevice => ({
			libraryId,
			position,
			face
		});

		it('returns empty array for empty rack', () => {
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, []);
			expect(conflicts).toHaveLength(0);
		});

		it('returns empty array for single device', () => {
			const device = createDevice('server-1', 2, 'front-to-rear');
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [createPlacedDevice('server-1', 1)],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, [device]);
			expect(conflicts).toHaveLength(0);
		});

		it('detects conflict between adjacent devices', () => {
			const devices: Device[] = [
				createDevice('server-lower', 2, 'front-to-rear'), // Exhausts rear
				createDevice('server-upper', 2, 'rear-to-front') // Intakes rear - CONFLICT!
			];
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [
					createPlacedDevice('server-lower', 1), // U1-U2
					createPlacedDevice('server-upper', 3) // U3-U4 (adjacent to lower)
				],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, devices);
			expect(conflicts).toHaveLength(1);
			expect(conflicts[0]).toMatchObject({
				position: 3,
				type: 'exhaust-to-intake',
				face: 'rear'
			});
		});

		it('returns empty array for non-adjacent devices', () => {
			const devices: Device[] = [
				createDevice('server-lower', 2, 'front-to-rear'),
				createDevice('server-upper', 2, 'rear-to-front')
			];
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [
					createPlacedDevice('server-lower', 1), // U1-U2
					createPlacedDevice('server-upper', 5) // U5-U6 (gap at U3-U4)
				],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, devices);
			expect(conflicts).toHaveLength(0);
		});

		it('returns empty array for devices with same airflow direction', () => {
			const devices: Device[] = [
				createDevice('server-1', 2, 'front-to-rear'),
				createDevice('server-2', 2, 'front-to-rear')
			];
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [createPlacedDevice('server-1', 1), createPlacedDevice('server-2', 3)],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, devices);
			expect(conflicts).toHaveLength(0);
		});

		it('ignores conflicts when devices are on different faces', () => {
			const devices: Device[] = [
				createDevice('server-lower', 2, 'front-to-rear'),
				createDevice('server-upper', 2, 'rear-to-front')
			];
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [
					createPlacedDevice('server-lower', 1, 'front'), // Front only
					createPlacedDevice('server-upper', 3, 'rear') // Rear only - no overlap
				],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, devices);
			expect(conflicts).toHaveLength(0);
		});

		it('handles passive devices without conflicts', () => {
			const devices: Device[] = [
				createDevice('server-active', 2, 'front-to-rear'),
				createDevice('passive-device', 1, 'passive')
			];
			const rack: Rack = {
				id: 'rack-1',
				name: 'Test Rack',
				height: 42,
				width: 19,
				form_factor: '4-post',
				desc_units: false,
				starting_unit: 1,
				position: 0,
				devices: [createPlacedDevice('server-active', 1), createPlacedDevice('passive-device', 3)],
				view: 'front'
			};
			const conflicts = findAirflowConflicts(rack, devices);
			expect(conflicts).toHaveLength(0);
		});
	});
});
