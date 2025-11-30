---
created: 2025-11-30
updated: 2025-11-30
status: ready
type: implementation-spec
---

# Rackarr — Design Review Implementation Spec

**Purpose:** Actionable specification for implementing design methodology recommendations in the current codebase.

**Audience:** Developers implementing UI/UX improvements

**Reference:** [[design-methodology|Design Methodology & UX Guidelines]]

---

## Executive Summary

This document translates the design methodology into concrete implementation tasks. It audits the current codebase against established UX patterns and provides specific file locations, code changes, and CSS updates needed.

**Priority Levels:**

- **P0 (Critical):** Blocking usability issues
- **P1 (High):** Significant UX improvements
- **P2 (Medium):** Polish and refinement
- **P3 (Low):** Nice-to-have enhancements

---

## 1. Drag Affordance Implementation

**Priority:** P0 (Critical)
**Methodology Reference:** Section 12.2 — Visual Affordance for Draggable Elements

### Current State

The Device Library items lack visual indicators that they are draggable. Users cannot discover drag-and-drop without visual cues.

**Affected Files:**

- `src/lib/components/DevicePaletteItem.svelte`
- `src/lib/components/DevicePalette.svelte`
- `src/app.css`

### Implementation Tasks

#### 1.1 Add Drag Handle Icon

**File:** `src/lib/components/DevicePaletteItem.svelte`

Add a six-dot grip icon to the left of each device item:

```svelte
<script lang="ts">
	// Add to existing imports
	import IconGrip from './icons/IconGrip.svelte';
</script>

<div
	class="device-palette-item"
	draggable="true"
	on:dragstart={handleDragStart}
	role="option"
	tabindex="0"
>
	<span class="drag-handle" aria-hidden="true">
		<IconGrip size={16} />
	</span>
	<span class="category-indicator" style="background-color: {device.colour}"></span>
	<span class="device-name">{device.name}</span>
	<span class="device-height">{device.height}U</span>
</div>
```

#### 1.2 Create Grip Icon Component

**File:** `src/lib/components/icons/IconGrip.svelte` (new file)

```svelte
<script lang="ts">
	export let size = 16;
</script>

<svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
	<circle cx="5" cy="3" r="1.5" />
	<circle cx="11" cy="3" r="1.5" />
	<circle cx="5" cy="8" r="1.5" />
	<circle cx="11" cy="8" r="1.5" />
	<circle cx="5" cy="13" r="1.5" />
	<circle cx="11" cy="13" r="1.5" />
</svg>
```

#### 1.3 Add Hover States for Draggable Items

**File:** `src/app.css` (add to existing styles)

```css
/* Drag Affordance Styles */
.device-palette-item {
	display: flex;
	align-items: center;
	gap: var(--space-2, 8px);
	padding: var(--space-2, 8px) var(--space-3, 12px);
	border-radius: 4px;
	cursor: grab;
	transition:
		transform var(--transition-fast, 100ms) ease-out,
		box-shadow var(--transition-fast, 100ms) ease-out,
		background-color var(--transition-fast, 100ms) ease-out;
}

.device-palette-item:hover {
	background-color: var(--colour-surface-hover, rgba(255, 255, 255, 0.05));
	transform: translateY(-1px);
	box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.2));
}

.device-palette-item:active,
.device-palette-item.dragging {
	cursor: grabbing;
	transform: translateY(-2px) scale(1.02);
	box-shadow: var(--shadow-drag, 0 8px 16px rgba(0, 0, 0, 0.3));
	z-index: 100;
}

.device-palette-item .drag-handle {
	color: var(--colour-text-muted, #6b7280);
	opacity: 0.5;
	transition: opacity var(--transition-fast, 100ms) ease-out;
}

.device-palette-item:hover .drag-handle {
	opacity: 1;
}

/* Category indicator as left border accent */
.device-palette-item .category-indicator {
	width: 4px;
	height: 100%;
	min-height: 24px;
	border-radius: 2px;
	flex-shrink: 0;
}

/* Height badge as pill */
.device-palette-item .device-height {
	background-color: var(--colour-surface-raised, rgba(255, 255, 255, 0.1));
	padding: 2px 8px;
	border-radius: 9999px;
	font-size: var(--font-size-xs, 11px);
	font-weight: var(--font-weight-medium, 500);
	margin-left: auto;
}
```

#### 1.4 Export Icon from Index

**File:** `src/lib/components/icons/index.ts`

```typescript
// Add to existing exports
export { default as IconGrip } from './IconGrip.svelte';
```

### Acceptance Criteria

- [ ] Each device library item displays a 6-dot grip handle on the left
- [ ] Cursor changes to `grab` on hover, `grabbing` during drag
- [ ] Items lift slightly on hover with subtle shadow
- [ ] Items scale up slightly when grabbed
- [ ] Grip handle becomes more visible on hover

---

## 2. Drop Zone Visual Feedback

**Priority:** P0 (Critical)
**Methodology Reference:** Section 12.4 — Drop Zone Design

### Current State

Empty U slots in racks have no visual indication during drag operations. Users cannot easily see where devices will land.

**Affected Files:**

- `src/lib/components/Rack.svelte`
- `src/lib/components/RackDevice.svelte`
- `src/app.css`

### Implementation Tasks

