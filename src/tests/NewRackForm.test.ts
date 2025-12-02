import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import NewRackForm from '$lib/components/NewRackForm.svelte';

describe('NewRackForm Component', () => {
	describe('Open state', () => {
		it('renders when open=true', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('is hidden when open=false', () => {
			render(NewRackForm, { props: { open: false } });
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('Form fields', () => {
		it('has a name input field', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		});

		it('has preset height buttons', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByRole('button', { name: '12U' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '18U' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '24U' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '42U' })).toBeInTheDocument();
		});

		it('has a custom height option', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument();
		});
	});

	describe('Height selection', () => {
		it('preset height buttons select correct value', async () => {
			render(NewRackForm, { props: { open: true } });
			const btn18U = screen.getByRole('button', { name: '18U' });
			await fireEvent.click(btn18U);
			expect(btn18U).toHaveClass('selected');
		});

		it('custom option shows number input', async () => {
			render(NewRackForm, { props: { open: true } });
			const customBtn = screen.getByRole('button', { name: /custom/i });
			await fireEvent.click(customBtn);
			expect(screen.getByRole('spinbutton', { name: /height/i })).toBeInTheDocument();
		});

		it('custom input accepts valid height value', async () => {
			render(NewRackForm, { props: { open: true } });
			const customBtn = screen.getByRole('button', { name: /custom/i });
			await fireEvent.click(customBtn);
			const input = screen.getByRole('spinbutton', { name: /height/i });
			await fireEvent.input(input, { target: { value: '36' } });
			expect(input).toHaveValue(36);
		});
	});

	describe('Validation', () => {
		it('shows error for empty name on submit', async () => {
			render(NewRackForm, { props: { open: true } });
			// Clear the pre-filled name
			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: '' } });
			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);
			expect(screen.getByText(/name is required/i)).toBeInTheDocument();
		});

		it('shows error for height < 1', async () => {
			render(NewRackForm, { props: { open: true } });
			// Enter name first
			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Test Rack' } });

			// Select custom and enter invalid height
			const customBtn = screen.getByRole('button', { name: /custom/i });
			await fireEvent.click(customBtn);
			const heightInput = screen.getByRole('spinbutton', { name: /height/i });
			await fireEvent.input(heightInput, { target: { value: '0' } });

			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);
			expect(screen.getByText(/height must be between 1 and 100/i)).toBeInTheDocument();
		});

		it('shows error for height > 100', async () => {
			render(NewRackForm, { props: { open: true } });
			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Test Rack' } });

			const customBtn = screen.getByRole('button', { name: /custom/i });
			await fireEvent.click(customBtn);
			const heightInput = screen.getByRole('spinbutton', { name: /height/i });
			await fireEvent.input(heightInput, { target: { value: '101' } });

			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);
			expect(screen.getByText(/height must be between 1 and 100/i)).toBeInTheDocument();
		});
	});

	describe('Submit', () => {
		it('dispatches create event with correct data', async () => {
			const onCreate = vi.fn();
			render(NewRackForm, { props: { open: true, oncreate: onCreate } });

			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'My New Rack' } });

			const btn24U = screen.getByRole('button', { name: '24U' });
			await fireEvent.click(btn24U);

			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);

			expect(onCreate).toHaveBeenCalledWith({
				name: 'My New Rack',
				height: 24,
				width: 19
			});
		});

		it('dispatches create event with custom height', async () => {
			const onCreate = vi.fn();
			render(NewRackForm, { props: { open: true, oncreate: onCreate } });

			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Custom Rack' } });

			const customBtn = screen.getByRole('button', { name: /custom/i });
			await fireEvent.click(customBtn);
			const heightInput = screen.getByRole('spinbutton', { name: /height/i });
			await fireEvent.input(heightInput, { target: { value: '50' } });

			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);

			expect(onCreate).toHaveBeenCalledWith({
				name: 'Custom Rack',
				height: 50,
				width: 19
			});
		});
	});

	describe('Cancel', () => {
		it('has a cancel button', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		});

		it('dispatches cancel event when cancel button clicked', async () => {
			const onCancel = vi.fn();
			render(NewRackForm, { props: { open: true, oncancel: onCancel } });

			const cancelBtn = screen.getByRole('button', { name: /cancel/i });
			await fireEvent.click(cancelBtn);

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Keyboard shortcuts', () => {
		it('Enter key submits form when valid', async () => {
			const onCreate = vi.fn();
			render(NewRackForm, { props: { open: true, oncreate: onCreate } });

			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Enter Test Rack' } });

			// Default selection is 42U, so just submit
			await fireEvent.keyDown(nameInput, { key: 'Enter' });

			expect(onCreate).toHaveBeenCalledWith({
				name: 'Enter Test Rack',
				height: 42,
				width: 19
			});
		});

		it('Escape key cancels form', async () => {
			const onCancel = vi.fn();
			render(NewRackForm, { props: { open: true, oncancel: onCancel } });

			await fireEvent.keyDown(document, { key: 'Escape' });

			expect(onCancel).toHaveBeenCalledTimes(1);
		});
	});

	describe('Form reset', () => {
		it('resets form when closed and reopened', async () => {
			const { rerender } = render(NewRackForm, { props: { open: true, rackCount: 0 } });

			// Enter some data
			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Custom Name' } });

			// Close and reopen
			await rerender({ open: false, rackCount: 0 });
			await rerender({ open: true, rackCount: 0 });

			// Check form is reset to default name
			const newNameInput = screen.getByLabelText(/name/i);
			expect(newNameInput).toHaveValue('Racky McRackface');
		});
	});

	describe('Width selection', () => {
		it('shows width selection options', () => {
			render(NewRackForm, { props: { open: true } });
			expect(screen.getByRole('group', { name: /rack width/i })).toBeInTheDocument();
		});

		it('has 19" width selected by default', () => {
			render(NewRackForm, { props: { open: true } });
			const width19 = screen.getByRole('radio', { name: /19/i });
			expect(width19).toBeChecked();
		});

		it('can select 10" width', async () => {
			render(NewRackForm, { props: { open: true } });
			const width10 = screen.getByRole('radio', { name: /10/i });
			await fireEvent.click(width10);
			expect(width10).toBeChecked();
		});

		it('includes width in create event data', async () => {
			const onCreate = vi.fn();
			render(NewRackForm, { props: { open: true, oncreate: onCreate } });

			// Select 10" width
			const width10 = screen.getByRole('radio', { name: /10/i });
			await fireEvent.click(width10);

			// Submit form
			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);

			expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ width: 10 }));
		});

		it('defaults to 19" width in create event data', async () => {
			const onCreate = vi.fn();
			render(NewRackForm, { props: { open: true, oncreate: onCreate } });

			// Submit form without changing width
			const submitBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(submitBtn);

			expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ width: 19 }));
		});
	});
});
