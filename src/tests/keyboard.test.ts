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

	describe('Undo/Redo Shortcuts', () => {
		it('Ctrl+Z triggers undo when history available', async () => {
			const layoutStore = getLayoutStore();

			// Create initial state and make a change to enable undo
			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 5);

			expect(layoutStore.canUndo).toBe(true);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

			// After undo, device should be removed
			expect(layoutStore.rack!.devices.length).toBe(0);
		});

		it('Cmd+Z triggers undo (Mac)', async () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 5);

			expect(layoutStore.canUndo).toBe(true);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'z', metaKey: true });

			expect(layoutStore.rack!.devices.length).toBe(0);
		});

		it('Ctrl+Shift+Z triggers redo when history available', async () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 5);
			layoutStore.undo(); // Undo the placement

			expect(layoutStore.canRedo).toBe(true);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });

			// After redo, device should be back
			expect(layoutStore.rack!.devices.length).toBe(1);
		});

		it('Ctrl+Y triggers redo', async () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 5);
			layoutStore.undo();

			expect(layoutStore.canRedo).toBe(true);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'y', ctrlKey: true });

			expect(layoutStore.rack!.devices.length).toBe(1);
		});

		it('Cmd+Shift+Z triggers redo (Mac)', async () => {
			const layoutStore = getLayoutStore();

			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: 'Test Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 5);
			layoutStore.undo();

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true });

			expect(layoutStore.rack!.devices.length).toBe(1);
		});

		it('does nothing when undo is not available', async () => {
			const layoutStore = getLayoutStore();

			// Fresh store reset already puts us in a state with no history
			// The default state has a rack but no undoable actions
			// Let's clear history to ensure clean state
			layoutStore.clearHistory?.();

			render(KeyboardHandler);

			// Should not throw even when canUndo is false
			await fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

			// No error thrown means the test passes
		});

		it('does nothing when redo is not available', async () => {
			const layoutStore = getLayoutStore();

			// Fresh state with no redo history
			layoutStore.addRack('Test Rack', 42);
			expect(layoutStore.canRedo).toBe(false);

			render(KeyboardHandler);

			// Should not throw
			await fireEvent.keyDown(window, { key: 'y', ctrlKey: true });

			expect(layoutStore.rackCount).toBe(1);
		});
	});

	describe('Delete Shortcuts', () => {
		it('Delete key triggers delete callback', async () => {
			const onDelete = vi.fn();

			render(KeyboardHandler, { props: { ondelete: onDelete } });

			await fireEvent.keyDown(window, { key: 'Delete' });

			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it('Backspace key triggers delete callback', async () => {
			const onDelete = vi.fn();

			render(KeyboardHandler, { props: { ondelete: onDelete } });

			await fireEvent.keyDown(window, { key: 'Backspace' });

			expect(onDelete).toHaveBeenCalledTimes(1);
		});

		it('Delete does nothing without callback', async () => {
			// Should not throw when no callback provided
			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'Delete' });

			// Test passes if no error thrown
		});
	});

	describe('Help Shortcut', () => {
		it('? key triggers help callback', async () => {
			const onHelp = vi.fn();

			render(KeyboardHandler, { props: { onhelp: onHelp } });

			await fireEvent.keyDown(window, { key: '?' });

			expect(onHelp).toHaveBeenCalledTimes(1);
		});

		it('? does nothing without callback', async () => {
			render(KeyboardHandler);

			// Should not throw
			await fireEvent.keyDown(window, { key: '?' });
		});
	});

	describe('Event Prevention', () => {
		it('prevents default for handled shortcuts', async () => {
			const onSave = vi.fn();
			render(KeyboardHandler, { props: { onsave: onSave } });

			const event = new KeyboardEvent('keydown', {
				key: 's',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});

			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
			window.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it('does not prevent default for unhandled keys', async () => {
			render(KeyboardHandler);

			const event = new KeyboardEvent('keydown', {
				key: 'x', // Not a shortcut key
				bubbles: true,
				cancelable: true
			});

			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
			window.dispatchEvent(event);

			expect(preventDefaultSpy).not.toHaveBeenCalled();
		});
	});

	describe('Multi-U Device Movement', () => {
		it('moves 2U device by 2U increments', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			layoutStore.addRack('Test Rack', 42);
			const deviceType = layoutStore.addDeviceType({
				name: '2U Server',
				u_height: 2,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});
			layoutStore.placeDevice('rack-0', deviceType.slug, 10);
			selectionStore.selectDevice('rack-0', 0, deviceType.slug);

			render(KeyboardHandler);

			const initialPosition = layoutStore.rack!.devices[0]!.position;
			await fireEvent.keyDown(window, { key: 'ArrowUp' });

			// 2U device should move by 2U
			expect(layoutStore.rack!.devices[0]!.position).toBe(initialPosition + 2);
		});

		it('leapfrogs over blocking devices', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			layoutStore.addRack('Test Rack', 42);
			const serverType = layoutStore.addDeviceType({
				name: 'Server',
				u_height: 1,
				category: 'server',
				colour: CATEGORY_COLOURS.server
			});

			// Place a device at position 5
			layoutStore.placeDevice('rack-0', serverType.slug, 5);
			// Place another device at position 6 (blocking)
			layoutStore.placeDevice('rack-0', serverType.slug, 6);

			// Select the first device (at position 5)
			selectionStore.selectDevice('rack-0', 0, serverType.slug);

			render(KeyboardHandler);

			await fireEvent.keyDown(window, { key: 'ArrowUp' });

			// Should leapfrog over the blocking device at 6, land at 7
			expect(layoutStore.rack!.devices[0]!.position).toBe(7);
		});
	});
});
