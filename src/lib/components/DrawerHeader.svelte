<!--
  DrawerHeader Component
  Header section for drawers with title and close button
-->
<script lang="ts">
	interface Props {
		title: string;
		onclose?: () => void;
	}

	let { title, onclose }: Props = $props();
</script>

<div class="drawer-header">
	<h2 class="drawer-title">{title}</h2>
	<button type="button" class="close-button" aria-label="Close drawer" onclick={onclose}>
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</button>
</div>

<style>
	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--colour-border);
		flex-shrink: 0;
	}

	.drawer-title {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
		color: var(--colour-text);
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: transparent;
		color: var(--colour-text-secondary);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.close-button:hover {
		background: var(--colour-surface-hover);
		color: var(--colour-text);
	}

	.close-button:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}
</style>
