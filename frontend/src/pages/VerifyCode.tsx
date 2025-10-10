import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { authAPI } from '../api/client';

export const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !code) {
      setError('Email and code are required');
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyCode({ email, code });
      const { resetToken } = response.data;
      
      navigate('/reset-password', { state: { resetToken } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Verify Code
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to your email.
          <br />
          <span className="text-xs text-blue-600">(Check the backend console in DEV mode)</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              6-Digit Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            to="/forgot-password"
            className="block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Resend code
          </Link>
          <Link to="/login" className="block text-sm text-gray-600 hover:text-gray-800">
            ← Back to login
          </Link>
        </div>
      </div>
    </Layout>
  );
};