#### 2.1 Add Drop Zone Preview During Drag

**File:** `src/lib/components/Rack.svelte`

Update the rack rendering to show drop zone previews:

```svelte
<script lang="ts">
	// Add to existing state
	let dragOverPosition: number | null = $state(null);
	let dragDeviceHeight: number = $state(1);
	let isDragValid: boolean = $state(true);

	function handleDragOver(event: DragEvent, uPosition: number) {
		event.preventDefault();
		const dragData = getDragData(event);
		if (dragData) {
			dragOverPosition = uPosition;
			dragDeviceHeight = dragData.deviceHeight;
			isDragValid = canPlaceAt(uPosition, dragDeviceHeight);
		}
	}

	function handleDragLeave() {
		dragOverPosition = null;
	}
</script>

<!-- In the SVG rendering, add drop zone highlights -->
{#each Array(rack.height) as _, i}
	{@const uPosition = rack.height - i}
	{@const isDropTarget =
		dragOverPosition !== null &&
		uPosition >= dragOverPosition &&
		uPosition < dragOverPosition + dragDeviceHeight}

	<rect
		class="u-slot"
		class:drop-target={isDropTarget}
		class:drop-valid={isDropTarget && isDragValid}
		class:drop-invalid={isDropTarget && !isDragValid}
		x={RAIL_WIDTH}
		y={i * uHeight}
		width={rackWidth - RAIL_WIDTH * 2}
		height={uHeight}
		on:dragover={(e) => handleDragOver(e, uPosition)}
		on:dragleave={handleDragLeave}
	/>
{/each}
```

#### 2.2 Add Drop Zone CSS

**File:** `src/app.css`

```css
/* Drop Zone Styles */
.u-slot {
	fill: transparent;
	stroke: var(--colour-rack-grid, rgba(255, 255, 255, 0.1));
	stroke-width: 0.5;
	transition: fill var(--transition-fast, 100ms) ease-out;
}

.u-slot:hover:not(.occupied) {
	fill: rgba(255, 255, 255, 0.03);
}

.u-slot.drop-target.drop-valid {
	fill: var(--colour-dnd-valid-bg, rgba(59, 130, 246, 0.2));
	stroke: var(--colour-dnd-valid, #3b82f6);
	stroke-width: 2;
}

.u-slot.drop-target.drop-invalid {
	fill: var(--colour-dnd-invalid-bg, rgba(239, 68, 68, 0.2));
	stroke: var(--colour-dnd-invalid, #ef4444);
	stroke-width: 2;
	cursor: no-drop;
}

/* Ghost preview outline */
.drop-preview {
	fill: none;
	stroke: var(--colour-dnd-valid, #3b82f6);
	stroke-width: 2;
	stroke-dasharray: 4 2;
	pointer-events: none;
	opacity: 0.8;
}
```

#### 2.3 Add Ghost Preview Rectangle

**File:** `src/lib/components/Rack.svelte`

Add a ghost preview showing where the device will land:

```svelte
<!-- Add after U slots, before devices -->
{#if dragOverPosition !== null && isDragValid}
	<rect
		class="drop-preview"
		x={RAIL_WIDTH + 2}
		y={(rack.height - dragOverPosition - dragDeviceHeight + 1) * uHeight}
		width={rackWidth - RAIL_WIDTH * 2 - 4}
		height={dragDeviceHeight * uHeight}
		rx="2"
	/>
{/if}
```

### Acceptance Criteria

- [ ] Empty U slots have subtle visual distinction
- [ ] When dragging a device, target U positions highlight in blue
- [ ] Multi-U devices highlight ALL affected slots
- [ ] Occupied/invalid slots highlight in red with `no-drop` cursor
- [ ] Ghost outline shows exact landing position before drop

---

## 3. Interaction State Matrix

**Priority:** P1 (High)
**Methodology Reference:** Section 12.3 — Interaction State Matrix

### Current State

Some interactive elements are missing complete state coverage. All states must be explicitly designed and implemented.

### Implementation Tasks

#### 3.1 Toolbar Button States

**File:** `src/lib/components/ToolbarButton.svelte`

Ensure all states are covered:

```svelte
<script lang="ts">
	export let icon: typeof SvelteComponent;
	export let label: string;
	export let disabled = false;
	export let active = false;
	export let tooltip: string;
</script>

<button
	class="toolbar-button"
	class:active
	{disabled}
	aria-label={tooltip}
	title={tooltip}
	on:click
>
	<svelte:component this={icon} size={20} />
	{#if label}
		<span class="label">{label}</span>
	{/if}
</button>
```

**File:** `src/app.css`

