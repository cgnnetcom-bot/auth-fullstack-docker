import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authAPI } from '../api/client';

import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
});
export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevCode(null);

    try {
      forgotPasswordSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setSuccess(true);
      setDevCode(response.data.code || null);
      setTimeout(() => {
        navigate('/verify-code', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your email to receive a reset code.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 text-red-400 rounded text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500/30 text-green-400 rounded text-center">
            Code sent! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </form>

        {devCode && (
          <div className="mt-6 p-4 bg-gray-900/50 text-white rounded-md font-mono text-xs">
            <p className="text-sm text-gray-400">[DEV CONSOLE]</p>
            <p>
              <span className="text-green-400">Reset code for </span>
              <span className="text-yellow-300">{email}</span>:
              <span className="font-bold text-lg ml-2 text-cyan-400">{devCode}</span>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-blue-400 hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
