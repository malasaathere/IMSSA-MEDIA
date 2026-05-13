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

  useEffect(() => {
    // Supabase will automatically parse the token from the URL hash
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });
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

        {!validSession ? (
          <div className="auth-alert error" style={{ marginTop: '1rem' }}>
            Invalid or expired reset link. Please request a new one from the login page.
          </div>
        ) : (
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
        )}

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