```css
/* Toolbar Button States */
.toolbar-button {
	display: inline-flex;
	align-items: center;
	gap: var(--space-2, 8px);
	padding: var(--space-2, 8px) var(--space-3, 12px);
	border: none;
	border-radius: 6px;
	background: transparent;
	color: var(--colour-text, #e4e4e7);
	cursor: pointer;
	transition:
		background-color var(--transition-fast, 100ms) ease-out,
		color var(--transition-fast, 100ms) ease-out,
		transform var(--transition-fast, 100ms) ease-out;
}

/* Hover state */
.toolbar-button:hover:not(:disabled) {
	background-color: var(--colour-surface-hover, rgba(255, 255, 255, 0.1));
}

/* Focus state - CRITICAL for accessibility */
.toolbar-button:focus-visible {
	outline: none;
	box-shadow:
		0 0 0 2px var(--colour-bg),
		0 0 0 4px var(--colour-selection, #3b82f6);
}

/* Active/pressed state */
.toolbar-button:active:not(:disabled) {
	transform: scale(0.97);
	background-color: var(--colour-surface-active, rgba(255, 255, 255, 0.15));
}

/* Toggle active state */
.toolbar-button.active {
	background-color: color-mix(in srgb, var(--colour-selection, #3b82f6) 20%, transparent);
	color: var(--colour-selection, #3b82f6);
}

/* Disabled state */
.toolbar-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
```

#### 3.2 Edit Panel Input States

**File:** `src/app.css`

```css
/* Form Input States */
.input-field {
	width: 100%;
	padding: var(--space-2, 8px) var(--space-3, 12px);
	border: 1px solid var(--colour-border, #3f3f5a);
	border-radius: 6px;
	background-color: var(--colour-surface, #1f1f38);
	color: var(--colour-text, #e4e4e7);
	font-size: var(--font-size-base, 14px);
	transition:
		border-color var(--transition-fast, 100ms) ease-out,
		box-shadow var(--transition-fast, 100ms) ease-out;
}

/* Hover state */
.input-field:hover:not(:disabled):not(:focus) {
	border-color: var(--colour-border-hover, #52527a);
}

/* Focus state */
.input-field:focus {
	outline: none;
	border-color: var(--colour-selection, #3b82f6);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--colour-selection) 25%, transparent);
}

/* Invalid state */
.input-field:invalid,
.input-field.error {
	border-color: var(--colour-error, #ef4444);
}

.input-field:invalid:focus,
.input-field.error:focus {
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--colour-error) 25%, transparent);
}

/* Disabled state */
.input-field:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	background-color: var(--colour-surface-muted, rgba(255, 255, 255, 0.02));
}

/* Error message */
.input-error {
	color: var(--colour-error, #ef4444);
	font-size: var(--font-size-xs, 12px);
	margin-top: var(--space-1, 4px);
}
```

#### 3.3 Selection State Styling

**File:** `src/lib/components/Rack.svelte`

Add clear selection indicator:

```css
/* Rack Selection State */
.rack-container.selected {
	outline: 2px solid var(--colour-selection, #3b82f6);
	outline-offset: 4px;
}

.rack-container.selected .rack-header {
	background-color: color-mix(in srgb, var(--colour-selection) 10%, transparent);
}
```

**File:** `src/lib/components/RackDevice.svelte`

```css
/* Device Selection State */
.rack-device.selected {
	outline: 2px solid var(--colour-selection, #3b82f6);
	outline-offset: 1px;
}

.rack-device.selected::after {
	content: '';
	position: absolute;
	inset: -4px;
	border: 2px solid var(--colour-selection, #3b82f6);
	border-radius: 4px;
	pointer-events: none;
	animation: selection-pulse 2s ease-in-out infinite;
}

@keyframes selection-pulse {
	0%,
	100% {
		opacity: 0.5;
	}
	50% {
		opacity: 1;
	}
}
```

### Acceptance Criteria

- [ ] All toolbar buttons have: rest, hover, focus, active, disabled states
- [ ] All inputs have: rest, hover, focus, invalid, disabled states
- [ ] Selected rack has clear blue outline
- [ ] Selected device has prominent selection indicator
- [ ] Focus states are visible and meet WCAG 2.4.7

---

## 4. Tooltips for Toolbar

**Priority:** P1 (High)
**Methodology Reference:** Section 12.6 — Toolbar Design

### Current State

Toolbar icons lack tooltips, making it difficult for users to discover functionality.

**Affected Files:**

- `src/lib/components/Toolbar.svelte`
- `src/lib/components/ToolbarButton.svelte`

### Implementation Tasks

#### 4.1 Create Tooltip Component

**File:** `src/lib/components/Tooltip.svelte` (new file)

```svelte
<script lang="ts">
	export let text: string;
	export let shortcut: string = '';
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

	let visible = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	function show() {
		timeout = setTimeout(() => (visible = true), 500);
	}

	function hide() {
		clearTimeout(timeout);
		visible = false;
	}
</script>

<div
	class="tooltip-wrapper"
	on:mouseenter={show}
	on:mouseleave={hide}
	on:focus={show}
	on:blur={hide}
>
	<slot />

	{#if visible}
		<div class="tooltip tooltip-{position}" role="tooltip">
			<span class="tooltip-text">{text}</span>
			{#if shortcut}
				<kbd class="tooltip-shortcut">{shortcut}</kbd>
			{/if}
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-flex;
	}

	.tooltip {
		position: absolute;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background-color: var(--colour-surface-raised, #2a2a4a);
		border: 1px solid var(--colour-border, #3f3f5a);
		border-radius: 6px;
		box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.3));
		white-space: nowrap;
		pointer-events: none;
		animation: tooltip-fade-in 150ms ease-out;
	}

	.tooltip-bottom {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 8px;
	}

	.tooltip-text {
		font-size: var(--font-size-sm, 13px);
		color: var(--colour-text, #e4e4e7);
	}

	.tooltip-shortcut {
		font-size: var(--font-size-xs, 11px);
		font-family: var(--font-mono, monospace);
		padding: 2px 6px;
		background-color: var(--colour-surface, #1f1f38);
		border-radius: 4px;
		color: var(--colour-text-muted, #a1a1aa);
	}

	@keyframes tooltip-fade-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
```

