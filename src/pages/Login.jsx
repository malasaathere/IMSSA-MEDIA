import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isRegistering) {
        await register(email, password, username, name, whatsapp);
        setSuccessMsg("Registration successful! Please check your email/WhatsApp for the OTP verification link before logging in.");
        setIsRegistering(false); // flip back to login
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
          <p>{isRegistering ? 'Create your account' : 'Welcome back, please log in'}</p>
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
          {isRegistering && (
            <>
              <div className="input-group">
                <User size={20} className="input-icon" />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
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
              <div className="input-group">
                <Phone size={20} className="input-icon" />
                <input 
                  type="tel" 
                  className="glass-input" 
                  placeholder="WhatsApp Number" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required 
                />
              </div>
            </>
          )}

          <div className="input-group">
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

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Log In')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="link-btn" 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Log In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
