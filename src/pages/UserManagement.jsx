import React, { useState, useEffect } from 'react';
import api from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Award, UserCheck, TrendingUp, Search } from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isSuperAdmin = profile?.role === 'Super Admin';
  const isAdmin = isSuperAdmin || profile?.role === 'Admin' || profile?.role === 'Event Coordinator';

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) { alert('Only Super Admins can change user roles.'); return; }
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSkillChange = async (userId, newSkill) => {
    if (!isAdmin) { alert('Only Admins can change skill levels.'); return; }
    try {
      // Skill level update goes through Supabase directly (no Node.js route needed)
      const { supabase } = await import('../services/supabaseClient.js');
      await supabase.from('profiles').update({ skill_level: newSkill }).eq('id', userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to update skill level: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="panel animate-fade-in flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldAlert size={64} color="var(--accent-danger)" style={{ marginBottom: '1rem' }} />
          <h2 className="gradient-text">Access Denied</h2>
          <p>You do not have permission to view this page. Admin access required.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="panel animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">User Management</h1>
          <p>Control roles, permissions, and evaluate designer skill levels.</p>
        </div>
        <div className="search-bar glass-card">
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'white', outline: 'none', paddingLeft: '0.5rem' }}
          />
        </div>
      </div>

      <div className="glass-card mt-2 p-0" style={{ overflow: 'hidden' }}>
        <table className="user-table">
          <thead>
            <tr>
              <th>Name & Username</th>
              <th>Contact Info</th>
              <th>System Role</th>
              <th>Skill Level</th>
              <th>Points Earned</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                </td>
                <td>
                  <div>{u.email}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>WA: {u.whatsapp_number}</div>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={!isSuperAdmin || u.id === profile?.id}
                    className="role-select"
                  >
                    <option value="Member">Member</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </td>
                <td>
                  <select
                    value={u.skill_level}
                    onChange={(e) => handleSkillChange(u.id, e.target.value)}
                    className={`skill-select ${u.skill_level?.toLowerCase()}`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </select>
                </td>
                <td>
                  <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                    <TrendingUp size={16} color="var(--accent-warning)" />
                    <span style={{ fontWeight: 600 }}>{u.total_points || 0}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
