import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/client';

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const Protected = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userAPI.getMe();
        setUserData(response.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded mb-4">
            {error}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userData?.name || user?.name}! 🎉
          </h2>
          <p className="text-sm text-gray-500">
            You are now in the protected area
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-lg text-gray-900">{userData?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-lg text-gray-900">{userData?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Member Since</label>
            <p className="mt-1 text-lg text-gray-900">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">User ID</label>
            <p className="mt-1 text-sm text-gray-600 font-mono">{userData?.id}</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};
