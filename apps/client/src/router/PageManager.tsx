//PageManager

import { Loader } from '@tw/ui/components';
import { useAuthQuery } from '@tw/ui/data-access';
import { Navigate } from 'react-router-dom';
import { AccessRole } from './accessRole.type';

type PageManagerProps = {
  children: JSX.Element;
  accessRole: AccessRole;
};

export const PageManager = ({ children, accessRole }: PageManagerProps) => {
  const auth = useAuthQuery();

  const isAuth = !!auth.data?.id;
  const isLoading = auth.isFetching && !auth.data;

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!isAuth) {
    if (accessRole === AccessRole.Public) {
      return children;
    }
    if (accessRole === AccessRole.Private) {
      return <Navigate to="/" />;
    }
  }

  // 3) ak som prihlásená
  if (isAuth) {
    if (accessRole === AccessRole.Private) {
      return children;
    }
    if (accessRole === AccessRole.Public) {
      return <Navigate to="/home" />;
    }
  }

  return null;
};
