import React from 'react';
import { Bell, Search } from 'lucide-react';
import './TopNav.css';

const TopNav = () => {
  return (
    <header className="topnav glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search projects, events, or members..." className="glass-input search-input" />
      </div>

      <div className="topnav-actions">
        <button className="btn-icon notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
