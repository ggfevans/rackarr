<!--
  KeyboardHandler component
  Handles global keyboard shortcuts for the application
-->
<script lang="ts">
	import { shouldIgnoreKeyboard, matchesShortcut, type ShortcutHandler } from '$lib/utils/keyboard';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';

	interface Props {
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onfitall?: () => void;
		onhelp?: () => void;
	}

	let { onsave, onload, onexport, ondelete, onfitall, onhelp }: Props = $props();

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();

	// Define all shortcuts
	function getShortcuts(): ShortcutHandler[] {
		return [
			// Escape - clear selection and close drawers
			{
				key: 'Escape',
				action: () => {
					selectionStore.clearSelection();
					uiStore.closeLeftDrawer();
					uiStore.closeRightDrawer();
				}
			},

			// Delete / Backspace - delete selected item
			{
				key: 'Delete',
				action: () => ondelete?.()
			},
			{
				key: 'Backspace',
				action: () => ondelete?.()
			},

			// Arrow keys - device movement
			{
				key: 'ArrowUp',
				action: () => moveSelectedDevice(1)
			},
			{
				key: 'ArrowDown',
				action: () => moveSelectedDevice(-1)
			},

			// Arrow keys - rack reordering
			{
				key: 'ArrowLeft',
				action: () => moveSelectedRack(-1)
			},
			{
				key: 'ArrowRight',
				action: () => moveSelectedRack(1)
			},

			// D - toggle device palette
			{
				key: 'd',
				action: () => uiStore.toggleLeftDrawer()
			},

			// F - fit all
			{
				key: 'f',
				action: () => onfitall?.()
			},

			// Ctrl/Cmd+S - save
			{
				key: 's',
				ctrl: true,
				action: () => onsave?.()
			},
			{
				key: 's',
				meta: true,
				action: () => onsave?.()
			},

			// Ctrl/Cmd+O - load
			{
				key: 'o',
				ctrl: true,
				action: () => onload?.()
			},
			{
				key: 'o',
				meta: true,
				action: () => onload?.()
			},

			// Ctrl/Cmd+E - export
			{
				key: 'e',
				ctrl: true,
				action: () => onexport?.()
			},
			{
				key: 'e',
				meta: true,
				action: () => onexport?.()
			},

			// ? - show help
			{
				key: '?',
				action: () => onhelp?.()
			}
		];
	}

	/**
	 * Move the selected device up or down, leapfrogging over blocking devices
	 * @param direction - 1 for up (higher U), -1 for down (lower U)
	 */
	function moveSelectedDevice(direction: number) {
		if (!selectionStore.isDeviceSelected) return;
		if (selectionStore.selectedRackId === null || selectionStore.selectedDeviceIndex === null)
			return;

		const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedRackId);
		if (!rack) return;

		const placedDevice = rack.devices[selectionStore.selectedDeviceIndex];
		if (!placedDevice) return;

		const device = layoutStore.deviceLibrary.find((d) => d.id === placedDevice.libraryId);
		if (!device) return;

		// Try to find a valid position in the direction of movement
		let newPosition = placedDevice.position + direction;

		// Keep looking for a valid position, leapfrogging over blocking devices
		while (newPosition >= 1 && newPosition + device.height - 1 <= rack.height) {
			// Check if this position is valid (no collisions)
			const hasCollision = rack.devices.some((d, idx) => {
				if (idx === selectionStore.selectedDeviceIndex) return false; // Ignore self
				const otherDevice = layoutStore.deviceLibrary.find((dev) => dev.id === d.libraryId);
				if (!otherDevice) return false;

				const otherTop = d.position + otherDevice.height - 1;
				const otherBottom = d.position;
				const newTop = newPosition + device.height - 1;
				const newBottom = newPosition;

				// Check overlap
				return !(newTop < otherBottom || newBottom > otherTop);
			});

			if (!hasCollision) {
				// Found a valid position, move there
				layoutStore.moveDevice(
					selectionStore.selectedRackId!,
					selectionStore.selectedDeviceIndex!,
					newPosition
				);
				return;
			}

			// Position blocked, try next position in direction
			newPosition += direction;
		}

		// No valid position found in that direction
	}

	/**
	 * Move the selected rack left or right
	 * @param direction - -1 for left, 1 for right
	 */
	function moveSelectedRack(direction: number) {
		if (!selectionStore.isRackSelected || !selectionStore.selectedId) return;

		const rackIndex = layoutStore.racks.findIndex((r) => r.id === selectionStore.selectedId);
		if (rackIndex === -1) return;

		const newIndex = rackIndex + direction;
		if (newIndex < 0 || newIndex >= layoutStore.racks.length) return;

		layoutStore.reorderRacks(rackIndex, newIndex);
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Ignore if in input field
		if (shouldIgnoreKeyboard(event)) return;

		const shortcuts = getShortcuts();

		for (const shortcut of shortcuts) {
			if (matchesShortcut(event, shortcut)) {
				event.preventDefault();
				shortcut.action();
				return;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