#### 4.2 Add Tooltips to Toolbar

**File:** `src/lib/components/Toolbar.svelte`

```svelte
<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	// ... existing imports
</script>

<div class="toolbar" role="toolbar" aria-label="Main toolbar">
	<!-- Device Library Toggle -->
	<Tooltip text="Device Library" shortcut="D">
		<ToolbarButton
			icon={IconPalette}
			label="Device Library"
			active={$leftDrawerOpen}
			on:click={toggleLeftDrawer}
		/>
	</Tooltip>

	<div class="toolbar-divider" role="separator"></div>

	<!-- File Operations -->
	<Tooltip text="New Rack" shortcut="N">
		<ToolbarButton icon={IconPlus} on:click={openNewRackForm} />
	</Tooltip>

	<Tooltip text="Save Layout" shortcut="Ctrl+S">
		<ToolbarButton icon={IconSave} on:click={saveLayout} />
	</Tooltip>

	<Tooltip text="Export Image" shortcut="Ctrl+E">
		<ToolbarButton icon={IconExport} on:click={openExportDialog} />
	</Tooltip>

	<Tooltip text="Load Layout" shortcut="Ctrl+O">
		<ToolbarButton icon={IconLoad} on:click={loadLayout} />
	</Tooltip>

	<Tooltip text="Delete Selected" shortcut="Del">
		<ToolbarButton icon={IconTrash} disabled={!$hasSelection} on:click={deleteSelected} />
	</Tooltip>

	<div class="toolbar-divider" role="separator"></div>

	<!-- Zoom Controls -->
	<Tooltip text="Zoom Out" shortcut="-">
		<ToolbarButton icon={IconZoomOut} disabled={!$canZoomOut} on:click={zoomOut} />
	</Tooltip>

	<span class="zoom-display">{Math.round($zoom * 100)}%</span>

	<Tooltip text="Zoom In" shortcut="+">
		<ToolbarButton icon={IconZoomIn} disabled={!$canZoomIn} on:click={zoomIn} />
	</Tooltip>

	<Tooltip text="Fit All Racks" shortcut="F">
		<ToolbarButton icon={IconFitAll} on:click={fitAll} />
	</Tooltip>

	<div class="toolbar-divider" role="separator"></div>

	<!-- Settings -->
	<Tooltip text="Toggle Theme">
		<ToolbarButton icon={$theme === 'dark' ? IconSun : IconMoon} on:click={toggleTheme} />
	</Tooltip>

	<Tooltip text="Help & Shortcuts" shortcut="?">
		<ToolbarButton icon={IconHelp} on:click={openHelp} />
	</Tooltip>
</div>
```

#### 4.3 Add Toolbar Divider Styles

**File:** `src/app.css`

```css
/* Toolbar Layout */
.toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-1, 4px);
	padding: 0 var(--space-3, 12px);
	height: var(--toolbar-height, 52px);
	background-color: var(--colour-surface, #1f1f38);
	border-bottom: 1px solid var(--colour-border, #3f3f5a);
}

.toolbar-divider {
	width: 1px;
	height: 24px;
	background-color: var(--colour-border, #3f3f5a);
	margin: 0 var(--space-2, 8px);
}

.zoom-display {
	min-width: 48px;
	text-align: center;
	font-size: var(--font-size-sm, 13px);
	font-variant-numeric: tabular-nums;
	color: var(--colour-text-muted, #a1a1aa);
}
```

### Acceptance Criteria

- [ ] Every toolbar icon has a tooltip
- [ ] Tooltips appear after 500ms hover delay
- [ ] Tooltips show keyboard shortcut where applicable
- [ ] Tooltips have consistent styling
- [ ] Toolbar has logical visual groupings with dividers

---

## 5. Edit Panel Improvements

**Priority:** P2 (Medium)
**Methodology Reference:** Section 13.3 — Edit Panel Analysis

### Current State

The Edit Panel lacks visual hierarchy and contextual titles.

**Affected Files:**

- `src/lib/components/EditPanel.svelte`

### Implementation Tasks

#### 5.1 Add Contextual Title

**File:** `src/lib/components/EditPanel.svelte`

```svelte
<script lang="ts">
	// Existing imports...

	let title = $derived(() => {
		if ($selectedType === 'rack') {
			const rack = $racks.find((r) => r.id === $selectedId);
			return `Edit: ${rack?.name ?? 'Rack'}`;
		}
		if ($selectedType === 'device') {
			const device = getSelectedDevice();
			return `Edit: ${device?.name ?? 'Device'}`;
		}
		return 'Edit';
	});
</script>

<DrawerHeader {title} on:close={clearSelection} />
```

#### 5.2 Add Section Grouping

**File:** `src/lib/components/EditPanel.svelte`

