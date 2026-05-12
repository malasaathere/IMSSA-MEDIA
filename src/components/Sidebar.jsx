import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Image as ImageIcon, Calendar as CalendarIcon, Settings as SettingsIcon, LogOut, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { profile, logout } = useAuth();

  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin' || profile?.role === 'Event Coordinator';

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-logo">
        <div className="logo-icon"></div>
        <h2>Evaluvate</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <CheckSquare size={20} />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/evaluate" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ImageIcon size={20} />
          <span>Evaluate</span>
        </NavLink>
        <NavLink to="/chat" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <MessageCircle size={20} />
          <span>Chat</span>
        </NavLink>
        <NavLink to="/calendar" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar"></div>
          <div className="user-info">
            <p className="user-name">{profile?.name || 'User'}</p>
            <p className="user-role">{profile?.role || 'Member'}</p>
          </div>
        </div>
        
        <NavLink to="/settings" className="nav-item">
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
        
        <button onClick={logout} className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
