import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ImagePlus, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Evaluate', path: '/evaluate', icon: ImagePlus, roles: ['admin'] },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="logo-placeholder"></div>
        <h2 className="gradient-text">Evaluvate</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          // Hide items restricted by role
          if (item.roles && !item.roles.includes(user?.role)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className={`badge badge-${user?.role === 'admin' ? 'info' : user?.role === 'member' ? 'success' : 'warning'} role-badge`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
