<!--
  Rackarr - Rack Layout Designer
  Main application component
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import DevicePalette from '$lib/components/DevicePalette.svelte';
	import EditPanel from '$lib/components/EditPanel.svelte';
	import NewRackForm from '$lib/components/NewRackForm.svelte';
	import AddDeviceForm from '$lib/components/AddDeviceForm.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();

	// Dialog state
	let newRackFormOpen = $state(false);
	let addDeviceFormOpen = $state(false);

	// Toolbar event handlers
	function handleNewRack() {
		newRackFormOpen = true;
	}

	function handleNewRackCreate(data: { name: string; height: number }) {
		layoutStore.addRack(data.name, data.height);
		newRackFormOpen = false;
	}

	function handleNewRackCancel() {
		newRackFormOpen = false;
	}

	function handleTogglePalette() {
		uiStore.toggleLeftDrawer();
	}

	function handleSave() {
		// TODO: Implement in Phase 7
		console.log('Save clicked');
	}

	function handleLoad() {
		// TODO: Implement in Phase 7
		console.log('Load clicked');
	}

	function handleExport() {
		// TODO: Implement in Phase 9
		console.log('Export clicked');
	}

	function handleDelete() {
		if (selectionStore.isRackSelected && selectionStore.selectedId) {
			layoutStore.deleteRack(selectionStore.selectedId);
			selectionStore.clearSelection();
		} else if (selectionStore.isDeviceSelected) {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				layoutStore.removeDeviceFromRack(
					selectionStore.selectedRackId,
					selectionStore.selectedDeviceIndex
				);
				selectionStore.clearSelection();
			}
		}
	}

	function handleZoomIn() {
		uiStore.zoomIn();
	}

	function handleZoomOut() {
		uiStore.zoomOut();
	}

	function handleToggleTheme() {
		uiStore.toggleTheme();
	}

	function handleHelp() {
		// TODO: Implement in Phase 10
		console.log('Help clicked');
	}

	function handleClosePalette() {
		uiStore.closeLeftDrawer();
	}

	function handleAddDevice() {
		addDeviceFormOpen = true;
	}

	function handleAddDeviceCreate(data: {
		name: string;
		height: number;
		category: import('$lib/types').DeviceCategory;
		colour: string;
		notes: string;
	}) {
		layoutStore.addDeviceToLibrary({
			name: data.name,
			height: data.height,
			category: data.category,
			colour: data.colour,
			notes: data.notes || undefined
		});
		addDeviceFormOpen = false;
	}

	function handleAddDeviceCancel() {
		addDeviceFormOpen = false;
	}

	// Beforeunload handler for unsaved changes
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (layoutStore.isDirty) {
			event.preventDefault();
			// Modern browsers ignore custom messages, but we set it for legacy support
			event.returnValue = 'You have unsaved changes. Leave anyway?';
			return event.returnValue;
		}
	}

	onMount(() => {
		// Apply theme from storage (already done in ui store init)
		// Session restore will be implemented in a later phase
	});
</script>

<svelte:window onbeforeunload={handleBeforeUnload} />

<div class="app-layout">
	<Toolbar
		hasSelection={selectionStore.hasSelection}
		paletteOpen={uiStore.leftDrawerOpen}
		theme={uiStore.theme}
		zoom={uiStore.zoom}
		onnewrack={handleNewRack}
		ontogglepalette={handleTogglePalette}
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onzoomin={handleZoomIn}
		onzoomout={handleZoomOut}
		ontoggletheme={handleToggleTheme}
		onhelp={handleHelp}
	/>

	<main class="app-main">
		<Drawer
			side="left"
			open={uiStore.leftDrawerOpen}
			title="Device Palette"
			onclose={handleClosePalette}
		>
			<DevicePalette onadddevice={handleAddDevice} />
		</Drawer>

		<Canvas onnewrack={handleNewRack} />

		<EditPanel />
	</main>

	<NewRackForm
		open={newRackFormOpen}
		oncreate={handleNewRackCreate}
		oncancel={handleNewRackCancel}
	/>

	<AddDeviceForm
		open={addDeviceFormOpen}
		onadd={handleAddDeviceCreate}
		oncancel={handleAddDeviceCancel}
	/>
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.app-main {
		display: flex;
		flex: 1;
		position: relative;
		overflow: hidden;
	}
</style>
