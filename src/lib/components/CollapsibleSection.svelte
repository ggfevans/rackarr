<!--
  CollapsibleSection Component
  Reusable collapsible section for organizing content in groups
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count: number;
		defaultExpanded?: boolean;
		children?: Snippet;
	}

	let { title, count, defaultExpanded = false, children }: Props = $props();

	// Generate unique ID for accessibility
	const contentId = `collapsible-${crypto.randomUUID().slice(0, 8)}`;

	// Expanded state using Svelte 5 runes
	// Note: We intentionally capture only the initial value of defaultExpanded
	let expanded = $state(defaultExpanded);

	function toggle() {
		expanded = !expanded;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	}
</script>

<div class="collapsible-section">
	<button
		type="button"
		class="collapsible-header"
		aria-expanded={expanded}
		aria-controls={contentId}
		onclick={toggle}
		onkeydown={handleKeydown}
	>
		<svg
			class="chevron"
			class:rotated={expanded}
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
		<span class="title">{title}</span>
		<span class="count">({count})</span>
	</button>

	<div
		id={contentId}
		class="collapsible-content"
		class:expanded
		role="region"
		aria-labelledby={contentId}
		aria-hidden={!expanded}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.collapsible-section {
		border-bottom: 1px solid var(--colour-border);
	}

	.collapsible-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: none;
		color: var(--colour-text);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition: background-color var(--duration-fast);
	}

	.collapsible-header:hover {
		background: var(--colour-surface);
	}

	.collapsible-header:focus {
		outline: 2px solid var(--colour-selection);
		outline-offset: -2px;
	}

	.chevron {
		flex-shrink: 0;
		color: var(--colour-text-muted);
		transition: transform var(--duration-fast);
	}

	.chevron.rotated {
		transform: rotate(90deg);
	}

	.title {
		flex: 1;
	}

	.count {
		color: var(--colour-text-muted);
		font-size: var(--font-size-xs);
		font-weight: 400;
	}

	.collapsible-content {
		max-height: 0;
		overflow: hidden;
		transition: max-height var(--duration-normal) ease-out;
	}

	.collapsible-content.expanded {
		max-height: 1000px;
		transition: max-height var(--duration-normal) ease-in;
	}
</style>
