<!--
  Toast notification component
  Displays a single toast with icon, message, and dismiss button
-->
<script lang="ts">
	import type { Toast as ToastType } from '$lib/stores/toast.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';

	interface Props {
		toast: ToastType;
	}

	let { toast }: Props = $props();

	const toastStore = getToastStore();

	function handleDismiss() {
		toastStore.dismissToast(toast.id);
	}

	// Get icon based on type
	function getIcon(type: ToastType['type']): string {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'warning':
				return '⚠';
			case 'info':
				return 'ℹ';
		}
	}
</script>

<div class="toast toast--{toast.type}" role="alert">
	<span class="toast__icon" aria-hidden="true">
		{getIcon(toast.type)}
	</span>
	<span class="toast__message">
		{toast.message}
	</span>
	<button
		type="button"
		class="toast__dismiss"
		onclick={handleDismiss}
		aria-label="Dismiss notification"
	>
		✕
	</button>
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		background: var(--colour-panel);
		border: 1px solid var(--colour-border);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 280px;
		max-width: 420px;
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.toast--success {
		border-left: 4px solid var(--colour-success);
	}

	.toast--error {
		border-left: 4px solid var(--colour-error);
	}

	.toast--warning {
		border-left: 4px solid var(--colour-warning);
	}

	.toast--info {
		border-left: 4px solid var(--colour-info);
	}

	.toast__icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: bold;
	}

	.toast--success .toast__icon {
		color: var(--colour-success);
	}

	.toast--error .toast__icon {
		color: var(--colour-error);
	}

	.toast--warning .toast__icon {
		color: var(--colour-warning);
	}

	.toast--info .toast__icon {
		color: var(--colour-info);
	}

	.toast__message {
		flex: 1;
		font-size: 0.875rem;
		color: var(--colour-text);
		word-break: break-word;
	}

	.toast__dismiss {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--colour-text-muted);
		font-size: 0.75rem;
		transition: all 0.15s ease;
	}

	.toast__dismiss:hover {
		background: var(--colour-hover);
		color: var(--colour-text);
	}

	.toast__dismiss:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: 1px;
	}
</style>
