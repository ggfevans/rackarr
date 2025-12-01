import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { trapFocus, focusFirst, createFocusManager } from '$lib/utils/focus';

describe('Focus Management Utilities', () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		// Create a container with focusable elements
		container = document.createElement('div');
		container.innerHTML = `
			<button id="first">First</button>
			<input id="second" type="text" />
			<a id="third" href="#">Link</a>
			<select id="fourth"><option>Option</option></select>
			<textarea id="fifth">Text</textarea>
			<button id="last">Last</button>
		`;
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	describe('trapFocus', () => {
		it('prevents focus from leaving container when Tab pressed on last element', () => {
			const action = trapFocus(container);

			const lastButton = container.querySelector('#last') as HTMLButtonElement;
			const firstButton = container.querySelector('#first') as HTMLButtonElement;

			// Focus the last element
			lastButton.focus();
			expect(document.activeElement).toBe(lastButton);

			// Simulate Tab key press
			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(tabEvent);

			// Should prevent default and focus first element
			expect(tabEvent.defaultPrevented).toBe(true);
			expect(document.activeElement).toBe(firstButton);

			action.destroy();
		});

		it('Tab wraps from last to first element', () => {
			const action = trapFocus(container);

			const lastButton = container.querySelector('#last') as HTMLButtonElement;
			const firstButton = container.querySelector('#first') as HTMLButtonElement;

			lastButton.focus();

			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(tabEvent);

			expect(document.activeElement).toBe(firstButton);

			action.destroy();
		});

		it('Shift+Tab wraps from first to last element', () => {
			const action = trapFocus(container);

			const firstButton = container.querySelector('#first') as HTMLButtonElement;
			const lastButton = container.querySelector('#last') as HTMLButtonElement;

			firstButton.focus();

			const shiftTabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				shiftKey: true,
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(shiftTabEvent);

			expect(document.activeElement).toBe(lastButton);

			action.destroy();
		});

		it('does not prevent default for non-Tab keys', () => {
			const action = trapFocus(container);

			const firstButton = container.querySelector('#first') as HTMLButtonElement;
			firstButton.focus();

			const enterEvent = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(enterEvent);

			expect(enterEvent.defaultPrevented).toBe(false);

			action.destroy();
		});

		it('allows normal Tab navigation in the middle of focusable elements', () => {
			const action = trapFocus(container);

			const secondInput = container.querySelector('#second') as HTMLInputElement;
			secondInput.focus();

			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(tabEvent);

			// Should not prevent default since we're not at the boundary
			expect(tabEvent.defaultPrevented).toBe(false);

			action.destroy();
		});

		it('cleans up event listener on destroy', () => {
			const action = trapFocus(container);
			action.destroy();

			const lastButton = container.querySelector('#last') as HTMLButtonElement;

			lastButton.focus();

			const tabEvent = new KeyboardEvent('keydown', {
				key: 'Tab',
				bubbles: true,
				cancelable: true
			});

			container.dispatchEvent(tabEvent);

			// After destroy, should not trap focus
			expect(tabEvent.defaultPrevented).toBe(false);
			// Focus should remain on last button (browser would normally move it)
			expect(document.activeElement).toBe(lastButton);
		});
	});

	describe('focusFirst', () => {
		it('focuses first focusable element in container', () => {
			const firstButton = container.querySelector('#first') as HTMLButtonElement;

			focusFirst(container);

			expect(document.activeElement).toBe(firstButton);
		});

		it('focuses button element', () => {
			const onlyButton = document.createElement('div');
			onlyButton.innerHTML = '<button id="only-btn">Click</button>';
			document.body.appendChild(onlyButton);

			focusFirst(onlyButton);

			expect(document.activeElement).toBe(onlyButton.querySelector('#only-btn'));

			document.body.removeChild(onlyButton);
		});

		it('focuses input element', () => {
			const onlyInput = document.createElement('div');
			onlyInput.innerHTML = '<input id="only-input" type="text" />';
			document.body.appendChild(onlyInput);

			focusFirst(onlyInput);

			expect(document.activeElement).toBe(onlyInput.querySelector('#only-input'));

			document.body.removeChild(onlyInput);
		});

		it('focuses link element', () => {
			const onlyLink = document.createElement('div');
			onlyLink.innerHTML = '<a id="only-link" href="#">Link</a>';
			document.body.appendChild(onlyLink);

			focusFirst(onlyLink);

			expect(document.activeElement).toBe(onlyLink.querySelector('#only-link'));

			document.body.removeChild(onlyLink);
		});

		it('does nothing if no focusable elements', () => {
			const emptyContainer = document.createElement('div');
			emptyContainer.innerHTML = '<p>No focusable elements</p>';
			document.body.appendChild(emptyContainer);

			const previousFocus = document.activeElement;
			focusFirst(emptyContainer);

			// Should not change focus
			expect(document.activeElement).toBe(previousFocus);

			document.body.removeChild(emptyContainer);
		});

		it('skips elements with tabindex="-1"', () => {
			const mixedContainer = document.createElement('div');
			mixedContainer.innerHTML = `
				<button tabindex="-1" id="hidden">Hidden</button>
				<button id="visible">Visible</button>
			`;
			document.body.appendChild(mixedContainer);

			focusFirst(mixedContainer);

			expect(document.activeElement).toBe(mixedContainer.querySelector('#visible'));

			document.body.removeChild(mixedContainer);
		});
	});

	describe('createFocusManager', () => {
		it('saves and restores focus', () => {
			const focusManager = createFocusManager();

			const firstButton = container.querySelector('#first') as HTMLButtonElement;
			const lastButton = container.querySelector('#last') as HTMLButtonElement;

			// Focus first button
			firstButton.focus();
			expect(document.activeElement).toBe(firstButton);

			// Save focus
			focusManager.save();

			// Move focus to last button
			lastButton.focus();
			expect(document.activeElement).toBe(lastButton);

			// Restore focus
			focusManager.restore();
			expect(document.activeElement).toBe(firstButton);
		});

		it('clears saved focus after restore', () => {
			const focusManager = createFocusManager();

			const firstButton = container.querySelector('#first') as HTMLButtonElement;
			const lastButton = container.querySelector('#last') as HTMLButtonElement;

			firstButton.focus();
			focusManager.save();

			lastButton.focus();
			focusManager.restore();

			expect(document.activeElement).toBe(firstButton);

			// Restore again should do nothing (previousFocus is null)
			lastButton.focus();
			focusManager.restore();

			// Should still be on lastButton since previousFocus was cleared
			expect(document.activeElement).toBe(lastButton);
		});

		it('restore does nothing if save was never called', () => {
			const focusManager = createFocusManager();

			const firstButton = container.querySelector('#first') as HTMLButtonElement;
			firstButton.focus();

			// Restore without save should not change focus
			focusManager.restore();
			expect(document.activeElement).toBe(firstButton);
		});
	});
});
