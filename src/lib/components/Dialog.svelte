<!--
  Dialog Component
  Modal dialog with backdrop, focus trap, and accessibility
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { trapFocus, focusFirst, createFocusManager } from '$lib/utils/focus';

	interface Props {
		open: boolean;
		title: string;
		width?: string;
		showClose?: boolean;
		onclose?: () => void;
		children?: Snippet;
	}

	let { open, title, width = '400px', showClose = true, onclose, children }: Props = $props();

	let dialogElement: HTMLDivElement | null = $state(null);
	const focusManager = createFocusManager();
	const titleId = `dialog-title-${Math.random().toString(36).slice(2, 11)}`;

	// Handle escape key
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onclose?.();
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclose?.();
		}
	}

	// Focus management using utilities
	$effect(() => {
		if (open) {
			focusManager.save();
			// Focus the first focusable element after mount
			setTimeout(() => {
				if (dialogElement) {
					focusFirst(dialogElement);
				}
			}, 0);
		} else {
			focusManager.restore();
		}
	});

	// Add document keydown listener
	onMount(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

{#if open}
	<div
		class="dialog-backdrop"
		data-testid="dialog-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="presentation"
	>
		<div
			bind:this={dialogElement}
			class="dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			style:width
			use:trapFocus
		>
			<div class="dialog-header">
				<h2 id={titleId} class="dialog-title">{title}</h2>
				{#if showClose}
					<button
						type="button"
						class="dialog-close"
						onclick={() => onclose?.()}
						aria-label="Close dialog"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<path
								d="M15 5L5 15M5 5L15 15"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
			<div class="dialog-content">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: var(--colour-backdrop, rgba(0, 0, 0, 0.6));
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
	}

	.dialog {
		background: var(--colour-dialog-bg, var(--colour-bg));
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 90vw;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1; /* Above backdrop for reliable click targeting */
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--colour-border);
	}

	.dialog-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--colour-text);
	}

	.dialog-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--colour-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast);
	}

	.dialog-close:hover {
		background: var(--colour-surface-hover);
		color: var(--colour-text);
	}

	.dialog-close:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}

	.dialog-content {
		padding: var(--space-5);
		overflow-y: auto;
	}
</style>
