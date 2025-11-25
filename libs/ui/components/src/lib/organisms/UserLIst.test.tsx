/* eslint-env jest */
import { act, render, screen, waitFor } from '@testing-library/react';
import { FollowerListResponseDto } from '@tw/data';
import { InvalidationData } from '@tw/ui/common';
import { UserLIst } from './UserLIst';

// Mock dependencies
jest.mock('../atoms/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('../molecules/SingleUser', () => ({
  SingleUser: ({ buttonRelatedUser }: { buttonRelatedUser: FollowerListResponseDto }) => (
    <div data-testid={`single-user-${buttonRelatedUser.id}`}>{buttonRelatedUser.name}</div>
  ),
}));

describe('UserLIst', () => {
  const mockInvData = {} as InvalidationData;

  const mockUsers: FollowerListResponseDto[] = [
    {
      id: '1',
      name: 'John Doe',
      uniqueName: '@johndoe',
      avatar: 'avatar1.jpg',
      bio: 'Software developer',
      location: 'New York',
      website: 'https://johndoe.com',
      cover: 'cover1.jpg',
      email: 'john@example.com',
      followingStatus: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      uniqueName: '@janesmith',
      avatar: 'avatar2.jpg',
      bio: 'Designer',
      location: 'London',
      website: 'https://janesmith.com',
      cover: 'cover2.jpg',
      email: 'jane@example.com',
      followingStatus: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    meId: 'me-123',
    userList: mockUsers,
    invData: mockInvData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Content rendering', () => {
    it('renders user list when data is provided', () => {
      render(<UserLIst {...defaultProps} />);

      expect(screen.getByTestId('single-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('single-user-2')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<UserLIst {...defaultProps} title="Followers" />);

      expect(screen.getByText('Followers')).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      const { container } = render(<UserLIst {...defaultProps} />);

      const title = container.querySelector('h2');
      expect(title).not.toBeInTheDocument();
    });

    it('renders empty list without errors', () => {
      render(<UserLIst {...defaultProps} userList={[]} />);

      expect(screen.queryByTestId('single-user-1')).not.toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('shows loader when loading in non-scrollable mode', () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={undefined}
          userListLoading={true}
          scrollable={false}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows loader when loading in scrollable mode', () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={mockUsers}
          userListLoading={true}
          scrollable={true}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('does not show loader when not loading', () => {
      render(<UserLIst {...defaultProps} userListLoading={false} scrollable={false} />);

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('shows both content and loader in scrollable mode when loading more', () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={mockUsers}
          userListLoading={true}
          scrollable={true}
          hasMoreData={true}
        />,
      );

      expect(screen.getByTestId('single-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('No data states', () => {
    it('shows no data message after delay in non-scrollable mode', async () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={[]}
          userListLoading={false}
          scrollable={false}
          noDataText="No users found"
        />,
      );

      // Should not be visible immediately
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();

      // Advance timers inside act() to flush effects
      act(() => {
        jest.runAllTimers();
      });

      // Wait for the element to appear
      await screen.findByText('No users found');

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('shows no data message in scrollable mode when no more data', async () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={mockUsers}
          userListLoading={false}
          scrollable={true}
          hasMoreData={false}
          noDataText="No more users"
        />,
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('No more users')).toBeInTheDocument();
      });
    });

    it('uses default no data text when not provided', async () => {
      render(
        <UserLIst {...defaultProps} userList={[]} userListLoading={false} scrollable={false} />,
      );

      act(() => {
        jest.runAllTimers();
      });
      await waitFor(() => {
        expect(screen.getByText('No matching data.')).toBeInTheDocument();
      });
    });

    it('does not show no data message when loading', () => {
      render(
        <UserLIst {...defaultProps} userList={[]} userListLoading={true} scrollable={false} />,
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(screen.queryByText('No matching data.')).not.toBeInTheDocument();
    });
  });

  describe('Props passing', () => {
    it('passes correct props to SingleUser components', () => {
      const { container } = render(
        <UserLIst
          {...defaultProps}
          publicUserId="public-123"
          showBio={true}
          showConnectButton={true}
          showUserPreview={true}
        />,
      );

      // Verify that SingleUser components are rendered
      expect(screen.getByTestId('single-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('single-user-2')).toBeInTheDocument();
    });

    it('renders all users in the list', () => {
      const largeUserList: FollowerListResponseDto[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `User ${i + 1}`,
        uniqueName: `@user${i + 1}`,
        avatar: `avatar${i + 1}.jpg`,
        bio: '',
        location: '',
        website: '',
        cover: '',
        email: `user${i + 1}@example.com`,
        followingStatus: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      render(<UserLIst {...defaultProps} userList={largeUserList} />);

      // Verify all users are rendered
      largeUserList.forEach((user) => {
        expect(screen.getByTestId(`single-user-${user.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles undefined userList', () => {
      render(<UserLIst {...defaultProps} userList={undefined} userListLoading={false} />);

      expect(screen.queryByTestId('single-user-1')).not.toBeInTheDocument();
    });

    it('handles loading state transition correctly', () => {
      const { rerender } = render(
        <UserLIst
          {...defaultProps}
          userList={undefined}
          userListLoading={true}
          scrollable={false}
        />,
      );

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      rerender(
        <UserLIst
          {...defaultProps}
          userList={mockUsers}
          userListLoading={false}
          scrollable={false}
        />,
      );

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
      expect(screen.getByTestId('single-user-1')).toBeInTheDocument();
    });

    it('shows content and "no more data" in scrollable mode when hasMoreData is false', async () => {
      render(
        <UserLIst
          {...defaultProps}
          userList={mockUsers}
          userListLoading={false}
          scrollable={true}
          hasMoreData={false}
        />,
      );

      expect(screen.getByTestId('single-user-1')).toBeInTheDocument();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('No matching data.')).toBeInTheDocument();
      });
    });
  });
});
