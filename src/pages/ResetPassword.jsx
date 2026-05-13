import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, Camera, CheckCircle, AlertCircle } from 'lucide-react';
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
    try {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));

      // Check if Supabase returned an error in the URL (e.g. expired link)
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');

      if (errorCode) {
        if (errorCode === 'otp_expired') {
          setErrorMsg('This reset link has expired. Please go back and request a new one.');
        } else {
          setErrorMsg(errorDesc?.replace(/\+/g, ' ') || 'Invalid reset link. Please request a new one.');
        }
        setChecking(false);
        return;
      }

      // Check if this is a valid recovery link
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (type === 'recovery' && accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              setErrorMsg('This reset link has expired. Please request a new one.');
            } else {
              setValidSession(true);
            }
            setChecking(false);
          })
          .catch(() => {
            setErrorMsg('Something went wrong. Please request a new reset link.');
            setChecking(false);
          });
      } else {
        setErrorMsg('Invalid reset link. Please go back and request a new one from the login page.');
        setChecking(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
      setChecking(false);
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
      await supabase.auth.signOut();
      setSuccessMsg("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
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

        {checking ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            Verifying reset link...
          </p>
        ) : (
          <>
            {errorMsg && (
              <div className="auth-alert error" style={{ marginTop: '1rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} /> {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success" style={{ marginTop: '1rem' }}>
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            {validSession && !successMsg && (
              <form onSubmit={handleReset} className="login-form" style={{ marginTop: '1rem' }}>
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
            )}
          </>
        )}

        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
          <p>
            <button type="button" className="link-btn" onClick={() => navigate('/login')}>
              ← Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
