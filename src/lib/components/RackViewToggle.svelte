<script lang="ts">
	import type { RackView } from '$lib/types';

	interface Props {
		view: RackView;
		onchange: (view: RackView) => void;
	}

	let { view, onchange }: Props = $props();

	function handleViewChange(newView: RackView) {
		if (newView !== view) {
			onchange(newView);
		}
	}
</script>

<div class="rack-view-toggle" role="group" aria-label="Rack view">
	<button
		type="button"
		class="toggle-button"
		class:active={view === 'front'}
		aria-pressed={view === 'front'}
		onclick={() => handleViewChange('front')}
	>
		Front
	</button>
	<button
		type="button"
		class="toggle-button"
		class:active={view === 'rear'}
		aria-pressed={view === 'rear'}
		onclick={() => handleViewChange('rear')}
	>
		Rear
	</button>
</div>

<style>
	.rack-view-toggle {
		display: inline-flex;
		border: 1px solid var(--colour-border);
		border-radius: 4px;
		overflow: hidden;
		background: var(--colour-bg);
	}

	.toggle-button {
		padding: 1px 8px;
		border: none;
		background: transparent;
		color: var(--colour-text);
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
		line-height: 1.2;
	}

	.toggle-button:not(:last-child) {
		border-right: 1px solid var(--colour-border);
	}

	.toggle-button:hover:not(.active) {
		background: var(--colour-hover);
	}

	.toggle-button:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: -2px;
		z-index: 1;
	}

	.toggle-button.active {
		background: var(--colour-selection);
		color: var(--colour-bg);
		font-weight: 600;
	}

	.toggle-button.active:hover {
		background: var(--colour-selection);
	}
</style>
