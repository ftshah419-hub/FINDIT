import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xl border border-outline-variant/30 dark:border-outline/20 p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-2xl shadow-md">
            F
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-on-surface tracking-tight">FINDIT</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-semibold uppercase tracking-wider">
              ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-xs">
            Sign in with your verified staff or administrator credentials to manage custody depots and moderation queues.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-xs text-on-error-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Campus Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campus.edu"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Sign In to Admin Console</span>
              </>
            )}
          </button>
        </form>

        {/* Pre-fill Demo Hint */}
        <div className="p-3 rounded-xl bg-surface-container-low dark:bg-surface-container/60 text-xs text-on-surface-variant flex flex-col gap-1 border border-outline-variant/20">
          <div className="flex items-center gap-1 font-semibold text-primary text-[11px]">
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>Pre-configured Superadmin Account:</span>
          </div>
          <div className="font-code-tabular text-[11px]">Email: admin@campus.edu</div>
          <div className="font-code-tabular text-[11px]">Password: Admin@123</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
