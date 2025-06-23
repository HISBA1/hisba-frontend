import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.replace('/login');
      }
    }, [status, router]);

    if (status === 'loading') {
      return <p>Loading...</p>;
    }

    if (status === 'authenticated') {
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  // إضافة displayName للكومبوننت الجديد
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
