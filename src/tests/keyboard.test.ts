import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { shouldIgnoreKeyboard, matchesShortcut, type ShortcutHandler } from '$lib/utils/keyboard';
import KeyboardHandler from '$lib/components/KeyboardHandler.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { getUIStore, resetUIStore } from '$lib/stores/ui.svelte';
import { CATEGORY_COLOURS } from '$lib/types/constants';

describe('Keyboard Utilities', () => {
	describe('shouldIgnoreKeyboard', () => {
		it('returns true when focus is in input', () => {
			const input = document.createElement('input');
			document.body.appendChild(input);
			input.focus();

			const event = new KeyboardEvent('keydown', { key: 'Delete' });
			Object.defineProperty(event, 'target', { value: input });

			expect(shouldIgnoreKeyboard(event)).toBe(true);

			document.body.removeChild(input);
		});

		it('returns true when focus is in textarea', () => {
			const textarea = document.createElement('textarea');
			document.body.appendChild(textarea);
			textarea.focus();

			const event = new KeyboardEvent('keydown', { key: 'Delete' });
			Object.defineProperty(event, 'target', { value: textarea });

			expect(shouldIgnoreKeyboard(event)).toBe(true);

			document.body.removeChild(textarea);
		});

		it('returns true when focus is in contenteditable', () => {
			const div = document.createElement('div');
			// Manually set isContentEditable since jsdom doesn't handle it well
			Object.defineProperty(div, 'isContentEditable', { value: true });
			document.body.appendChild(div);
			div.focus();

			const event = new KeyboardEvent('keydown', { key: 'Delete' });
			Object.defineProperty(event, 'target', { value: div });

			expect(shouldIgnoreKeyboard(event)).toBe(true);

			document.body.removeChild(div);
		});

		it('returns false for regular elements', () => {
			const div = document.createElement('div');
			const event = new KeyboardEvent('keydown', { key: 'Delete' });
			Object.defineProperty(event, 'target', { value: div });

			expect(shouldIgnoreKeyboard(event)).toBe(false);
		});
	});

	describe('matchesShortcut', () => {
		it('matches simple key', () => {
			const shortcut: ShortcutHandler = {
				key: 'Delete',
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 'Delete' });

			expect(matchesShortcut(event, shortcut)).toBe(true);
		});

		it('matches key with ctrl modifier', () => {
			const shortcut: ShortcutHandler = {
				key: 's',
				ctrl: true,
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });

			expect(matchesShortcut(event, shortcut)).toBe(true);
		});

		it('matches key with meta modifier (Cmd)', () => {
			const shortcut: ShortcutHandler = {
				key: 's',
				meta: true,
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });

			expect(matchesShortcut(event, shortcut)).toBe(true);
		});

		it('does not match when modifier missing', () => {
			const shortcut: ShortcutHandler = {
				key: 's',
				ctrl: true,
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 's' });

			expect(matchesShortcut(event, shortcut)).toBe(false);
		});

		it('does not match when key is different', () => {
			const shortcut: ShortcutHandler = {
				key: 'Delete',
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 'Backspace' });

			expect(matchesShortcut(event, shortcut)).toBe(false);
		});

		it('is case-insensitive for letter keys', () => {
			const shortcut: ShortcutHandler = {
				key: 'd',
				action: () => {}
			};
			const event = new KeyboardEvent('keydown', { key: 'D' });

			expect(matchesShortcut(event, shortcut)).toBe(true);
		});
	});
});