```svelte
<div class="edit-panel">
	<DrawerHeader {title} on:close={clearSelection} />

	<div class="edit-panel-content">
		{#if $selectedType === 'rack'}
			<!-- Properties Section -->
			<section class="edit-section">
				<h3 class="edit-section-title">Properties</h3>

				<div class="form-group">
					<label for="rack-name">Name</label>
					<input
						id="rack-name"
						class="input-field"
						type="text"
						bind:value={rackName}
						on:change={updateRackName}
					/>
				</div>

				<div class="form-group">
					<label for="rack-height">Height</label>
					<div class="height-input-group">
						<input
							id="rack-height"
							class="input-field"
							type="number"
							min="1"
							max="100"
							bind:value={rackHeight}
							disabled={hasDevices}
						/>
						<span class="input-suffix">U</span>
					</div>
					{#if hasDevices}
						<p class="input-hint">Remove devices to change height</p>
					{/if}
				</div>

				<div class="preset-buttons">
					{#each [12, 18, 24, 42] as preset}
						<button
							class="preset-button"
							class:active={rackHeight === preset}
							disabled={hasDevices}
							on:click={() => setRackHeight(preset)}
						>
							{preset}U
						</button>
					{/each}
				</div>
			</section>

			<!-- Information Section -->
			<section class="edit-section">
				<h3 class="edit-section-title">Information</h3>

				<dl class="info-list">
					<div class="info-item">
						<dt>Position</dt>
						<dd>{rackPosition + 1} of {$rackCount}</dd>
					</div>
					<div class="info-item">
						<dt>Devices</dt>
						<dd>{deviceCount}</dd>
					</div>
					<div class="info-item">
						<dt>Capacity</dt>
						<dd>{freeUs}U free of {rackHeight}U</dd>
					</div>
				</dl>
			</section>

			<!-- Danger Zone -->
			<section class="edit-section edit-section-danger">
				<button class="button-destructive" on:click={confirmDeleteRack}>
					<IconTrash size={16} />
					Delete Rack
				</button>
			</section>
		{/if}

		<!-- Device editing similar structure... -->
	</div>
</div>
```

#### 5.3 Edit Panel Styles

**File:** `src/app.css`

```css
/* Edit Panel Structure */
.edit-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.edit-panel-content {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-4, 16px);
}

/* Sections */
.edit-section {
	padding-bottom: var(--space-4, 16px);
	margin-bottom: var(--space-4, 16px);
	border-bottom: 1px solid var(--colour-border, #3f3f5a);
}

.edit-section:last-child {
	border-bottom: none;
	margin-bottom: 0;
}

.edit-section-title {
	font-size: var(--font-size-xs, 11px);
	font-weight: var(--font-weight-semibold, 600);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: var(--colour-text-muted, #a1a1aa);
	margin-bottom: var(--space-3, 12px);
}

/* Form Groups */
.form-group {
	margin-bottom: var(--space-3, 12px);
}

.form-group label {
	display: block;
	font-size: var(--font-size-sm, 13px);
	font-weight: var(--font-weight-medium, 500);
	margin-bottom: var(--space-1, 4px);
}

.input-hint {
	font-size: var(--font-size-xs, 11px);
	color: var(--colour-text-muted, #a1a1aa);
	margin-top: var(--space-1, 4px);
}

/* Height Input Group */
.height-input-group {
	display: flex;
	align-items: center;
	gap: var(--space-2, 8px);
}

.height-input-group .input-field {
	width: 80px;
}

.input-suffix {
	color: var(--colour-text-muted, #a1a1aa);
}

/* Preset Buttons */
.preset-buttons {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: var(--space-2, 8px);
	margin-top: var(--space-2, 8px);
}

.preset-button {
	padding: var(--space-2, 8px);
	border: 1px solid var(--colour-border, #3f3f5a);
	border-radius: 6px;
	background: transparent;
	color: var(--colour-text, #e4e4e7);
	font-size: var(--font-size-sm, 13px);
	cursor: pointer;
	transition: all var(--transition-fast, 100ms) ease-out;
}

.preset-button:hover:not(:disabled) {
	border-color: var(--colour-selection, #3b82f6);
	background-color: color-mix(in srgb, var(--colour-selection) 10%, transparent);
}

.preset-button.active {
	border-color: var(--colour-selection, #3b82f6);
	background-color: color-mix(in srgb, var(--colour-selection) 20%, transparent);
	color: var(--colour-selection, #3b82f6);
}

.preset-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Info List */
.info-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-2, 8px);
}

.info-item {
	display: flex;
	justify-content: space-between;
	font-size: var(--font-size-sm, 13px);
}

.info-item dt {
	color: var(--colour-text-muted, #a1a1aa);
}

.info-item dd {
	color: var(--colour-text, #e4e4e7);
	font-weight: var(--font-weight-medium, 500);
}

/* Danger Zone */
.edit-section-danger {
	margin-top: auto;
	padding-top: var(--space-4, 16px);
	border-top: 1px solid var(--colour-error, #ef4444);
	border-bottom: none;
}

.button-destructive {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-2, 8px);
	width: 100%;
	padding: var(--space-3, 12px);
	border: 1px solid var(--colour-error, #ef4444);
	border-radius: 6px;
	background: transparent;
	color: var(--colour-error, #ef4444);
	font-size: var(--font-size-sm, 14px);
	font-weight: var(--font-weight-medium, 500);
	cursor: pointer;
	transition: all var(--transition-fast, 100ms) ease-out;
}

.button-destructive:hover {
	background-color: var(--colour-error, #ef4444);
	color: white;
}
```

