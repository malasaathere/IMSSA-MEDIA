import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <div className="settings-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="projects-header">
        <h1 className="gradient-text">Settings</h1>
        <p>Manage your account preferences and notifications.</p>
      </div>

      <div className="settings-grid grid-cols-2">
        <div className="glass-card panel">
          <h3><User size={20} /> Profile Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="glass-input" defaultValue={user?.name} readOnly />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" className="glass-input" defaultValue={user?.email} readOnly />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Role</label>
              <input type="text" className="glass-input" defaultValue={user?.role} style={{ textTransform: 'capitalize' }} readOnly />
            </div>
          </div>
        </div>

        <div className="glass-card panel">
          <h3><Bell size={20} /> Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Email Notifications for Revisions</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Push Notifications for New Assignments</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Daily Summary Email</span>
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card panel" style={{ marginTop: '1rem' }}>
        <h3><Shield size={20} /> Account Actions</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Manage your session securely.</p>
        <button className="btn btn-danger" onClick={logout} style={{ width: 'fit-content' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
