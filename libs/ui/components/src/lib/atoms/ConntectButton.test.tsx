import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConnectButton } from './ConnectButton';

// Mock dependencies
const mockFollow = jest.fn().mockResolvedValue({ status: true });
const mockUnfollow = jest.fn().mockResolvedValue({ status: true });

// Mock hooks
jest.mock('@tw/ui/data-access', () => ({
  useFollowMutation: () => ({ mutateAsync: mockFollow }),
  useUnFollowMutation: () => ({ mutateAsync: mockUnfollow }),
}));

// Mock InvalidationData
const mockInvData = {
  follow: jest.fn(),
  unFollow: jest.fn(),
  followIfPublicUser: jest.fn(),
  unFollowIfPublicUser: jest.fn(),
};

describe('ConnectButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render if meId equals buttonRelatedUserId', () => {
    const { container } = render(
      <ConnectButton
        meId="123"
        buttonRelatedUserId="123"
        followingStatus={false}
        invData={mockInvData as any}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Follow" when user is not following', () => {
    render(
      <ConnectButton
        meId="1"
        buttonRelatedUserId="2"
        followingStatus={false}
        invData={mockInvData as any}
      />,
    );
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('renders "Following" when user is following', () => {
    render(
      <ConnectButton
        meId="1"
        buttonRelatedUserId="2"
        followingStatus={true}
        invData={mockInvData as any}
      />,
    );
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('renders "UnFollow" when hovered and user is following', () => {
    render(
      <ConnectButton
        meId="1"
        buttonRelatedUserId="2"
        followingStatus={true}
        invData={mockInvData as any}
      />,
    );
    const button = screen.getByText('Following');
    fireEvent.mouseEnter(button);
    expect(screen.getByText('UnFollow')).toBeInTheDocument();
  });

  it('calls followMutation and invData.follow when clicked (follow case)', async () => {
    render(
      <ConnectButton
        meId="1"
        buttonRelatedUserId="2"
        followingStatus={false}
        invData={mockInvData as any}
      />,
    );
    const button = screen.getByText('Follow');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFollow).toHaveBeenCalledWith({ userId: '2' });
      expect(mockInvData.follow).toHaveBeenCalled();
    });
  });

  it('calls unFollowMutation and invData.unFollow when clicked (unfollow case)', async () => {
    render(
      <ConnectButton
        meId="1"
        buttonRelatedUserId="2"
        followingStatus={true}
        invData={mockInvData as any}
      />,
    );
    const button = screen.getByText('Following');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockUnfollow).toHaveBeenCalledWith({ userId: '2' });
      expect(mockInvData.unFollow).toHaveBeenCalled();
    });
  });
});
