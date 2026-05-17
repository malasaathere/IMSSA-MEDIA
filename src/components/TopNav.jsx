import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiClient';
import './TopNav.css';

const TopNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  return (
    <header className="topnav glass-panel">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search projects..." className="glass-input search-input" />
      </div>

      <div className="topnav-actions">
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button className="btn-icon notification-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-dot"></span>}
          </button>
          
          {showDropdown && (
            <div className="glass-card" style={{ position: 'absolute', top: '120%', right: 0, width: '300px', zIndex: 100, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>No new notifications.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>{n.title}</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
