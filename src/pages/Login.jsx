import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Phone, CheckCircle, Key } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register, verifyOtp } = useAuth();
  const [viewState, setViewState] = useState('login'); // 'login', 'register', 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('+94');
  const [otpCode, setOtpCode] = useState('');

  const handleWhatsappChange = (e) => {
    const val = e.target.value;
    // Ensure it always starts with +94
    if (val.startsWith('+94')) {
      setWhatsapp(val);
    } else if (val === '+9' || val === '+' || val === '') {
      setWhatsapp('+94');
    }
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
        setSuccessMsg("Registration successful! An OTP has been sent to your email.");
        setViewState('otp');
      } else if (viewState === 'otp') {
        await verifyOtp(email, otpCode);
        setSuccessMsg("Verification successful! You can now log in.");
        setViewState('login');
      } else {
        await login(username, password);
        // App.jsx automatically unmounts this component on successful login
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
            {viewState === 'otp' && 'Enter Verification Code'}
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
          {viewState === 'otp' && (
            <div className="input-group animate-fade-in">
              <Key size={20} className="input-icon" />
              <input 
                type="text" 
                className="glass-input" 
                placeholder="6-Digit OTP Code" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required 
              />
            </div>
          )}

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

          {viewState !== 'otp' && (
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
              viewState === 'otp' ? 'Verify OTP' : 'Log In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {viewState === 'register' ? 'Already have an account?' : 
             viewState === 'otp' ? 'Did not receive code?' : "Don't have an account?"}
            <button 
              type="button" 
              className="link-btn" 
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setViewState(viewState === 'login' ? 'register' : 'login');
              }}
            >
              {viewState === 'register' ? 'Log In' : 
               viewState === 'otp' ? 'Back to Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
