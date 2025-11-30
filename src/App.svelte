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
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import KeyboardHandler from '$lib/components/KeyboardHandler.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import HelpPanel from '$lib/components/HelpPanel.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';
	import { downloadLayout, openFilePicker, readLayoutFile } from '$lib/utils/file';
	import {
		generateExportSVG,
		exportAsSVG,
		exportAsPNG,
		exportAsJPEG,
		downloadBlob,
		generateExportFilename
	} from '$lib/utils/export';
	import type { ExportOptions } from '$lib/types';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();
	const canvasStore = getCanvasStore();
	const toastStore = getToastStore();

	// Dialog state
	let newRackFormOpen = $state(false);
	let addDeviceFormOpen = $state(false);
	let confirmDeleteOpen = $state(false);
	let exportDialogOpen = $state(false);
	let helpPanelOpen = $state(false);
	let deleteTarget: { type: 'rack' | 'device'; name: string } | null = $state(null);

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
		downloadLayout(layoutStore.layout);
		layoutStore.markClean();
		toastStore.showToast('Layout saved', 'success', 3000);
	}

	async function handleLoad() {
		try {
			const file = await openFilePicker();
			if (!file) {
				// User cancelled
				return;
			}

			const loadedLayout = await readLayoutFile(file);
			layoutStore.loadLayout(loadedLayout);
			layoutStore.markClean();
			selectionStore.clearSelection();
			toastStore.showToast('Layout loaded successfully', 'success');
		} catch (error) {
			console.error('Failed to load layout:', error);
			toastStore.showToast(
				error instanceof Error ? error.message : 'Failed to load layout file',
				'error'
			);
		}
	}

	function handleExport() {
		if (layoutStore.racks.length === 0) {
			toastStore.showToast('No racks to export', 'warning');
			return;
		}
		exportDialogOpen = true;
	}

	async function handleExportSubmit(options: ExportOptions) {
		exportDialogOpen = false;

		try {
			// Determine which racks to export
			const racksToExport =
				options.scope === 'selected' && selectionStore.selectedId
					? layoutStore.racks.filter((r) => r.id === selectionStore.selectedId)
					: layoutStore.racks;

			// Generate the SVG
			const svg = generateExportSVG(racksToExport, layoutStore.deviceLibrary, options);

			// Generate filename
			const filename = generateExportFilename(layoutStore.layout.name, options.format);

			// Export based on format
			if (options.format === 'svg') {
				const svgString = exportAsSVG(svg);
				const blob = new Blob([svgString], { type: 'image/svg+xml' });
				downloadBlob(blob, filename);
				toastStore.showToast('SVG exported successfully', 'success');
			} else if (options.format === 'png') {
				const blob = await exportAsPNG(svg);
				downloadBlob(blob, filename);
				toastStore.showToast('PNG exported successfully', 'success');
			} else if (options.format === 'jpeg') {
				const blob = await exportAsJPEG(svg);
				downloadBlob(blob, filename);
				toastStore.showToast('JPEG exported successfully', 'success');
			} else if (options.format === 'pdf') {
				// PDF export will be implemented with jspdf library
				toastStore.showToast('PDF export not yet implemented', 'info');
			}
		} catch (error) {
			console.error('Export failed:', error);
			toastStore.showToast(error instanceof Error ? error.message : 'Export failed', 'error');
		}
	}

	function handleExportCancel() {
		exportDialogOpen = false;
	}

	function handleDelete() {
		if (selectionStore.isRackSelected && selectionStore.selectedId) {
			const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedId);
			if (rack) {
				deleteTarget = { type: 'rack', name: rack.name };
				confirmDeleteOpen = true;
			}
		} else if (selectionStore.isDeviceSelected) {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedRackId);
				if (rack && rack.devices[selectionStore.selectedDeviceIndex]) {
					const device = rack.devices[selectionStore.selectedDeviceIndex];
					const deviceDef = layoutStore.deviceLibrary.find((d) => d.id === device?.libraryId);
					deleteTarget = { type: 'device', name: deviceDef?.name || 'Device' };
					confirmDeleteOpen = true;
				}
			}
		}
	}

	function handleConfirmDelete() {
		if (deleteTarget?.type === 'rack' && selectionStore.selectedId) {
			layoutStore.deleteRack(selectionStore.selectedId);
			selectionStore.clearSelection();
		} else if (deleteTarget?.type === 'device') {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				layoutStore.removeDeviceFromRack(
					selectionStore.selectedRackId,
					selectionStore.selectedDeviceIndex
				);
				selectionStore.clearSelection();
			}
		}
		confirmDeleteOpen = false;
		deleteTarget = null;
	}

	function handleCancelDelete() {
		confirmDeleteOpen = false;
		deleteTarget = null;
	}

	function handleZoomIn() {
		canvasStore.zoomIn();
	}

	function handleZoomOut() {
		canvasStore.zoomOut();
	}

	function handleFitAll() {
		canvasStore.fitAll(layoutStore.racks);
	}

	function handleToggleTheme() {
		uiStore.toggleTheme();
	}

	function handleHelp() {
		helpPanelOpen = true;
	}

	function handleHelpClose() {
		helpPanelOpen = false;
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
		onnewrack={handleNewRack}
		ontogglepalette={handleTogglePalette}
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onzoomin={handleZoomIn}
		onzoomout={handleZoomOut}
		onfitall={handleFitAll}
		ontoggletheme={handleToggleTheme}
		onhelp={handleHelp}
	/>

	<main class="app-main">
		<Drawer
			id="device-library-drawer"
			side="left"
			open={uiStore.leftDrawerOpen}
			title="Device Library"
			showClose={false}
			showHeader={false}
			onclose={handleClosePalette}
		>
			<DevicePalette onadddevice={handleAddDevice} />
		</Drawer>

		<Canvas onnewrack={handleNewRack} onload={handleLoad} />

		<EditPanel />
	</main>

	<NewRackForm
		open={newRackFormOpen}
		rackCount={layoutStore.rackCount}
		oncreate={handleNewRackCreate}
		oncancel={handleNewRackCancel}
	/>

	<AddDeviceForm
		open={addDeviceFormOpen}
		onadd={handleAddDeviceCreate}
		oncancel={handleAddDeviceCancel}
	/>

	<ConfirmDialog
		open={confirmDeleteOpen}
		title={deleteTarget?.type === 'rack' ? 'Delete Rack' : 'Remove Device'}
		message={deleteTarget?.type === 'rack'
			? `Are you sure you want to delete "${deleteTarget?.name}"? All devices in this rack will be removed.`
			: `Are you sure you want to remove "${deleteTarget?.name}" from this rack?`}
		confirmLabel={deleteTarget?.type === 'rack' ? 'Delete Rack' : 'Remove'}
		onconfirm={handleConfirmDelete}
		oncancel={handleCancelDelete}
	/>

	<ExportDialog
		open={exportDialogOpen}
		racks={layoutStore.racks}
		selectedRackId={selectionStore.isRackSelected ? selectionStore.selectedId : null}
		onexport={(e) => handleExportSubmit(e.detail)}
		oncancel={handleExportCancel}
	/>

	<HelpPanel open={helpPanelOpen} onclose={handleHelpClose} />

	<ToastContainer />

	<KeyboardHandler
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onfitall={handleFitAll}
		onhelp={handleHelp}
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
