<!--
  Tooltip Component
  Shows contextual information on hover/focus with optional keyboard shortcut
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Position = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		text: string;
		shortcut?: string;
		position?: Position;
		children?: Snippet;
	}

	let { text, shortcut, position = 'top', children }: Props = $props();

	let visible = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const tooltipId = $state(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

	const DELAY_MS = 500;

	function showTooltip() {
		timeoutId = setTimeout(() => {
			visible = true;
		}, DELAY_MS);
	}

	function hideTooltip() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		visible = false;
	}

	function handleMouseEnter() {
		showTooltip();
	}

	function handleMouseLeave() {
		hideTooltip();
	}

	function handleFocus() {
		showTooltip();
	}

	function handleBlur() {
		hideTooltip();
	}
</script>

<div class="tooltip-wrapper">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="tooltip-trigger"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		onfocusin={handleFocus}
		onfocusout={handleBlur}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if visible}
		<div id={tooltipId} class="tooltip position-{position}" role="tooltip">
			<span class="tooltip-text">{text}</span>
			{#if shortcut}
				<span class="tooltip-shortcut">{shortcut}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-block;
	}

	.tooltip-trigger {
		display: inline-flex;
	}

	.tooltip-trigger:focus {
		outline: none;
	}

	.tooltip {
		position: absolute;
		z-index: var(--z-tooltip, 1000);
		padding: var(--space-1) var(--space-2);
		background-color: var(--colour-surface-overlay);
		color: var(--colour-text-inverse);
		font-size: var(--font-size-xs);
		border-radius: var(--radius-sm);
		white-space: nowrap;
		pointer-events: none;
		box-shadow: var(--shadow-md);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		animation: tooltip-fade-in var(--duration-fast, 100ms) var(--ease-out, ease-out);
	}

	@keyframes tooltip-fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Position variants */
	.tooltip.position-top {
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: var(--space-1);
	}

	.tooltip.position-bottom {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: var(--space-1);
	}

	.tooltip.position-left {
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: var(--space-1);
	}

	.tooltip.position-right {
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: var(--space-1);
	}

	.tooltip-text {
		color: inherit;
	}

	.tooltip-shortcut {
		padding: 1px 4px;
		background-color: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
		font-size: var(--font-size-xs);
		font-family: var(--font-mono, monospace);
		color: var(--colour-text-muted-inverse, rgba(255, 255, 255, 0.7));
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tooltip {
			animation: none;
		}
	}
</style>
