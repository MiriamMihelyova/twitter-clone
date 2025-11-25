/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';
import { PublicUserBase } from '@tw/data';
import { InvalidationData } from '@tw/ui/common';
import { SingleUser } from './SingleUser';

// Mock dependencies
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('@tippyjs/react', () => {
  return function Tippy({ children, content }: any) {
    return (
      <div>
        {children}
        {content && <div data-testid="tippy-content">{content}</div>}
      </div>
    );
  };
});

jest.mock('@tw/ui/components', () => ({
  ConnectButton: ({ buttonRelatedUserId, followingStatus }: any) => (
    <button data-testid="connect-button" data-user-id={buttonRelatedUserId}>
      {followingStatus ? 'Following' : 'Follow'}
    </button>
  ),
  ProfilePreview: ({ displayedUser }: any) => (
    <div data-testid="profile-preview">{displayedUser.name} Preview</div>
  ),
}));

jest.mock('@tw/ui/common', () => ({
  ...jest.requireActual('@tw/ui/common'),
  linksRecords: {
    profilePage: {
      base: '/profile',
    },
    publicProfilePage: {
      baseById: (id: string) => `/user/${id}`,
    },
  },
}));

describe('SingleUser', () => {
  const mockInvData = {} as InvalidationData;

  const mockUser: PublicUserBase = {
    id: 'user-123',
    name: 'John Doe',
    uniqueName: '@johndoe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about coding',
    location: 'New York',
    website: 'https://johndoe.com',
    cover: 'https://example.com/cover.jpg',
    email: 'john@example.com',
    followingStatus: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    buttonRelatedUser: mockUser,
    meId: 'me-456',
    invData: mockInvData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User information rendering', () => {
    it('renders user name correctly', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders user uniqueName correctly', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByText('@johndoe')).toBeInTheDocument();
    });

    it('renders user bio when showBio is true', () => {
      render(<SingleUser {...defaultProps} showBio={true} />);

      expect(screen.getByText('Software developer passionate about coding')).toBeInTheDocument();
    });

    it('does not render bio when showBio is false', () => {
      render(<SingleUser {...defaultProps} showBio={false} />);

      expect(
        screen.queryByText('Software developer passionate about coding'),
      ).not.toBeInTheDocument();
    });

    it('renders bio by default when showBio prop is not provided', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByText('Software developer passionate about coding')).toBeInTheDocument();
    });

    it('renders user with empty bio', () => {
      const userWithoutBio: PublicUserBase = {
        ...mockUser,
        bio: '',
      };

      render(<SingleUser {...defaultProps} buttonRelatedUser={userWithoutBio} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('ConnectButton rendering', () => {
    it('renders ConnectButton when showConnectButton is true', () => {
      render(<SingleUser {...defaultProps} showConnectButton={true} />);

      expect(screen.getByTestId('connect-button')).toBeInTheDocument();
    });

    it('does not render ConnectButton when showConnectButton is false', () => {
      render(<SingleUser {...defaultProps} showConnectButton={false} />);

      expect(screen.queryByTestId('connect-button')).not.toBeInTheDocument();
    });

    it('renders ConnectButton by default when prop is not provided', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByTestId('connect-button')).toBeInTheDocument();
    });

    it('passes correct followingStatus to ConnectButton', () => {
      const followingUser: PublicUserBase = {
        ...mockUser,
        followingStatus: true,
      };

      render(<SingleUser {...defaultProps} buttonRelatedUser={followingUser} />);

      expect(screen.getByTestId('connect-button')).toHaveTextContent('Following');
    });

    it('passes correct user id to ConnectButton', () => {
      render(<SingleUser {...defaultProps} />);

      const button = screen.getByTestId('connect-button');
      expect(button).toHaveAttribute('data-user-id', 'user-123');
    });
  });

  describe('ProfilePreview rendering', () => {
    it('renders ProfilePreview when showUserPreview is true', () => {
      render(<SingleUser {...defaultProps} showUserPreview={true} />);

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument();
      expect(screen.getByText('John Doe Preview')).toBeInTheDocument();
    });

    it('does not render ProfilePreview when showUserPreview is false', () => {
      render(<SingleUser {...defaultProps} showUserPreview={false} />);

      expect(screen.queryByTestId('profile-preview')).not.toBeInTheDocument();
    });

    it('renders ProfilePreview by default when prop is not provided', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument();
    });

    it('ProfilePreview receives correct user data', () => {
      render(<SingleUser {...defaultProps} />);

      expect(screen.getByText('John Doe Preview')).toBeInTheDocument();
    });
  });

  describe('Navigation functionality', () => {
    it('navigates to own profile page when clicking on own user', () => {
      const { container } = render(<SingleUser {...defaultProps} meId="user-123" />);

      const wrapper = container.firstChild as HTMLElement;
      fireEvent.click(wrapper);

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('navigates to public profile page when clicking on other user', () => {
      const { container } = render(<SingleUser {...defaultProps} meId="me-456" />);

      const wrapper = container.firstChild as HTMLElement;
      fireEvent.click(wrapper);

      expect(mockNavigate).toHaveBeenCalledWith('/user/user-123');
    });

    it('navigates with correct user id for public profile', () => {
      const differentUser: PublicUserBase = {
        ...mockUser,
        id: 'different-user-789',
      };

      const { container } = render(
        <SingleUser {...defaultProps} buttonRelatedUser={differentUser} meId="me-456" />,
      );

      const wrapper = container.firstChild as HTMLElement;
      fireEvent.click(wrapper);

      expect(mockNavigate).toHaveBeenCalledWith('/user/different-user-789');
    });
  });

  describe('Props passing', () => {
    it('passes publicUserId to child components', () => {
      render(<SingleUser {...defaultProps} publicUserId="public-user-123" />);

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument();
      expect(screen.getByTestId('connect-button')).toBeInTheDocument();
    });

    it('passes invData to child components', () => {
      const customInvData = { key: 'test-key' } as any;

      render(<SingleUser {...defaultProps} invData={customInvData} />);

      expect(screen.getByTestId('profile-preview')).toBeInTheDocument();
      expect(screen.getByTestId('connect-button')).toBeInTheDocument();
    });
  });

  describe('Styling and layout', () => {
    it('renders profile image wrapper', () => {
      render(<SingleUser {...defaultProps} />);

      const textWrapper = screen.getByText('John Doe').parentElement;
      const profileImage = textWrapper?.previousElementSibling;

      expect(profileImage).toBeInTheDocument();
    });

    it('renders all main wrapper elements', () => {
      const { container } = render(<SingleUser {...defaultProps} />);

      const wrapper = container.querySelector('div');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Different user states', () => {
    it('renders user without avatar', () => {
      const userWithoutAvatar: PublicUserBase = {
        ...mockUser,
        avatar: '',
      };

      render(<SingleUser {...defaultProps} buttonRelatedUser={userWithoutAvatar} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Combined prop scenarios', () => {
    it('renders with all features disabled', () => {
      render(
        <SingleUser
          {...defaultProps}
          showBio={false}
          showConnectButton={false}
          showUserPreview={false}
        />,
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(
        screen.queryByText('Software developer passionate about coding'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('connect-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('profile-preview')).not.toBeInTheDocument();
    });

    it('renders with all features enabled', () => {
      render(
        <SingleUser
          {...defaultProps}
          showBio={true}
          showConnectButton={true}
          showUserPreview={true}
        />,
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText('Software developer passionate about coding')).toBeInTheDocument();
      expect(screen.getByTestId('connect-button')).toBeInTheDocument();
      expect(screen.getByTestId('profile-preview')).toBeInTheDocument();
    });
  });
});
