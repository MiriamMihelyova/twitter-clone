//ProfilePage

import { UserResponseDto } from '@tw/data';
import { colors } from '@tw/ui/assets';
import { ParsedError, invProfilePage } from '@tw/ui/common';
import {
  EditProfileForm,
  MainLane,
  Mediabar,
  Modal,
  SecondaryButton,
  Sidebar,
  Trends,
  UpdateUserFormData,
  UserLIst,
} from '@tw/ui/components';
import {
  useMostPopularUsersQuery,
  useSocialStatsQuery,
  useUpdateUserMutation,
  useUserQuery,
} from '@tw/ui/data-access';
import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';

const UPDATE_USER_FORM_ID = uuid();

type ProfileActionsProps = {
  onClick: () => void;
};

const ProfileActions = memo<ProfileActionsProps>(({ onClick }) => (
  <EditProfileButton onClick={onClick}>Edit profile</EditProfileButton>
));

type ProfileModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserResponseDto;
  error: ParsedError;
  isSubmitting: boolean;
  onSubmitUpdateUser: (data: UpdateUserFormData) => void;
};

const ProfileModal = memo<ProfileModalProps>(
  ({ isOpen, setIsOpen, user, error, isSubmitting, onSubmitUpdateUser }) => {
    return (
      <Modal
        modalIsOpen={isOpen}
        setModalIsOpen={setIsOpen}
        actionsContentAlinement="space-between"
        hasCloseButton
        actionsPositionSticky
        heightFixed
        actions={[
          <Text key="title">Edit profile</Text>,
          <EditProfileButton
            key="save"
            $width={5}
            type="submit"
            form={UPDATE_USER_FORM_ID}
            loading={isSubmitting}
          >
            save
          </EditProfileButton>,
        ]}
      >
        <EditProfileForm
          user={user}
          error={error}
          formId={UPDATE_USER_FORM_ID}
          onSubmitUpdateUser={onSubmitUpdateUser}
        />
      </Modal>
    );
  },
);

export const ProfilePage = memo(() => {
  const { data: user } = useUserQuery() as { data: UserResponseDto };
  const { data: socialStats } = useSocialStatsQuery();
  const { data: mostPopularUsers, isFetching: isMostPopularUsersLoading } =
    useMostPopularUsersQuery();

  const { mutate: updateUserMutate, isPending: updateUserLoading, error } = useUpdateUserMutation();

  const { name, uniqueName, avatar } = user ?? ({} as UserResponseDto);
  const updateUserErrorMessage: ParsedError = error?.message as ParsedError;

  const [isEditProfileModalOpen, setEditModalProfileOpen] = useState(false);

  const onSubmitUpdateUser = useCallback(
    (userFormData: UpdateUserFormData) => {
      updateUserMutate(userFormData);
    },
    [updateUserMutate],
  );

  const openEditProfileModal = useCallback(() => {
    setEditModalProfileOpen(true);
  }, []);

  const invData = useMemo(() => invProfilePage(), []);

  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <Sidebar name={name} uniqueName={uniqueName} avatar={avatar} />

      <MainLane
        user={user}
        socialStats={socialStats}
        profileActions={<ProfileActions onClick={openEditProfileModal} />}
        profileModal={
          <ProfileModal
            isOpen={isEditProfileModalOpen}
            setIsOpen={setEditModalProfileOpen}
            user={user}
            error={updateUserErrorMessage}
            isSubmitting={updateUserLoading}
            onSubmitUpdateUser={onSubmitUpdateUser}
          />
        }
      />

      <Mediabar
        meId={user.id}
        topWindowChilde={
          <UserLIst
            meId={user.id}
            title="You might like"
            userList={mostPopularUsers}
            userListLoading={isMostPopularUsersLoading}
            showBio={false}
            invData={invData}
          />
        }
        bottomWindowChilde={<Trends />}
      />
    </PageWrapper>
  );
});

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const EditProfileButton = styled(SecondaryButton)`
  color: ${colors.grayPrimary};
  height: 2.286rem;
  padding: 0 16px;
`;

const Text = styled.span`
  color: ${colors.grayPrimary};
  font-weight: 700;
  font-size: large;
`;
