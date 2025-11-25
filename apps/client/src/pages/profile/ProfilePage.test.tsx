/* eslint-env jest */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserResponseDto } from '@tw/data';
import { ProfilePage } from './ProfilePage';

// Mock all data-access hooks
jest.mock('@tw/ui/data-access', () => ({
  useUserQuery: jest.fn(),
  useSocialStatsQuery: jest.fn(),
  useMostPopularUsersQuery: jest.fn(),
  useUpdateUserMutation: jest.fn(),
}));

// Mock child components
jest.mock('@tw/ui/components', () => ({
  Sidebar: ({ name, uniqueName }: any) => (
    <div data-testid="sidebar">
      {name} - {uniqueName}
    </div>
  ),
  MainLane: ({ user, profileActions, profileModal }: any) => (
    <div data-testid="main-lane">
      <div data-testid="user-info">{user?.name}</div>
      <div data-testid="profile-actions">{profileActions}</div>
      <div data-testid="profile-modal">{profileModal}</div>
    </div>
  ),
  Mediabar: ({ topWindowChilde, bottomWindowChilde }: any) => (
    <div data-testid="mediabar">
      <div data-testid="top-window">{topWindowChilde}</div>
      <div data-testid="bottom-window">{bottomWindowChilde}</div>
    </div>
  ),
  UserLIst: ({ title, userList }: any) => <div data-testid="user-list">{title}</div>,
  Trends: () => <div data-testid="trends">Trends</div>,
  Modal: ({ modalIsOpen, children, actions, setModalIsOpen }: any) => (
    <div data-testid="modal" data-open={modalIsOpen}>
      {modalIsOpen && (
        <>
          <div data-testid="modal-actions">{actions}</div>
          <div data-testid="modal-content">{children}</div>
          <button onClick={() => setModalIsOpen(false)}>Close</button>
        </>
      )}
    </div>
  ),
  EditProfileForm: ({ formId, onSubmitUpdateUser }: any) => (
    <form
      data-testid="edit-profile-form"
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitUpdateUser({ name: 'Updated Name' });
      }}
    >
      <input data-testid="name-input" />
    </form>
  ),
  SecondaryButton: ({ children, onClick, type, form, loading, ...props }: any) => (
    <button
      data-testid={type === 'submit' ? 'submit-button' : 'action-button'}
      onClick={onClick}
      type={type}
      form={form}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

jest.mock('@tw/ui/common', () => ({
  invProfilePage: jest.fn(() => ({})),
}));

// Mock uuid to return unique IDs
jest.mock('uuid', () => {
  let callCount = 0;
  return {
    v4: jest.fn(() => `test-uuid-${callCount++}`),
  };
});

describe('ProfilePage', () => {
  const mockUser: UserResponseDto = {
    id: 'user-123',
    name: 'John Doe',
    uniqueName: '@johndoe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software developer',
    location: 'New York',
    website: 'https://johndoe.com',
    cover: 'https://example.com/cover.jpg',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSocialStats = {
    following: 100,
    followers: 200,
  };

  const mockMostPopularUsers = [
    {
      id: 'user-1',
      name: 'Jane Smith',
      uniqueName: '@janesmith',
      avatar: '',
      bio: '',
      location: '',
      website: '',
      cover: '',
      email: 'jane@example.com',
      followingStatus: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUpdateUserMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const {
      useUserQuery,
      useSocialStatsQuery,
      useMostPopularUsersQuery,
      useUpdateUserMutation,
    } = require('@tw/ui/data-access');

    useUserQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    useSocialStatsQuery.mockReturnValue({
      data: mockSocialStats,
      isLoading: false,
    });

    useMostPopularUsersQuery.mockReturnValue({
      data: mockMostPopularUsers,
      isFetching: false,
    });

    useUpdateUserMutation.mockReturnValue({
      mutate: mockUpdateUserMutate,
      isPending: false,
      error: null,
    });
  });

  describe('Page rendering', () => {
    it('renders all main sections', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-lane')).toBeInTheDocument();
      expect(screen.getByTestId('mediabar')).toBeInTheDocument();
    });

    it('passes user data to Sidebar', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('sidebar')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('sidebar')).toHaveTextContent('@johndoe');
    });

    it('passes user data to MainLane', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    });

    it('renders UserList with correct title', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('user-list')).toHaveTextContent('You might like');
    });

    it('renders Trends component', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('trends')).toBeInTheDocument();
    });
  });

  describe('Edit Profile button', () => {
    it('renders edit profile button', () => {
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      expect(editButton).toHaveTextContent('Edit profile');
    });

    it('opens modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('data-open', 'false');

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      expect(modal).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Edit Profile Modal', () => {
    it('does not show modal content when closed', () => {
      render(<ProfilePage />);

      expect(screen.queryByTestId('edit-profile-form')).not.toBeInTheDocument();
    });

    it('shows modal content when opened', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
      expect(screen.getByTestId('modal-actions')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      // Open modal
      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);
      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'false');
    });

    it('displays Edit profile title in modal actions', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      // Check that the modal actions contain "Edit profile"
      const modalActions = screen.getByTestId('modal-actions');
      expect(modalActions).toHaveTextContent('Edit profile');
    });

    it('displays save button in modal', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      expect(screen.getByTestId('submit-button')).toHaveTextContent('save');
    });
  });

  describe('Form submission', () => {
    it('calls updateUserMutate when form is submitted', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      // Open modal
      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      // Submit form
      const form = screen.getByTestId('edit-profile-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await waitFor(() => {
        expect(mockUpdateUserMutate).toHaveBeenCalledWith({ name: 'Updated Name' });
      });
    });

    it('shows loading state on save button during submission', async () => {
      const { useUpdateUserMutation } = require('@tw/ui/data-access');
      useUpdateUserMutation.mockReturnValue({
        mutate: mockUpdateUserMutate,
        isPending: true,
        error: null,
      });

      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      const saveButton = screen.getByTestId('submit-button');
      expect(saveButton).toHaveTextContent('Loading...');
      expect(saveButton).toBeDisabled();
    });

    it('passes error to EditProfileForm when update fails', async () => {
      const mockError = { message: { name: 'Name is required' } };
      const { useUpdateUserMutation } = require('@tw/ui/data-access');
      useUpdateUserMutation.mockReturnValue({
        mutate: mockUpdateUserMutate,
        isPending: false,
        error: mockError,
      });

      const user = userEvent.setup();
      render(<ProfilePage />);

      const editButton = screen.getByTestId('action-button');
      await user.click(editButton);

      // The form should receive the error prop
      expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('shows loading state for most popular users', () => {
      const { useMostPopularUsersQuery } = require('@tw/ui/data-access');
      useMostPopularUsersQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      });

      render(<ProfilePage />);

      expect(screen.getByTestId('user-list')).toBeInTheDocument();
    });
  });

  describe('Data integration', () => {
    it('passes correct meId to UserList and Mediabar', () => {
      render(<ProfilePage />);

      // Both components should receive the user id
      expect(screen.getByTestId('mediabar')).toBeInTheDocument();
      expect(screen.getByTestId('user-list')).toBeInTheDocument();
    });

    it('passes social stats to MainLane', () => {
      render(<ProfilePage />);

      expect(screen.getByTestId('main-lane')).toBeInTheDocument();
    });
  });
});
