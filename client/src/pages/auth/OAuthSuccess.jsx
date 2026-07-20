import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

const ROLE_REDIRECTS = { student: '/student', warden: '/warden', admin: '/admin' };
const FRONTEND_ORIGIN = process.env.REACT_APP_FRONTEND_ORIGIN;

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');

    // When OAuth was opened from the login page, return the result to that
    // page and close this temporary window.
    if (window.opener && !window.opener.closed) {
      if (token) {
        window.opener.postMessage(
          { type: 'HOSTELOS_GOOGLE_OAUTH', token },
          FRONTEND_ORIGIN
        );
      } else {
        window.opener.postMessage(
          { type: 'HOSTELOS_GOOGLE_OAUTH', error: error || 'Google sign-in failed' },
          FRONTEND_ORIGIN
        );
      }
      window.close();
      return;
    }

    if (!token) {
      navigate(`/login?error=${encodeURIComponent(error || 'oauth_failed')}`);
      return;
    }

    const completeLogin = async () => {
      try {
        const user = await loginWithToken(token);
        navigate(ROLE_REDIRECTS[user.role || role] || '/login');
      } catch {
        navigate('/login?error=oauth_failed');
      }
    };

    completeLogin();
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader text="Signing you in..." />
    </div>
  );
};

export default OAuthSuccess;
