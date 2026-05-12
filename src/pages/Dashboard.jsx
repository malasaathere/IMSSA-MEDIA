import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import './Dashboard.css';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-card stat-card">
    <div className={`stat-icon-wrapper ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data for UI
  const adminStats = [
    { title: 'Active Projects', value: '12', icon: Clock, colorClass: 'text-primary' },
    { title: 'Pending Evaluations', value: '5', icon: AlertCircle, colorClass: 'text-warning' },
    { title: 'Completed This Week', value: '24', icon: CheckCircle, colorClass: 'text-success' },
    { title: 'Active Members', value: '8', icon: Users, colorClass: 'text-secondary' },
  ];

  const memberStats = [
    { title: 'Assigned to Me', value: '4', icon: Clock, colorClass: 'text-primary' },
    { title: 'Needs Revision', value: '2', icon: AlertCircle, colorClass: 'text-danger' },
    { title: 'Completed', value: '15', icon: CheckCircle, colorClass: 'text-success' },
  ];

  const stats = user?.role === 'admin' ? adminStats : (user?.role === 'member' ? memberStats : adminStats);

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header flex-between">
        <div>
          <h1 className="gradient-text">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        {user?.role === 'member' && (
          <button className="btn btn-primary">Upload New Work</button>
        )}
        {user?.role === 'admin' && (
          <button className="btn btn-primary">Create Event</button>
        )}
      </div>

      <div className={`grid-cols-${stats.length > 3 ? '4' : '3'} stats-grid mt-2`}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="dashboard-main grid-cols-2 mt-2">
        <div className="glass-card panel">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot bg-primary"></div>
              <div className="activity-content">
                <p><strong>Sarah</strong> uploaded a revision for <em>Summer Campaign Post 1</em></p>
                <span className="time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot bg-warning"></div>
              <div className="activity-content">
                <p><strong>Admin</strong> requested changes on <em>Logo Concepts</em></p>
                <span className="time">4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot bg-success"></div>
              <div className="activity-content">
                <p><em>Spring Event Series</em> was marked as completed.</p>
                <span className="time">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card panel">
          <h3>{user?.role === 'member' ? 'My Upcoming Deadlines' : 'Urgent Deadlines'}</h3>
          <div className="deadline-list">
            <div className="deadline-item">
              <div className="deadline-info">
                <h4>Summer Campaign Post 1</h4>
                <p>Assigned to: {user?.role === 'member' ? 'Me' : 'Sarah'}</p>
              </div>
              <div className="badge badge-danger">Today</div>
            </div>
            <div className="deadline-item">
              <div className="deadline-info">
                <h4>Logo Concepts</h4>
                <p>Assigned to: {user?.role === 'member' ? 'Me' : 'John'}</p>
              </div>
              <div className="badge badge-warning">Tomorrow</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
