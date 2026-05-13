import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register, resetPassword } = useAuth();
  const [viewState, setViewState] = useState('login'); // 'login', 'register', 'forgot'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('+94');

  const handleWhatsappChange = (e) => {
    const val = e.target.value;
    if (val.startsWith('+94')) {
      setWhatsapp(val);
    } else if (val === '+9' || val === '+' || val === '') {
      setWhatsapp('+94');
    }
  };

  const switchView = (view) => {
    setErrorMsg('');
    setSuccessMsg('');
    setViewState(view);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (viewState === 'register') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match!");
        }
        await register(email, password, username, name, whatsapp);
        setSuccessMsg("Registration successful! You can now log in.");
        switchView('login');
      } else if (viewState === 'forgot') {
        await resetPassword(forgotEmail);
        setSuccessMsg("Password reset email sent! Check your inbox and follow the link to set a new password.");
      } else {
        await login(username, password);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred.');
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
          <p>
            {viewState === 'register' && 'Create your account'}
            {viewState === 'login' && 'Welcome back, please log in'}
            {viewState === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {errorMsg && (
          <div className="auth-alert error">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">

          {/* --- FORGOT PASSWORD VIEW --- */}
          {viewState === 'forgot' && (
            <div className="input-group animate-fade-in">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                className="glass-input"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
          )}

          {/* --- REGISTER VIEW EXTRA FIELDS --- */}
          {viewState === 'register' && (
            <>
              <div className="input-group animate-fade-in">
                <User size={20} className="input-icon" />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                  minLength={3}
                />
              </div>
              <div className="input-group animate-fade-in">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  className="glass-input" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group animate-fade-in">
                <Phone size={20} className="input-icon" />
                <input 
                  type="tel" 
                  className="glass-input" 
                  placeholder="WhatsApp Number (+94...)" 
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  required 
                  pattern="^\+94\d{9}$"
                  title="Phone number must start with +94 followed by 9 digits."
                />
              </div>
            </>
          )}

          {/* --- LOGIN & REGISTER SHARED FIELDS --- */}
          {viewState !== 'forgot' && (
            <>
              <div className="input-group animate-fade-in">
                <User size={20} className="input-icon" />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group animate-fade-in">
                <Lock size={20} className="input-icon" />
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="Password (min 6 chars)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>
            </>
          )}

          {viewState === 'register' && (
            <div className="input-group animate-fade-in">
              <Lock size={20} className="input-icon" />
              <input 
                type="password" 
                className="glass-input" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength={6}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (
              viewState === 'register' ? 'Register' :
              viewState === 'forgot' ? 'Send Reset Link' : 'Log In'
            )}
          </button>
        </form>

        <div className="login-footer">
          {/* Forgot Password link — shown only on login view */}
          {viewState === 'login' && (
            <p>
              <button type="button" className="link-btn" onClick={() => switchView('forgot')}>
                Forgot your password?
              </button>
            </p>
          )}

          {/* Toggle between Login and Register */}
          {viewState !== 'forgot' && (
            <p>
              {viewState === 'register' ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                className="link-btn" 
                onClick={() => switchView(viewState === 'login' ? 'register' : 'login')}
              >
                {viewState === 'register' ? 'Log In' : 'Register'}
              </button>
            </p>
          )}

          {/* Back to Login from Forgot view */}
          {viewState === 'forgot' && (
            <p>
              <button type="button" className="link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => switchView('login')}>
                <ArrowLeft size={14} /> Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
