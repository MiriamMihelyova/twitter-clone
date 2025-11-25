/* eslint-env jest */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserResponseDto } from '@tw/data';
import { ParsedError } from '@tw/ui/common';
import { EditProfileForm } from './EditProfileForm';

// Mock komponentov - use factory function to access react-hook-form at runtime
jest.mock('./FormImageInput', () => ({
  FormImageInput: ({ name, control }: { name: string; control: any }) => {
    const { Controller } = require('react-hook-form');
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // File inputs cant have their value set, so we exclude it
          const { value, ...fieldWithoutValue } = field;
          return (
            <input
              data-testid={`form-image-input-${name}`}
              type="file"
              {...fieldWithoutValue}
              onChange={(e) => {
                // For file inputs, pass the file or empty string
                field.onChange(e.target.files?.[0] || '');
              }}
            />
          );
        }}
      />
    );
  },
}));

jest.mock('./FormInput', () => ({
  FormInput: ({ name, control, type }: { name: string; control: any; type: string }) => {
    const { Controller } = require('react-hook-form');
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <input
              data-testid={`form-input-${name}`}
              type={type}
              {...field}
              value={field.value || ''}
            />
            {fieldState.error && (
              <span data-testid={`error-${name}`}>{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
    );
  },
}));

// Mock uuid aby boli ID konzistentné
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('EditProfileForm', () => {
  const mockUser: UserResponseDto = {
    id: '1',
    name: 'John Doe',
    bio: 'Software developer',
    location: 'New York',
    website: 'https://johndoe.com',
    avatar: 'https://example.com/avatar.jpg',
    cover: 'https://example.com/cover.jpg',
    uniqueName: '@johndoe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnSubmit = jest.fn();
  const defaultProps = {
    formId: 'edit-profile-form',
    onSubmitUpdateUser: mockOnSubmit,
    user: mockUser,
    error: {} as ParsedError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all inputs', () => {
    render(<EditProfileForm {...defaultProps} />);

    expect(screen.getByTestId('form-image-input-cover')).toBeInTheDocument();
    expect(screen.getByTestId('form-image-input-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('form-input-name')).toBeInTheDocument();
    expect(screen.getByTestId('form-input-bio')).toBeInTheDocument();
    expect(screen.getByTestId('form-input-location')).toBeInTheDocument();
    expect(screen.getByTestId('form-input-website')).toBeInTheDocument();
  });

  it('populates form with user data', async () => {
    render(<EditProfileForm {...defaultProps} />);

    await waitFor(() => {
      const nameInput = screen.getByTestId('form-input-name') as HTMLInputElement;
      expect(nameInput.value).toBe('John Doe');

      const bioInput = screen.getByTestId('form-input-bio') as HTMLInputElement;
      expect(bioInput.value).toBe('Software developer');

      const locationInput = screen.getByTestId('form-input-location') as HTMLInputElement;
      expect(locationInput.value).toBe('New York');

      const websiteInput = screen.getByTestId('form-input-website') as HTMLInputElement;
      expect(websiteInput.value).toBe('https://johndoe.com');
    });
  });

  it('renders form with correct formId', () => {
    const { container } = render(<EditProfileForm {...defaultProps} />);
    const form = container.querySelector('form');

    expect(form).toHaveAttribute('id', 'edit-profile-form');
  });

  it('calls onSubmitUpdateUser when form is submitted', async () => {
    render(<EditProfileForm {...defaultProps} />);

    const form = document.querySelector('form');

    await act(async () => {
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      // Check only the first argument (form data), ignore the event
      const callArgs = mockOnSubmit.mock.calls[0];
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          name: 'John Doe',
          bio: 'Software developer',
          location: 'New York',
          website: 'https://johndoe.com',
        }),
      );
    });
  });

  it('updates form values when user data changes', async () => {
    const { rerender } = render(<EditProfileForm {...defaultProps} />);

    const updatedUser: UserResponseDto = {
      ...mockUser,
      name: 'Jane Doe',
      bio: 'Updated bio',
    };

    rerender(<EditProfileForm {...defaultProps} user={updatedUser} />);

    await waitFor(() => {
      const nameInput = screen.getByTestId('form-input-name') as HTMLInputElement;
      expect(nameInput.value).toBe('Jane Doe');

      const bioInput = screen.getByTestId('form-input-bio') as HTMLInputElement;
      expect(bioInput.value).toBe('Updated bio');
    });
  });

  it('displays error messages when error prop is provided', async () => {
    const errorProps: ParsedError = {
      name: 'Name is required',
      bio: 'Bio is too long',
    };

    render(<EditProfileForm {...defaultProps} error={errorProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('error-name')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('error-bio')).toHaveTextContent('Bio is too long');
    });
  });

  it('renders cover and avatar image wrappers', () => {
    const { container } = render(<EditProfileForm {...defaultProps} />);

    // Check for the styled wrappers by class name or structure
    const coverInput = screen.getByTestId('form-image-input-cover');
    const avatarInput = screen.getByTestId('form-image-input-avatar');

    // Both inputs should be rendered
    expect(coverInput).toBeInTheDocument();
    expect(avatarInput).toBeInTheDocument();

    // Check that theyre within styled wrapper divs
    expect(coverInput.parentElement).toBeInTheDocument();
    expect(avatarInput.parentElement).toBeInTheDocument();
  });

  it('handles form submission with updated data', async () => {
    const user = userEvent.setup();
    render(<EditProfileForm {...defaultProps} />);

    const nameInput = screen.getByTestId('form-input-name') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const form = document.querySelector('form');

    await act(async () => {
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      // Check only the first argument (form data)
      const callArgs = mockOnSubmit.mock.calls[0];
      expect(callArgs[0]).toEqual(
        expect.objectContaining({
          name: 'Updated Name',
        }),
      );
    });
  });

  it('renders with empty user data', () => {
    const emptyUser: UserResponseDto = {
      id: '2',
      name: '',
      bio: '',
      location: '',
      website: '',
      avatar: '',
      cover: '',
      uniqueName: '@emptyuser',
      email: 'empty@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<EditProfileForm {...defaultProps} user={emptyUser} />);

    expect(screen.getByTestId('form-input-name')).toBeInTheDocument();
    expect(screen.getByTestId('form-input-bio')).toBeInTheDocument();

    const nameInput = screen.getByTestId('form-input-name') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });
});
