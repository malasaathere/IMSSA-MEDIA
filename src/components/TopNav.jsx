import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TopNav.css';

const TopNav = () => {
  const { user, switchRole } = useAuth();

  return (
    <header className="topnav glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search projects, events, or members..." className="glass-input search-input" />
      </div>

      <div className="topnav-actions">
        {/* Role Switcher (For Dev/Demo Purposes) */}
        <select 
          className="glass-input role-switcher" 
          value={user?.role} 
          onChange={(e) => switchRole(e.target.value)}
        >
          <option value="admin">Admin View</option>
          <option value="member">Designer View</option>
          <option value="viewer">Viewer View</option>
        </select>

        <button className="btn-icon notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
