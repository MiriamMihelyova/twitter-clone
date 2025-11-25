/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';
import { PublicUserBase } from '@tw/data';
import { InvalidationData } from '@tw/ui/common';
import { SingleUser } from './SingleUser';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock ConnectButton
jest.mock('../atoms/ConnectButton', () => ({
  ConnectButton: ({ buttonRelatedUserId, followingStatus }: any) => (
    <button data-testid="connect-button" data-user-id={buttonRelatedUserId}>
      {followingStatus ? 'Following' : 'Follow'}
    </button>
  ),
}));

describe('SingleUser', () => {
  const mockInvData = {} as InvalidationData;

  const mockUser: PublicUserBase = {
    id: 'user-123',
    name: 'John Doe',
    uniqueName: '@johndoe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about coding',
    location: '',
    website: '',
    cover: '',
    email: '',
    followingStatus: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    buttonRelatedUser: mockUser,
    meId: 'me-456',
    invData: mockInvData,
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders user name', () => {
    render(<SingleUser {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders uniqueName', () => {
    render(<SingleUser {...defaultProps} />);
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('renders bio when showBio is true', () => {
    render(<SingleUser {...defaultProps} showBio={true} />);
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
  });

  it('does not render bio when showBio is false', () => {
    render(<SingleUser {...defaultProps} showBio={false} />);
    expect(screen.queryByText(mockUser.bio)).not.toBeInTheDocument();
  });

  it('renders bio by default', () => {
    render(<SingleUser {...defaultProps} />);
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
  });

  it('renders ConnectButton by default', () => {
    render(<SingleUser {...defaultProps} />);
    expect(screen.getByTestId('connect-button')).toBeInTheDocument();
  });

  it('hides ConnectButton when showConnectButton is false', () => {
    render(<SingleUser {...defaultProps} showConnectButton={false} />);
    expect(screen.queryByTestId('connect-button')).not.toBeInTheDocument();
  });

  it('passes correct user id to ConnectButton', () => {
    render(<SingleUser {...defaultProps} />);
    expect(screen.getByTestId('connect-button')).toHaveAttribute('data-user-id', 'user-123');
  });

  it('navigates to profile when clicking self', () => {
    const { container } = render(
      <SingleUser {...defaultProps} meId="user-123" />, // same user
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigates to public profile for others', () => {
    const { container } = render(<SingleUser {...defaultProps} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(mockNavigate).toHaveBeenCalledWith('/public-profile/user-123');
  });

  it('renders avatar wrapper', () => {
    const { container } = render(<SingleUser {...defaultProps} />);
    const avatarWrapper = container.querySelector('div');
    expect(avatarWrapper).toBeInTheDocument();
  });
});