### Acceptance Criteria

- [ ] Edit panel title shows "Edit: [Item Name]"
- [ ] Properties grouped with clear section headers
- [ ] Preset buttons in even grid layout
- [ ] Information section shows capacity stats
- [ ] Delete button visually separated in "danger zone"

---

## 6. Rack Visual Enhancements

**Priority:** P2 (Medium)
**Methodology Reference:** Section 13.2 — Canvas Analysis

### Implementation Tasks

#### 6.1 Add Alternating Row Shading

**File:** `src/lib/components/Rack.svelte`

```svelte
{#each Array(rack.height) as _, i}
	{@const uPosition = rack.height - i}
	{@const isEven = uPosition % 2 === 0}

	<rect
		class="u-slot-bg"
		class:even={isEven}
		x={RAIL_WIDTH}
		y={i * uHeight}
		width={rackWidth - RAIL_WIDTH * 2}
		height={uHeight}
	/>
{/each}
```

**CSS:**

```css
.u-slot-bg {
	fill: var(--colour-rack-slot, rgba(255, 255, 255, 0.02));
}

.u-slot-bg.even {
	fill: var(--colour-rack-slot-alt, rgba(255, 255, 255, 0.04));
}
```

#### 6.2 Improve U Number Visibility

```css
.u-number {
	font-size: var(--font-size-u-number, 10px);
	font-family: var(--font-mono, monospace);
	font-variant-numeric: tabular-nums;
	fill: var(--colour-text-muted, #6b7280);
	user-select: none;
}

/* Highlight every 5th U */
.u-number.highlight {
	font-weight: var(--font-weight-semibold, 600);
	fill: var(--colour-text, #e4e4e7);
}
```

#### 6.3 Add Rack Title Above (v0.2 alignment)

Per v0.2 spec, rack title should be above the rack:

```svelte
<!-- Rack title - ABOVE the rack -->
<text class="rack-title" x={rackWidth / 2} y={-12} text-anchor="middle">
	{rack.name}
</text>
```

### Acceptance Criteria

- [ ] U slots have subtle alternating shading
- [ ] Every 5th U number is visually highlighted
- [ ] Rack title positioned above rack
- [ ] Interior has slightly lighter background than canvas

---

## 7. Animation & Motion

**Priority:** P2 (Medium)
**Methodology Reference:** Section 8.3 — Animation Guidelines

### Implementation Tasks

#### 7.1 Add CSS Animations

**File:** `src/app.css`

```css
/* Animation Timing */
:root {
	--duration-instant: 0ms;
	--duration-fast: 100ms;
	--duration-normal: 200ms;
	--duration-slow: 300ms;

	--ease-out: cubic-bezier(0, 0, 0.2, 1);
	--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
	--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Device Drop Animation */
@keyframes device-settle {
	0% {
		transform: scale(1.05);
		opacity: 0.8;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.device-just-dropped {
	animation: device-settle var(--duration-normal) var(--ease-spring);
}

/* Drawer Slide Animation */
@keyframes drawer-slide-in {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(0);
	}
}

@keyframes drawer-slide-in-right {
	from {
		transform: translateX(100%);
	}
	to {
		transform: translateX(0);
	}
}

.drawer-left {
	animation: drawer-slide-in var(--duration-normal) var(--ease-out);
}

.drawer-right {
	animation: drawer-slide-in-right var(--duration-normal) var(--ease-out);
}

/* Toast Animation */
@keyframes toast-slide-up {
	from {
		transform: translateY(100%);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.toast {
	animation: toast-slide-up var(--duration-normal) var(--ease-out);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
	}
}
```

### Acceptance Criteria

- [ ] Devices have settle animation on drop
- [ ] Drawers slide in/out smoothly
- [ ] Toasts animate in from bottom
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Animation durations are consistent (100-200ms)

---

## 8. Accessibility Audit

**Priority:** P1 (High)
**Methodology Reference:** Section 6 — Accessibility Guidelines

### Implementation Tasks

#### 8.1 ARIA Labels Audit

Check and fix all interactive elements:

**File:** `src/lib/components/Toolbar.svelte`

```svelte
<!-- Every icon button needs aria-label -->
<button aria-label="Add new rack">
	<IconPlus />
</button>
```

#### 8.2 Focus Management

**File:** `src/lib/components/Dialog.svelte`

```svelte
<script lang="ts">
	import { trapFocus } from '$lib/utils/focus';

	let dialogElement: HTMLDivElement;
	let previousFocus: HTMLElement | null = null;

	$effect(() => {
		if (open) {
			previousFocus = document.activeElement as HTMLElement;
			// Focus first focusable element
			const firstFocusable = dialogElement?.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			firstFocusable?.focus();
		} else if (previousFocus) {
			previousFocus.focus();
		}
	});
</script>

<div
	bind:this={dialogElement}
	role="dialog"
	aria-modal="true"
	aria-labelledby="dialog-title"
	use:trapFocus
>
	<!-- content -->
</div>
```

#### 8.3 Create Focus Trap Utility

**File:** `src/lib/utils/focus.ts` (new file)

