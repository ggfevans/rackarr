import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AddDeviceForm from '$lib/components/AddDeviceForm.svelte';
import { ALL_CATEGORIES } from '$lib/types/constants';

describe('AddDeviceForm Component', () => {
	describe('Open state', () => {
		it('renders when open=true', () => {
			render(AddDeviceForm, { props: { open: true } });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('is hidden when open=false', () => {
			render(AddDeviceForm, { props: { open: false } });
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Form fields', () => {
		it('renders all fields', () => {
			render(AddDeviceForm, { props: { open: true } });
			expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/^height/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/^category$/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/^colour$/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/^notes/i)).toBeInTheDocument();
		});

		it('category dropdown has all 10 categories', () => {
			render(AddDeviceForm, { props: { open: true } });
			const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;

			// Check that all categories are present
			ALL_CATEGORIES.forEach((category) => {
				const option = categorySelect.querySelector(`option[value="${category}"]`);
				expect(option).toBeInTheDocument();
			});
		});
	});

	describe('Colour defaults', () => {
		it('colour defaults to category colour', async () => {
			render(AddDeviceForm, { props: { open: true } });

			// Default category is 'server', which has colour #4A90D9
			const colourInput = screen.getByLabelText(/^colour$/i) as HTMLInputElement;
			expect(colourInput.value.toLowerCase()).toBe('#4a90d9');
		});

		it('colour updates when category changes', async () => {
			render(AddDeviceForm, { props: { open: true } });

			const categorySelect = screen.getByLabelText(/^category$/i);
			await fireEvent.change(categorySelect, { target: { value: 'network' } });

			const colourInput = screen.getByLabelText(/^colour$/i) as HTMLInputElement;
			// Network colour is #7B68EE
			expect(colourInput.value.toLowerCase()).toBe('#7b68ee');
		});
	});

	describe('Validation', () => {
		it('rejects empty name', async () => {
			render(AddDeviceForm, { props: { open: true } });

			const submitBtn = screen.getByRole('button', { name: /add/i });
			await fireEvent.click(submitBtn);

			expect(screen.getByText(/name is required/i)).toBeInTheDocument();
		});

		it('rejects height < 1', async () => {
			render(AddDeviceForm, { props: { open: true } });

			// Fill name
			const nameInput = screen.getByLabelText(/^name$/i);
			await fireEvent.input(nameInput, { target: { value: 'Test Device' } });

			// Set invalid height
			const heightInput = screen.getByLabelText(/^height/i);
			await fireEvent.input(heightInput, { target: { value: '0' } });

			const submitBtn = screen.getByRole('button', { name: /add/i });
			await fireEvent.click(submitBtn);

			expect(screen.getByText(/height must be between 0.5 and 42/i)).toBeInTheDocument();
		});

		it('rejects height > 42', async () => {
			render(AddDeviceForm, { props: { open: true } });

			// Fill name
			const nameInput = screen.getByLabelText(/^name$/i);
			await fireEvent.input(nameInput, { target: { value: 'Test Device' } });

			// Set invalid height
			const heightInput = screen.getByLabelText(/^height/i);
			await fireEvent.input(heightInput, { target: { value: '43' } });

			const submitBtn = screen.getByRole('button', { name: /add/i });
			await fireEvent.click(submitBtn);

			expect(screen.getByText(/height must be between 0.5 and 42/i)).toBeInTheDocument();
		});
	});

	describe('Submit', () => {
		it('adds device to library on valid submit', async () => {
			const onAdd = vi.fn();
			render(AddDeviceForm, { props: { open: true, onadd: onAdd } });

			// Fill form
			const nameInput = screen.getByLabelText(/^name$/i);
			await fireEvent.input(nameInput, { target: { value: 'My Server' } });

			const heightInput = screen.getByLabelText(/^height/i);
			await fireEvent.input(heightInput, { target: { value: '2' } });

			const categorySelect = screen.getByLabelText(/^category$/i);
			await fireEvent.change(categorySelect, { target: { value: 'server' } });

			const notesInput = screen.getByLabelText(/^notes/i);
			await fireEvent.input(notesInput, { target: { value: 'Test notes' } });

			const submitBtn = screen.getByRole('button', { name: /add/i });
			await fireEvent.click(submitBtn);

			expect(onAdd).toHaveBeenCalledTimes(1);
			const callArg = onAdd.mock.calls[0]![0];
			expect(callArg.name).toBe('My Server');
			expect(callArg.height).toBe(2);
			expect(callArg.category).toBe('server');
			expect(callArg.colour.toLowerCase()).toBe('#4a90d9');
			expect(callArg.notes).toBe('Test notes');
		});

		it('submits with empty notes', async () => {
			const onAdd = vi.fn();
			render(AddDeviceForm, { props: { open: true, onadd: onAdd } });

			// Fill only required fields
			const nameInput = screen.getByLabelText(/^name$/i);
			await fireEvent.input(nameInput, { target: { value: 'Simple Device' } });

			const heightInput = screen.getByLabelText(/^height/i);
			await fireEvent.input(heightInput, { target: { value: '1' } });

			const submitBtn = screen.getByRole('button', { name: /add/i });
			await fireEvent.click(submitBtn);

			expect(onAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Simple Device',
					height: 1,
					notes: ''
				})
			);
		});
	});

	describe('Cancel', () => {
		it('has a cancel button', () => {
			render(AddDeviceForm, { props: { open: true } });
			expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		});

		it('dispatches cancel event when cancel button clicked', async () => {
			const onCancel = vi.fn();
			render(AddDeviceForm, { props: { open: true, oncancel: onCancel } });

			const cancelBtn = screen.getByRole('button', { name: /cancel/i });
			await fireEvent.click(cancelBtn);

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Form reset', () => {
		it('resets form when closed and reopened', async () => {
			const { rerender } = render(AddDeviceForm, { props: { open: true } });

			// Enter some data
			const nameInput = screen.getByLabelText(/^name$/i);
			await fireEvent.input(nameInput, { target: { value: 'Test' } });

			// Close and reopen
			await rerender({ open: false });
			await rerender({ open: true });

			// Check form is reset
			const newNameInput = screen.getByLabelText(/^name$/i);
			expect(newNameInput).toHaveValue('');
		});
	});

	describe('Keyboard shortcuts', () => {
		it('Escape key cancels form', async () => {
			const onCancel = vi.fn();
			render(AddDeviceForm, { props: { open: true, oncancel: onCancel } });

			await fireEvent.keyDown(document, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});
});
