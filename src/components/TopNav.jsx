import React from 'react';
import { Bell, Search, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

const TopNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topnav glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search projects..." className="glass-input search-input" />
      </div>

      <div className="topnav-actions">
        <button className="btn-icon notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="btn-icon mobile-only-btn" onClick={() => navigate('/settings')}>
          <SettingsIcon size={20} />
        </button>
        <button className="btn-icon mobile-only-btn text-danger" onClick={logout} style={{ color: 'var(--accent-danger)' }}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
