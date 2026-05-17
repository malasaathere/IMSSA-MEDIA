import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import api from '../services/apiClient';
import { CheckCircle, Clock, AlertCircle, Users, Award, TrendingUp } from 'lucide-react';
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
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin' || profile?.role === 'Event Coordinator';

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch projects via Node.js API
      const projRes = await api.get('/projects');
      let projs = projRes.data || [];
      if (!isAdmin && profile?.id) {
        projs = projs.filter(p => p.assigned_to === profile.id);
      }
      setProjects(projs);

      // Fetch leaderboard via Node.js API to avoid frozen browser Supabase clients
      const leadRes = await api.get('/users?leaderboard=true');
      if (leadRes.data) setLeaderboard(leadRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  };

  const activeProjects = projects.filter(p => p.status === 'Ongoing');
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const overdueProjects = projects.filter(p => p.status === 'Overdue');

  const adminStats = [
    { title: 'Total Ongoing', value: activeProjects.length, icon: Clock, colorClass: 'text-primary' },
    { title: 'Overdue Deadlines', value: overdueProjects.length, icon: AlertCircle, colorClass: 'text-danger' },
    { title: 'Completed', value: completedProjects.length, icon: CheckCircle, colorClass: 'text-success' },
    { title: 'Top Performer', value: leaderboard[0]?.name || '-', icon: Award, colorClass: 'text-warning' },
  ];

  const memberStats = [
    { title: 'My Ongoing Tasks', value: activeProjects.length, icon: Clock, colorClass: 'text-primary' },
    { title: 'My Overdue', value: overdueProjects.length, icon: AlertCircle, colorClass: 'text-danger' },
    { title: 'My Completed', value: completedProjects.length, icon: CheckCircle, colorClass: 'text-success' },
    { title: 'My Points', value: profile?.total_points || 0, icon: TrendingUp, colorClass: 'text-warning' },
  ];

  const stats = isAdmin ? adminStats : memberStats;
  const upcomingDeadlines = [...activeProjects].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 4);

  if (loading) {
    return <div className="dashboard-container flex-center" style={{ height: '80vh' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header flex-between">
        <div>
          <h1 className="gradient-text">Welcome back, {profile?.name?.split(' ')[0] || 'User'}!</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className={`grid-cols-${stats.length > 3 ? '4' : '3'} stats-grid mt-2`}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="dashboard-main grid-cols-2 mt-2">
        <div className="glass-card panel">
          <h3>Gamification Leaderboard</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Top 5 designers by total points earned.</p>
          <div className="activity-list">
            {leaderboard.map((user, index) => (
              <div className="activity-item" key={user.id} style={{ alignItems: 'center', padding: '0.75rem 0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: index === 0 ? 'var(--accent-warning)' : 'var(--text-secondary)', width: '30px' }}>
                  #{index + 1}
                </div>
                <div className="activity-content" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Level: <strong style={{ color: 'var(--accent-info)' }}>{user.skill_level}</strong>
                    </span>
                  </div>
                  <div className="flex-center" style={{ gap: '0.5rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
                    <Award size={16} /> {user.total_points}
                  </div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No points awarded yet!</p>}
          </div>
        </div>

        <div className="glass-card panel">
          <h3>{isAdmin ? 'Upcoming Deadlines (All)' : 'My Upcoming Deadlines'}</h3>
          <div className="deadline-list" style={{ marginTop: '1rem' }}>
            {upcomingDeadlines.map(project => {
              const due = new Date(project.due_date);
              const isToday = due.toDateString() === new Date().toDateString();
              const isOverdue = due < new Date() && !isToday;
              return (
                <div className="deadline-item" key={project.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div className="deadline-info">
                    <h4 style={{ margin: 0 }}>{project.title}</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category: {project.category}</p>
                  </div>
                  <div className={`badge badge-${isOverdue ? 'danger' : isToday ? 'warning' : 'info'}`}>
                    {isOverdue ? 'Overdue' : isToday ? 'Today' : due.toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No upcoming deadlines!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
