import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, Camera, CheckCircle } from 'lucide-react';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash as:
    // #access_token=xxx&refresh_token=xxx&type=recovery
    // We need to detect this and establish the session
    const hash = window.location.hash;

    if (hash && hash.includes('type=recovery')) {
      // Parse the tokens from the hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              setErrorMsg('Invalid or expired reset link. Please request a new one.');
            } else {
              setValidSession(true);
            }
            setChecking(false);
          });
      } else {
        setErrorMsg('Invalid reset link. Please request a new one from the login page.');
        setChecking(false);
      }
    } else {
      // Also check if there's already a PASSWORD_RECOVERY session active
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setValidSession(true);
        } else {
          setErrorMsg('Invalid or expired reset link. Please request a new one from the login page.');
        }
        setChecking(false);
      });
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut(); // Sign out after reset so they log in fresh
      setSuccessMsg("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box glass-card animate-fade-in">
        <div className="login-header">
          <div className="logo-icon flex-center">
            <Camera size={32} color="white" />
          </div>
          <h1 className="gradient-text">IMSSA Media</h1>
          <p>Set a new password</p>
        </div>

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {checking ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Verifying reset link...
          </p>
        ) : validSession ? (
          <form onSubmit={handleReset} className="login-form">
            <div className="input-group animate-fade-in">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                className="glass-input"
                placeholder="New Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="input-group animate-fade-in">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                className="glass-input"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        ) : null}

        <div className="login-footer">
          <p>
            <button type="button" className="link-btn" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