```typescript
export function trapFocus(node: HTMLElement) {
	const focusableElements = node.querySelectorAll<HTMLElement>(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);

	const firstFocusable = focusableElements[0];
	const lastFocusable = focusableElements[focusableElements.length - 1];

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		if (event.shiftKey) {
			if (document.activeElement === firstFocusable) {
				event.preventDefault();
				lastFocusable?.focus();
			}
		} else {
			if (document.activeElement === lastFocusable) {
				event.preventDefault();
				firstFocusable?.focus();
			}
		}
	}

	node.addEventListener('keydown', handleKeyDown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeyDown);
		}
	};
}
```

#### 8.4 Color Contrast Verification

Run contrast checks on these combinations:

| Element     | Foreground | Background | Required Ratio |
| ----------- | ---------- | ---------- | -------------- |
| Body text   | `#e4e4e7`  | `#1a1a2e`  | 4.5:1          |
| Muted text  | `#a1a1aa`  | `#1a1a2e`  | 4.5:1          |
| Button text | `#e4e4e7`  | `#1f1f38`  | 4.5:1          |
| Focus ring  | `#3b82f6`  | `#1a1a2e`  | 3:1            |
| Error text  | `#ef4444`  | `#1f1f38`  | 4.5:1          |

Use WebAIM Contrast Checker to verify.

### Acceptance Criteria

- [ ] All buttons have `aria-label` or visible text
- [ ] All dialogs trap focus and restore on close
- [ ] All inputs have associated labels
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Keyboard navigation works for all features

---

## 9. Design Token Consolidation

**Priority:** P3 (Low)
**Methodology Reference:** Section 15 — Visual Design Tokens

### Current State

CSS custom properties are scattered. Consolidate into organized token system.

### Implementation Tasks

#### 9.1 Create Token File

**File:** `src/lib/styles/tokens.css` (new file)

```css
/**
 * Rackarr Design Tokens
 *
 * Layer 1: Primitives (raw values)
 * Layer 2: Semantic tokens (purpose-driven)
 * Layer 3: Component tokens (scoped)
 */

:root {
	/* ========================================
   * LAYER 1: PRIMITIVES
   * ======================================== */

	/* Spacing Scale (4px base) */
	--space-0: 0;
	--space-1: 4px;
	--space-2: 8px;
	--space-3: 12px;
	--space-4: 16px;
	--space-5: 20px;
	--space-6: 24px;
	--space-8: 32px;
	--space-10: 40px;
	--space-12: 48px;

	/* Color Palette - Neutrals */
	--neutral-50: #fafafa;
	--neutral-100: #f5f5f5;
	--neutral-200: #e5e5e5;
	--neutral-300: #d4d4d4;
	--neutral-400: #a3a3a3;
	--neutral-500: #737373;
	--neutral-600: #525252;
	--neutral-700: #404040;
	--neutral-800: #262626;
	--neutral-900: #171717;
	--neutral-950: #0a0a0a;

	/* Color Palette - Blue (Primary) */
	--blue-50: #eff6ff;
	--blue-100: #dbeafe;
	--blue-200: #bfdbfe;
	--blue-300: #93c5fd;
	--blue-400: #60a5fa;
	--blue-500: #3b82f6;
	--blue-600: #2563eb;
	--blue-700: #1d4ed8;
	--blue-800: #1e40af;
	--blue-900: #1e3a8a;

	/* Color Palette - Red (Error/Destructive) */
	--red-50: #fef2f2;
	--red-500: #ef4444;
	--red-600: #dc2626;
	--red-700: #b91c1c;

	/* Color Palette - Green (Success) */
	--green-50: #f0fdf4;
	--green-500: #22c55e;
	--green-600: #16a34a;

	/* Color Palette - Amber (Warning) */
	--amber-50: #fffbeb;
	--amber-500: #f59e0b;
	--amber-600: #d97706;

	/* Typography Scale */
	--font-size-xs: 0.6875rem; /* 11px */
	--font-size-sm: 0.8125rem; /* 13px */
	--font-size-base: 0.875rem; /* 14px */
	--font-size-lg: 1rem; /* 16px */
	--font-size-xl: 1.125rem; /* 18px */

	--font-weight-normal: 400;
	--font-weight-medium: 500;
	--font-weight-semibold: 600;
	--font-weight-bold: 700;

	--line-height-tight: 1.25;
	--line-height-normal: 1.5;
	--line-height-relaxed: 1.75;

	/* Border Radius */
	--radius-sm: 4px;
	--radius-md: 6px;
	--radius-lg: 8px;
	--radius-xl: 12px;
	--radius-full: 9999px;

	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
	--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
	--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
	--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);

	/* Timing */
	--duration-instant: 0ms;
	--duration-fast: 100ms;
	--duration-normal: 200ms;
	--duration-slow: 300ms;

	--ease-linear: linear;
	--ease-in: cubic-bezier(0.4, 0, 1, 1);
	--ease-out: cubic-bezier(0, 0, 0.2, 1);
	--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
	--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

	/* ========================================
   * LAYER 2: SEMANTIC TOKENS (Dark Theme)
   * ======================================== */

	/* Backgrounds */
	--colour-bg: #0f0f1a;
	--colour-surface: #1a1a2e;
	--colour-surface-raised: #252540;
	--colour-surface-hover: rgba(255, 255, 255, 0.05);
	--colour-surface-active: rgba(255, 255, 255, 0.1);

	/* Text */
	--colour-text: #e4e4e7;
	--colour-text-muted: #a1a1aa;
	--colour-text-disabled: #52525b;

	/* Borders */
	--colour-border: #3f3f5a;
	--colour-border-hover: #52527a;
	--colour-border-focus: var(--blue-500);

	/* Interactive */
	--colour-selection: var(--blue-500);
	--colour-selection-hover: var(--blue-400);
	--colour-focus-ring: var(--blue-500);

	/* Semantic */
	--colour-success: var(--green-500);
	--colour-warning: var(--amber-500);
	--colour-error: var(--red-500);

	/* Drag and Drop */
	--colour-dnd-valid: var(--blue-500);
	--colour-dnd-valid-bg: rgba(59, 130, 246, 0.15);
	--colour-dnd-invalid: var(--red-500);
	--colour-dnd-invalid-bg: rgba(239, 68, 68, 0.15);
	--colour-dnd-dragging: var(--blue-500);

	/* ========================================
   * LAYER 3: COMPONENT TOKENS
   * ======================================== */

	/* Rack */
	--rack-u-height: 22px;
	--rack-width: 220px;
	--rack-rail-width: 24px;
	--rack-padding: 8px;
	--rack-bg: var(--colour-surface);
	--rack-slot: rgba(255, 255, 255, 0.02);
	--rack-slot-alt: rgba(255, 255, 255, 0.04);
	--rack-grid: rgba(255, 255, 255, 0.1);

	/* Toolbar */
	--toolbar-height: 52px;
	--toolbar-bg: var(--colour-surface);
	--toolbar-border: var(--colour-border);

	/* Drawer */
	--drawer-width: 300px;
	--drawer-bg: var(--colour-surface);

	/* Device */
	--device-font-size: var(--font-size-sm);
	--device-padding: var(--space-2);
	--device-radius: var(--radius-sm);
	--device-ghost-opacity: 0.4;

	/* Toast */
	--toast-bg: var(--colour-surface-raised);
	--toast-border: var(--colour-border);
	--toast-radius: var(--radius-lg);
}

/* ========================================
 * LIGHT THEME OVERRIDES
 * ======================================== */

[data-theme='light'] {
	/* Backgrounds */
	--colour-bg: #ffffff;
	--colour-surface: #f5f5f5;
	--colour-surface-raised: #e5e5e5;
	--colour-surface-hover: rgba(0, 0, 0, 0.05);
	--colour-surface-active: rgba(0, 0, 0, 0.1);

	/* Text */
	--colour-text: #171717;
	--colour-text-muted: #525252;
	--colour-text-disabled: #a3a3a3;

	/* Borders */
	--colour-border: #d4d4d4;
	--colour-border-hover: #a3a3a3;

	/* Shadows (lighter) */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
	--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

	/* Rack */
	--rack-bg: #ffffff;
	--rack-slot: rgba(0, 0, 0, 0.02);
	--rack-slot-alt: rgba(0, 0, 0, 0.04);
	--rack-grid: rgba(0, 0, 0, 0.1);
}
```

