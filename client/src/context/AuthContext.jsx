import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../features/authentication/services/authApi.js';
import { setInMemoryToken, setSessionExpiredCallback } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChallenge, setPendingChallenge] = useState(null);

  // Helper to sync token in memory
  const updateAccessToken = useCallback((token) => {
    setAccessTokenState(token);
    setInMemoryToken(token);
  }, []);

  // Clear state on logout or expired session
  const clearAuth = useCallback(() => {
    setUser(null);
    updateAccessToken(null);
    setPendingChallenge(null);
  }, [updateAccessToken]);

  // Handle session expiration from axios interceptor
  useEffect(() => {
    setSessionExpiredCallback(() => {
      clearAuth();
    });
  }, [clearAuth]);

  // Session restoration on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt silent token refresh via HttpOnly cookie
        const res = await authApi.refresh();
        if (res.success && res.data?.accessToken) {
          updateAccessToken(res.data.accessToken);
          setUser(res.data.user);
        }
      } catch (err) {
        // Refresh token not present or expired: user remains unauthenticated
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [updateAccessToken, clearAuth]);

  /**
   * Action: Register new account
   */
  const register = async ({ name, email, password, confirmPassword, phone }) => {
    const res = await authApi.register({ name, email, password, confirmPassword, phone });
    if (res.success && res.data?.challengeId) {
      setPendingChallenge({
        challengeId: res.data.challengeId,
        email: res.data.email,
        name: res.data.name,
        purpose: 'EMAIL_VERIFICATION',
      });
    }
    return res;
  };

  /**
   * Action: Verify email OTP
   */
  const verifyEmailOTP = async (otp) => {
    if (!pendingChallenge?.challengeId) {
      throw new Error('No pending verification challenge found.');
    }
    const res = await authApi.verifyOTP({
      challengeId: pendingChallenge.challengeId,
      otp,
    });
    if (res.success) {
      setPendingChallenge(null);
    }
    return res;
  };

  /**
   * Action: Resend OTP
   */
  const resendOTP = async () => {
    const email = pendingChallenge?.email;
    if (!email) {
      throw new Error('No email found for resending code.');
    }
    const res = await authApi.resendOTP({ email });
    if (res.success && res.data?.challengeId) {
      setPendingChallenge((prev) => ({
        ...prev,
        challengeId: res.data.challengeId,
      }));
    }
    return res;
  };

  /**
   * Action: Login Step 1 (Credentials verification)
   */
  const login = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.challengeId) {
      setPendingChallenge({
        challengeId: res.data.challengeId,
        email: res.data.email,
        purpose: 'LOGIN',
      });
    }
    return res;
  };

  /**
   * Action: Login Step 2 (Login OTP verification & session creation)
   */
  const verifyLoginOTP = async (otp) => {
    if (!pendingChallenge?.challengeId) {
      throw new Error('No pending login challenge found. Please sign in again.');
    }

    const res = await authApi.verifyLoginOTP({
      challengeId: pendingChallenge.challengeId,
      otp,
    });

    if (res.success && res.data?.accessToken) {
      updateAccessToken(res.data.accessToken);
      setUser(res.data.user);
      setPendingChallenge(null);
    }

    return res;
  };

  /**
   * Action: Request password reset OTP
   */
  const forgotPassword = async (email) => {
    const res = await authApi.forgotPassword({ email });
    if (res.success && res.data?.challengeId) {
      setPendingChallenge({
        challengeId: res.data.challengeId,
        email,
        purpose: 'PASSWORD_RESET',
      });
    }
    return res;
  };

  /**
   * Action: Verify reset OTP and obtain reset grant
   */
  const verifyResetOTP = async (otp) => {
    if (!pendingChallenge?.challengeId) {
      throw new Error('No pending reset challenge found.');
    }

    const res = await authApi.verifyResetOTP({
      challengeId: pendingChallenge.challengeId,
      otp,
    });

    return res; // returns { data: { userId, resetGrant } }
  };

  /**
   * Action: Reset password with grant
   */
  const resetPassword = async ({ userId, resetGrant, newPassword, confirmPassword }) => {
    const res = await authApi.resetPassword({
      userId,
      resetGrant,
      newPassword,
      confirmPassword,
    });
    if (res.success) {
      setPendingChallenge(null);
    }
    return res;
  };

  /**
   * Action: Logout current session
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue client cleanup even if network request fails
    } finally {
      clearAuth();
    }
  };

  /**
   * Action: Logout from all devices
   */
  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } catch (err) {
      // Continue client cleanup
    } finally {
      clearAuth();
    }
  };

  /**
   * Manually refresh profile (e.g. after role or profile changes)
   */
  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    pendingChallenge,
    setPendingChallenge,
    register,
    verifyEmailOTP,
    resendOTP,
    login,
    verifyLoginOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    logout,
    logoutAll,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
