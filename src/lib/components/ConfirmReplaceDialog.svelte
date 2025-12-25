<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';

	interface Props {
		open: boolean;
		onSaveFirst: () => void;
		onReplace: () => void;
		onCancel: () => void;
	}

	let { open, onSaveFirst, onReplace, onCancel }: Props = $props();

	const layoutStore = getLayoutStore();

	const rackName = $derived(layoutStore.rack?.name || 'Untitled Rack');
	const deviceCount = $derived(layoutStore.rack?.devices.length ?? 0);
	const deviceWord = $derived(deviceCount === 1 ? 'device' : 'devices');
	const message = $derived(
		`"${rackName}" has ${deviceCount} ${deviceWord} placed. Save your layout first?`
	);
</script>

<Dialog {open} title="Replace Current Rack?" width="420px" showClose={false} onclose={onCancel}>
	<p class="message">{message}</p>

	<div class="actions">
		<button type="button" class="btn btn-secondary" onclick={onCancel}> Cancel </button>
		<button type="button" class="btn btn-primary" onclick={onSaveFirst}> Save First </button>
		<button type="button" class="btn btn-destructive" onclick={onReplace}> Replace </button>
	</div>
</Dialog>

<style>
	.message {
		margin: 0 0 24px 0;
		color: var(--colour-text-muted);
		line-height: 1.5;
	}

	.actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: opacity 0.15s;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn-primary {
		background: var(--colour-button-primary);
		color: var(--colour-text-on-primary);
	}

	.btn-primary:hover {
		background: var(--colour-button-primary-hover);
	}

	.btn-destructive {
		background: var(--colour-button-destructive);
		color: var(--colour-text-on-primary);
	}

	.btn-destructive:hover {
		background: var(--colour-button-destructive-hover);
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--colour-border);
		color: var(--colour-text);
	}
</style>
