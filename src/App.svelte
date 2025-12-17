<!--
  Rackarr - Rack Layout Designer
  Main application component
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import AnimationDefs from '$lib/components/AnimationDefs.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import DevicePalette from '$lib/components/DevicePalette.svelte';
	import EditPanel from '$lib/components/EditPanel.svelte';
	import NewRackForm from '$lib/components/NewRackForm.svelte';
	import AddDeviceForm from '$lib/components/AddDeviceForm.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import KeyboardHandler from '$lib/components/KeyboardHandler.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import HelpPanel from '$lib/components/HelpPanel.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';
	import { getImageStore } from '$lib/stores/images.svelte';
	import { createKonamiDetector } from '$lib/utils/konami';
	import type { ImageData } from '$lib/types/images';
	import { openFilePicker } from '$lib/utils/file';
	import {
		downloadArchive,
		generateArchiveFilename,
		extractFolderArchive
	} from '$lib/utils/archive';
	import {
		generateExportSVG,
		exportAsSVG,
		exportAsPNG,
		exportAsJPEG,
		exportAsPDF,
		exportToCSV,
		downloadBlob,
		generateExportFilename
	} from '$lib/utils/export';
	import type { ExportOptions } from '$lib/types';
	import { analytics } from '$lib/utils/analytics';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();
	const canvasStore = getCanvasStore();
	const toastStore = getToastStore();
	const imageStore = getImageStore();

	// Dialog state
	let newRackFormOpen = $state(false);
	let addDeviceFormOpen = $state(false);
	let confirmDeleteOpen = $state(false);
	let exportDialogOpen = $state(false);
	let helpPanelOpen = $state(false);
	let deleteTarget: { type: 'rack' | 'device'; name: string } | null = $state(null);
	let showReplaceDialog = $state(false);
	let pendingSaveFirst = $state(false);

	// Party Mode easter egg (triggered by Konami code)
	let partyMode = $state(false);
	let partyModeTimeout: ReturnType<typeof setTimeout> | null = null;

	// Konami detector for party mode
	const konamiDetector = createKonamiDetector(() => {
		activatePartyMode();
	});

	function activatePartyMode() {
		// Check for reduced motion preference
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			toastStore.showToast('Party Mode disabled (reduced motion preference)', 'info');
			return;
		}

		// Clear existing timeout if party mode is re-triggered
		if (partyModeTimeout) {
			clearTimeout(partyModeTimeout);
		}

		partyMode = true;
		toastStore.showToast('Party Mode!', 'info', 3000);

		// Auto-disable after 5 seconds
		partyModeTimeout = setTimeout(() => {
			partyMode = false;
			partyModeTimeout = null;
		}, 5000);
	}

	// Auto-open new rack dialog when no racks exist (first-load experience)
	// Uses onMount to run once on initial load, not reactively
	onMount(() => {
		if (layoutStore.rackCount === 0) {
			newRackFormOpen = true;
		}
	});

	// Toolbar event handlers
	function handleNewRack() {
		if (layoutStore.rackCount > 0) {
			showReplaceDialog = true;
		} else {
			newRackFormOpen = true;
		}
	}

	function handleNewRackCreate(data: { name: string; height: number; width: number }) {
		layoutStore.addRack(data.name, data.height, data.width);
		newRackFormOpen = false;
	}

	function handleNewRackCancel() {
		newRackFormOpen = false;
	}

	// Replace dialog handlers (single-rack mode)
	async function handleSaveFirst() {
		showReplaceDialog = false;
		pendingSaveFirst = true;
		await handleSave();
	}

	function handleReplace() {
		showReplaceDialog = false;
		layoutStore.resetLayout();
		newRackFormOpen = true;
	}

	function handleCancelReplace() {
		showReplaceDialog = false;
	}

	async function handleSave() {
		try {
			// Get user images (exclude bundled images) for archive
			const images = imageStore.getUserImages();

			// Get the filename for the toast message
			const filename = generateArchiveFilename(layoutStore.layout);

			// Save as folder archive (.rackarr.zip)
			await downloadArchive(layoutStore.layout, images);
			layoutStore.markClean();
			toastStore.showToast(`Saved ${filename}`, 'success', 3000);

			// Track save event
			const deviceCount = layoutStore.rack?.devices.length ?? 0;
			analytics.trackSave(deviceCount);

			// After save, if pendingSaveFirst, reset and open new rack form
			if (pendingSaveFirst) {
				pendingSaveFirst = false;
				layoutStore.resetLayout();
				newRackFormOpen = true;
			}
		} catch (error) {
			console.error('Failed to save layout:', error);
			toastStore.showToast(
				error instanceof Error ? error.message : 'Failed to save layout',
				'error'
			);
		}
	}

	async function handleLoad() {
		try {
			const file = await openFilePicker();
			if (!file) {
				// User cancelled
				return;
			}

			// Load folder archive (.rackarr.zip)
			const { layout, images } = await extractFolderArchive(file);

			// Clear and restore images from archive
			imageStore.clearAllImages();
			for (const [deviceSlug, deviceImages] of images) {
				if (deviceImages.front) {
					imageStore.setDeviceImage(deviceSlug, 'front', deviceImages.front);
				}
				if (deviceImages.rear) {
					imageStore.setDeviceImage(deviceSlug, 'rear', deviceImages.rear);
				}
			}
			// Reload bundled images (they were cleared above but not saved in archives)
			imageStore.loadBundledImages();

			layoutStore.loadLayout(layout);
			layoutStore.markClean();
			selectionStore.clearSelection();

			// Reset view to center the loaded rack after DOM updates
			requestAnimationFrame(() => {
				canvasStore.fitAll(layoutStore.rack ? [layoutStore.rack] : []);
			});

			toastStore.showToast('Layout loaded successfully', 'success');

			// Track load event
			const deviceCount = layoutStore.rack?.devices.length ?? 0;
			analytics.trackLoad(deviceCount);
		} catch (error) {
			console.error('Failed to load layout:', error);
			toastStore.showToast(
				error instanceof Error ? error.message : 'Failed to load layout file',
				'error'
			);
		}
	}

	function handleExport() {
		if (!layoutStore.hasRack) {
			toastStore.showToast('No racks to export', 'warning');
			return;
		}
		exportDialogOpen = true;
	}

	async function handleExportSubmit(options: ExportOptions) {
		exportDialogOpen = false;

		try {
			// Single-rack mode: export the rack if it exists
			const racksToExport = layoutStore.rack ? [layoutStore.rack] : [];

			if (racksToExport.length === 0) {
				toastStore.showToast('No rack to export', 'warning');
				return;
			}

			// Add current display mode to export options
			const exportOptions = {
				...options,
				displayMode: uiStore.displayMode
			};

			// Generate the SVG with images if in image mode
			const images = imageStore.getAllImages();
			const svg = generateExportSVG(racksToExport, layoutStore.device_types, exportOptions, images);

			// Export based on selected format
			const exportViewOrDefault = options.exportView ?? 'both';
			if (options.format === 'svg') {
				const svgString = exportAsSVG(svg);
				const blob = new Blob([svgString], { type: 'image/svg+xml' });
				const filename = generateExportFilename(
					layoutStore.layout.name,
					exportViewOrDefault,
					options.format
				);
				downloadBlob(blob, filename);
				toastStore.showToast('SVG exported successfully', 'success');
				analytics.trackExportImage('svg', exportViewOrDefault);
			} else if (options.format === 'png') {
				const imageBlob = await exportAsPNG(svg);
				const filename = generateExportFilename(
					layoutStore.layout.name,
					exportViewOrDefault,
					options.format
				);
				downloadBlob(imageBlob, filename);
				toastStore.showToast('PNG exported successfully', 'success');
				analytics.trackExportImage('png', exportViewOrDefault);
			} else if (options.format === 'jpeg') {
				const imageBlob = await exportAsJPEG(svg);
				const filename = generateExportFilename(
					layoutStore.layout.name,
					exportViewOrDefault,
					options.format
				);
				downloadBlob(imageBlob, filename);
				toastStore.showToast('JPEG exported successfully', 'success');
				analytics.trackExportImage('jpeg', exportViewOrDefault);
			} else if (options.format === 'pdf') {
				const svgString = exportAsSVG(svg);
				const pdfBlob = await exportAsPDF(svgString, options.background);
				const filename = generateExportFilename(
					layoutStore.layout.name,
					exportViewOrDefault,
					options.format
				);
				downloadBlob(pdfBlob, filename);
				toastStore.showToast('PDF exported successfully', 'success');
				analytics.trackExportPDF(exportViewOrDefault);
			} else if (options.format === 'csv') {
				// CSV export uses null view (no view in filename)
				const csvContent = exportToCSV(racksToExport[0]!, layoutStore.device_types);
				const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
				const filename = generateExportFilename(layoutStore.layout.name, null, options.format);
				downloadBlob(blob, filename);
				toastStore.showToast('CSV exported successfully', 'success');
				analytics.trackExportCSV();
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
			// Single-rack mode
			const rack = layoutStore.rack;
			if (rack) {
				deleteTarget = { type: 'rack', name: rack.name };
				confirmDeleteOpen = true;
			}
		} else if (selectionStore.isDeviceSelected) {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				// Single-rack mode
				const rack = layoutStore.rack;
				if (rack && rack.devices[selectionStore.selectedDeviceIndex]) {
					const device = rack.devices[selectionStore.selectedDeviceIndex];
					const deviceDef = layoutStore.device_types.find((d) => d.slug === device?.device_type);
					deleteTarget = { type: 'device', name: deviceDef?.model ?? deviceDef?.slug ?? 'Device' };
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

	function handleFitAll() {
		canvasStore.fitAll(layoutStore.rack ? [layoutStore.rack] : []);
	}

	function handleToggleTheme() {
		uiStore.toggleTheme();
	}

	function handleToggleDisplayMode() {
		uiStore.toggleDisplayMode();
		// Sync with layout settings
		layoutStore.updateDisplayMode(uiStore.displayMode);
		// Also sync showLabelsOnImages for backward compatibility
		layoutStore.updateShowLabelsOnImages(uiStore.showLabelsOnImages);
		// Track display mode change
		analytics.trackDisplayModeToggle(uiStore.displayMode);
	}

	function handleToggleAirflowMode() {
		uiStore.toggleAirflowMode();
		// Track airflow view toggle
		analytics.trackAirflowView(uiStore.airflowMode);
	}

	function handleHelp() {
		helpPanelOpen = true;
	}

	function handleHelpClose() {
		helpPanelOpen = false;
	}

	function handleAddDevice() {
		addDeviceFormOpen = true;
	}

	function handleAddDeviceCreate(data: {
		name: string;
		height: number;
		category: import('$lib/types').DeviceCategory;
		colour: string;
		airflow: import('$lib/types').Airflow;
		notes: string;
		frontImage?: ImageData;
		rearImage?: ImageData;
	}) {
		const device = layoutStore.addDeviceType({
			name: data.name,
			u_height: data.height,
			category: data.category,
			colour: data.colour,
			comments: data.notes || undefined,
			airflow: data.airflow
		});

		// Store images if provided (v0.1.0)
		if (data.frontImage) {
			imageStore.setDeviceImage(device.slug, 'front', data.frontImage);
		}
		if (data.rearImage) {
			imageStore.setDeviceImage(device.slug, 'rear', data.rearImage);
		}

		// Track custom device creation
		analytics.trackCustomDeviceCreate(data.category);

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

		// Load bundled images for starter library devices
		imageStore.loadBundledImages();
	});
</script>

<svelte:window
	onbeforeunload={handleBeforeUnload}
	onkeydown={(e) => konamiDetector.handleKeyDown(e)}
/>

<div class="app-layout">
	<Toolbar
		hasSelection={selectionStore.hasSelection}
		hasRacks={layoutStore.hasRack}
		theme={uiStore.theme}
		displayMode={uiStore.displayMode}
		airflowMode={uiStore.airflowMode}
		{partyMode}
		onnewrack={handleNewRack}
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onfitall={handleFitAll}
		ontoggletheme={handleToggleTheme}
		ontoggledisplaymode={handleToggleDisplayMode}
		ontoggleairflowmode={handleToggleAirflowMode}
		onhelp={handleHelp}
	/>

	<main class="app-main">
		<Sidebar side="left">
			<DevicePalette onadddevice={handleAddDevice} />
		</Sidebar>

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

	<ConfirmReplaceDialog
		open={showReplaceDialog}
		onSaveFirst={handleSaveFirst}
		onReplace={handleReplace}
		onCancel={handleCancelReplace}
	/>

	<ExportDialog
		open={exportDialogOpen}
		racks={layoutStore.rack ? [layoutStore.rack] : []}
		deviceTypes={layoutStore.device_types}
		images={imageStore.getAllImages()}
		displayMode={uiStore.displayMode}
		layoutName={layoutStore.layout.name}
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
		ontoggledisplaymode={handleToggleDisplayMode}
	/>

	<!-- Global SVG gradient definitions for animations -->
	<AnimationDefs />
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
