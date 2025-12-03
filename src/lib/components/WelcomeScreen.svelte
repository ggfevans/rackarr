<!--
  WelcomeScreen Component
  Displayed when no racks exist - initial load state
-->
<script lang="ts">
	interface Props {
		onnewrack?: () => void;
		onload?: () => void;
	}

	let { onnewrack, onload }: Props = $props();

	function handleNewRack() {
		onnewrack?.();
	}

	function handleLoad() {
		onload?.();
	}
</script>

<div class="welcome-screen">
	<div class="welcome-content">
		<div class="welcome-header">
			<div class="logo">
				<svg viewBox="0 0 48 48" class="logo-icon" aria-hidden="true">
					<!-- Rack icon using design tokens -->
					<rect x="8" y="4" width="32" height="40" rx="2" class="logo-frame" />
					<rect x="12" y="8" width="24" height="32" class="logo-interior" />
					<rect x="14" y="10" width="20" height="6" rx="1" class="logo-device-1" />
					<rect x="14" y="18" width="20" height="4" rx="1" class="logo-device-2" />
					<rect x="14" y="24" width="20" height="8" rx="1" class="logo-device-3" />
				</svg>
			</div>
			<h1 class="app-name">Rackarr</h1>
			<p class="tagline">Rack Layout Designer for Homelabbers</p>
		</div>

		<p class="description">
			Create and visualize your server rack layout. Add racks, drag devices, and export your design.
		</p>

		<div class="actions">
			<button class="btn btn-primary" onclick={handleNewRack}>New Rack</button>
			<button class="btn btn-secondary" onclick={handleLoad}>Load Layout</button>
		</div>

		<p class="hint">Start by creating a new rack or loading an existing layout from a JSON file.</p>
	</div>
</div>

<style>
	.welcome-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 40px 20px;
		background: var(--colour-bg);
	}

	.welcome-content {
		max-width: 480px;
		text-align: center;
	}

	.welcome-header {
		margin-bottom: 24px;
	}

	.logo {
		margin-bottom: 16px;
	}

	.logo-icon {
		width: 80px;
		height: 80px;
	}

	.logo-frame {
		fill: var(--logo-frame);
	}
	.logo-interior {
		fill: var(--logo-interior);
	}
	.logo-device-1 {
		fill: var(--logo-device-1);
	}
	.logo-device-2 {
		fill: var(--logo-device-2);
	}
	.logo-device-3 {
		fill: var(--logo-device-3);
	}

	.app-name {
		font-size: 36px;
		font-weight: 700;
		color: var(--colour-text);
		margin: 0 0 8px;
	}

	.tagline {
		font-size: 16px;
		color: var(--colour-text-secondary);
		margin: 0;
	}

	.description {
		font-size: 15px;
		color: var(--colour-text-muted);
		line-height: 1.6;
		margin-bottom: 32px;
	}

	.actions {
		display: flex;
		gap: 16px;
		justify-content: center;
		margin-bottom: 24px;
	}

	.btn {
		padding: 12px 24px;
		font-size: 15px;
		font-weight: 500;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
	}

	.btn:hover {
		transform: translateY(-1px);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-primary {
		background: var(--colour-selection);
		color: #ffffff;
	}

	.btn-primary:hover {
		background: var(--colour-selection-hover, #0052cc);
	}

	.btn-secondary {
		background: var(--colour-panel);
		color: var(--colour-text);
		border: 1px solid var(--colour-border);
	}

	.btn-secondary:hover {
		background: var(--colour-hover);
	}

	.hint {
		font-size: 13px;
		color: var(--colour-text-muted);
		margin: 0;
	}
</style>