#### 9.2 Import in app.css

**File:** `src/app.css`

```css
@import './lib/styles/tokens.css';

/* Rest of app styles... */
```

### Acceptance Criteria

- [ ] All design tokens in single organized file
- [ ] Three-layer structure (primitives, semantic, component)
- [ ] Light theme properly overrides semantic tokens
- [ ] No hardcoded color values in component styles

---

## Implementation Order

Recommended implementation sequence:

1. **P0 - Drag Affordance** (Section 1) — Blocking UX issue
2. **P0 - Drop Zone Feedback** (Section 2) — Blocking UX issue
3. **P1 - Interaction States** (Section 3) — Core polish
4. **P1 - Tooltips** (Section 4) — Discoverability
5. **P1 - Accessibility** (Section 8) — Compliance
6. **P2 - Edit Panel** (Section 5) — Visual hierarchy
7. **P2 - Rack Visuals** (Section 6) — Polish
8. **P2 - Animations** (Section 7) — Polish
9. **P3 - Design Tokens** (Section 9) — Technical debt

---

## Testing Checklist

After implementation, verify:

### Drag and Drop

- [ ] Device library items have visible drag handles
- [ ] Cursor changes on hover (grab) and drag (grabbing)
- [ ] Items lift with shadow on grab
- [ ] Drop zones highlight during drag
- [ ] Invalid zones show red with no-drop cursor
- [ ] Multi-U devices highlight multiple slots
- [ ] Drop animation plays on successful placement

### Interaction States

- [ ] All buttons have hover, focus, active, disabled states
- [ ] All inputs have focus and invalid states
- [ ] Selected items have clear visual indicator
- [ ] Focus indicators are visible and consistent

### Accessibility

- [ ] Tab through entire interface possible
- [ ] All actions achievable via keyboard
- [ ] Screen reader announces all controls
- [ ] Color contrast meets WCAG AA
- [ ] Focus trap works in dialogs

### Visual Consistency

- [ ] Spacing follows 4px grid
- [ ] Colors match token definitions
- [ ] Typography consistent throughout
- [ ] Animations respect reduced-motion preference

---

_This specification should be used alongside design-methodology.md for implementation guidance._