describe('KeyboardHandler Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
	});

	describe('Selection Shortcuts', () => {
		it('Escape key clears selection', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack('rack-0');
			expect(selectionStore.hasSelection).toBe(true);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(selectionStore.hasSelection).toBe(false);
		});
	});

	describe('Device Movement Shortcuts', () => {
		it('ArrowUp moves selected device up 1U', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Setup: rack with device at position 5
			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			const rackId = 'rack-0';
			layoutStore.placeDevice(rackId, deviceType.slug, 5);

			// Select the device
			selectionStore.selectDevice(rackId, 0, deviceType.slug);

			render(KeyboardHandler);

			const initialPosition = layoutStore.rack!.devices[0]!.position;
			await fireEvent.keyDown(window, { key: 'ArrowUp' });

			// Device should move up (higher U number)
			expect(layoutStore.rack!.devices[0]!.position).toBe(initialPosition + 1);
		});

		it('ArrowDown moves selected device down 1U', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Setup: rack with device at position 5
			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			const rackId = 'rack-0';
			layoutStore.placeDevice(rackId, deviceType.slug, 5);

			// Select the device
			selectionStore.selectDevice(rackId, 0, deviceType.slug);

			render(KeyboardHandler);

			const initialPosition = layoutStore.rack!.devices[0]!.position;
			await fireEvent.keyDown(window, { key: 'ArrowDown' });

			// Device should move down (lower U number)
			expect(layoutStore.rack!.devices[0]!.position).toBe(initialPosition - 1);
		});

		it('ArrowDown does not move device below U1', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Setup: rack with device at position 1 (bottom)
			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			const rackId = 'rack-0';
			layoutStore.placeDevice(rackId, deviceType.slug, 1);

			// Select the device
			selectionStore.selectDevice(rackId, 0, deviceType.slug);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'ArrowDown' });

			// Device should stay at position 1
			expect(layoutStore.rack!.devices[0]!.position).toBe(1);
		});
	});

	describe('UI Shortcuts', () => {
		it('D key toggles device palette', async () => {
			const uiStore = getUIStore();
			const initialState = uiStore.leftDrawerOpen;

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'd' });

			expect(uiStore.leftDrawerOpen).toBe(!initialState);
		});

		it('F key triggers fit all', async () => {
			const onFitAll = vi.fn();

			render(KeyboardHandler, { props: { onfitall: onFitAll } });

			await fireEvent.keyDown(window, { key: 'f' });

			expect(onFitAll).toHaveBeenCalledTimes(1);
		});
	});

	describe('Modifier Key Shortcuts', () => {
		it('Ctrl+S triggers save', async () => {
			const onSave = vi.fn();

			render(KeyboardHandler, { props: { onsave: onSave } });

			await fireEvent.keyDown(window, { key: 's', ctrlKey: true });

			expect(onSave).toHaveBeenCalledTimes(1);
		});

		it('Cmd+S triggers save (Mac)', async () => {
			const onSave = vi.fn();

			render(KeyboardHandler, { props: { onsave: onSave } });

			await fireEvent.keyDown(window, { key: 's', metaKey: true });

			expect(onSave).toHaveBeenCalledTimes(1);
		});

		it('Ctrl+O triggers load', async () => {
			const onLoad = vi.fn();

			render(KeyboardHandler, { props: { onload: onLoad } });

			await fireEvent.keyDown(window, { key: 'o', ctrlKey: true });

			expect(onLoad).toHaveBeenCalledTimes(1);
		});

		it('Ctrl+E triggers export', async () => {
			const onExport = vi.fn();

			render(KeyboardHandler, { props: { onexport: onExport } });

			await fireEvent.keyDown(window, { key: 'e', ctrlKey: true });

			expect(onExport).toHaveBeenCalledTimes(1);
		});

		// Note: Duplicate rack tests updated for single-rack mode (v0.1.1)
		// In single-rack mode, duplicating is blocked - test verifies no duplicate created
		it('Ctrl+D does not duplicate in single-rack mode', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Create and select a rack
			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack('rack-0');
			expect(layoutStore.rackCount).toBe(1);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

			// Single-rack mode: duplicate is blocked, still only 1 rack
			expect(layoutStore.rackCount).toBe(1);
		});

		it('Cmd+D does not duplicate in single-rack mode (Mac)', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Create and select a rack
			layoutStore.addRack('Test Rack', 42);
			selectionStore.selectRack('rack-0');
			expect(layoutStore.rackCount).toBe(1);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'd', metaKey: true });

			// Single-rack mode: duplicate is blocked, still only 1 rack
			expect(layoutStore.rackCount).toBe(1);
		});
	});

	describe('Ignore in Input Fields', () => {
		it('does not handle shortcuts when typing in input', async () => {
			const uiStore = getUIStore();
			const initialState = uiStore.leftDrawerOpen;

			render(KeyboardHandler);

			// Create an input and focus it
			const input = document.createElement('input');
			document.body.appendChild(input);
			input.focus();

			// Simulate keydown with input as target
			const event = new KeyboardEvent('keydown', {
				key: 'd',
				bubbles: true
			});
			Object.defineProperty(event, 'target', { value: input });
			window.dispatchEvent(event);

			// Drawer should not toggle
			expect(uiStore.leftDrawerOpen).toBe(initialState);

			document.body.removeChild(input);
		});
	});

	describe('Display Mode Toggle', () => {
		it('I key toggles display mode', async () => {
			const onToggleDisplayMode = vi.fn();
			render(KeyboardHandler, { props: { ontoggledisplaymode: onToggleDisplayMode } });

			await fireEvent.keyDown(window, { key: 'i' });

			expect(onToggleDisplayMode).toHaveBeenCalledTimes(1);
		});

		it('I key is case insensitive', async () => {
			const onToggleDisplayMode = vi.fn();
			render(KeyboardHandler, { props: { ontoggledisplaymode: onToggleDisplayMode } });

			await fireEvent.keyDown(window, { key: 'I' });

			expect(onToggleDisplayMode).toHaveBeenCalledTimes(1);
		});
	});

	describe('Airflow Mode Toggle', () => {
		it('A key toggles airflow mode', async () => {
			const onToggleAirflowMode = vi.fn();
			render(KeyboardHandler, { props: { ontoggleairflowmode: onToggleAirflowMode } });

			await fireEvent.keyDown(window, { key: 'a' });

			expect(onToggleAirflowMode).toHaveBeenCalledTimes(1);
		});

		it('A key is case insensitive', async () => {
			const onToggleAirflowMode = vi.fn();
			render(KeyboardHandler, { props: { ontoggleairflowmode: onToggleAirflowMode } });

			await fireEvent.keyDown(window, { key: 'A' });

			expect(onToggleAirflowMode).toHaveBeenCalledTimes(1);
		});
	});
});
