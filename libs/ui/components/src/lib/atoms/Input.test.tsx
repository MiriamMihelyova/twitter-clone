/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';
import { InputComponent } from './Input';

describe('InputComponent', () => {
  it('renders input and label correctly', () => {
    render(<InputComponent id="email" name="Email" type="text" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');

    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'Email');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<InputComponent id="email" name="Email" type="text" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test@example.com');
  });

  it('shows error message when error prop is provided', () => {
    render(<InputComponent id="email" name="Email" type="text" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<InputComponent id="email" name="Email" type="text" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies the required attribute when required prop is true', () => {
    render(<InputComponent id="email" name="Email" type="text" required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('renders label in lifted position when isDirty is true', () => {
    const { container } = render(<InputComponent id="email" name="Email" type="text" isDirty />);
    const label = container.querySelector('label');
    expect(label).toHaveStyle('transform: translateY(-2rem)');
  });
});
