import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const merged = searchParams.get('merged');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=' + encodeURIComponent(error));
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));

          // Store auth data using the AuthContext
          login(user, token);

          // Show success message if accounts were merged
          if (merged === 'true') {
            // You can add a toast notification here
            console.log('Accounts merged successfully');
          }

          // Redirect to dashboard
          navigate('/app');
        } catch (err) {
          console.error('Failed to parse user data:', err);
          navigate('/login?error=Authentication failed');
        }
      } else {
        navigate('/login?error=Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
