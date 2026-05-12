import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { createCalendarEvent } from '../services/googleApi';
import './Calendar.css';

const CalendarPage = () => {
  const { profile, googleConnected } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSuperAdmin = profile?.role === 'Super Admin';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('due_date', { ascending: true });
    if (data) {
      // Filter out completed projects for the calendar view
      setProjects(data.filter(p => p.status !== 'Completed'));
    }
  };

  const handleSync = async () => {
    if (!googleConnected) {
      setErrorMsg("Please connect your Google Account in Settings first.");
      return;
    }
    
    setIsSyncing(true);
    setErrorMsg('');
    try {
      for (const project of projects) {
        if (!project.due_date) continue;
        
        const startDate = new Date(project.due_date);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour duration
        
        await createCalendarEvent({
          title: `[Evaluvate] ${project.title}`,
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString()
        });
      }
      setSynced(true);
    } catch (err) {
      console.error("Calendar Sync Failed:", err);
      setErrorMsg("Sync failed. Check console for details.");
    }
    setIsSyncing(false);
  };

  return (
    <div className="calendar-container animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">Project Calendar</h1>
          <p>Track all upcoming project deadlines and events.</p>
        </div>
        {isSuperAdmin && (
          <button 
            className={`btn ${synced ? 'btn-success' : 'btn-primary'}`} 
            onClick={handleSync}
            disabled={isSyncing || synced}
          >
            {isSyncing ? <RefreshCw className="spin" size={18} /> : (synced ? <Check size={18} /> : <CalendarIcon size={18} />)}
            {isSyncing ? 'Syncing...' : (synced ? 'Google Sync' : 'Google Sync')}
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {!isSuperAdmin && (
        <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          Note: Google Calendar synchronization is managed by the Super Admin.
        </div>
      )}

      <div className="glass-card panel mt-2">
        <h3>Upcoming Deadlines</h3>
        <p className="subtitle">All active tasks in the system.</p>
        
        <div className="sync-list mt-2">
          {projects.map((project) => {
            const due = new Date(project.due_date);
            const isOverdue = due < new Date();

            return (
              <div key={project.id} className="sync-item" style={{ borderLeft: isOverdue ? '4px solid var(--accent-danger)' : '4px solid var(--accent-info)' }}>
                <div className="sync-icon">
                  <CalendarIcon size={20} className={isOverdue ? 'text-danger' : 'text-primary'} />
                </div>
                <div className="sync-details">
                  <h4>{project.title}</h4>
                  <p>{due.toLocaleDateString()} at {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="sync-status">
                  {isOverdue ? (
                    <span className="badge badge-danger">Overdue</span>
                  ) : (
                    <span className="badge badge-info">{project.status}</span>
                  )}
                </div>
              </div>
            );
          })}
          {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No active deadlines!</p>}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
