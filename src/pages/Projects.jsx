import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Clock, User, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import './Projects.css';

const ProjectCard = ({ project, profiles, onStatusChange, isAssignee, isAdmin }) => {
  const assignee = profiles.find(p => p.id === project.assigned_to);
  const monitor = profiles.find(p => p.id === project.monitoring_admin_id);

  const canEditStatus = isAdmin || isAssignee;

  return (
    <div className="glass-card project-card">
      <div className="project-card-header">
        <span className={`badge badge-${project.status === 'Completed' ? 'success' : project.status === 'Overdue' ? 'danger' : 'info'}`}>
          {project.category}
        </span>
        {canEditStatus && (
          <select 
            value={project.status} 
            onChange={(e) => onStatusChange(project.id, e.target.value)}
            className="status-select"
          >
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        )}
      </div>
      <h4>{project.title}</h4>
      
      <div className="project-footer mt-2">
        <div className="project-meta" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
          <span title="Due Date"><Calendar size={14} /> {new Date(project.due_date).toLocaleDateString()}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            Points: {project.points_awarded}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {assignee && (
            <div className="flex-center" style={{ gap: '0.3rem', fontSize: '0.8rem' }}>
              <User size={12} /> {assignee.name}
            </div>
          )}
          {monitor && (
            <div className="flex-center" style={{ gap: '0.3rem', fontSize: '0.8rem', color: 'var(--accent-info)' }}>
              <Shield size={12} /> {monitor.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', category: 'Video', assigned_to: '', monitoring_admin_id: '', due_date: '', points_awarded: 10 });

  const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin' || profile?.role === 'Event Coordinator';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch profiles
    const { data: profs } = await supabase.from('profiles').select('id, name, role');
    if (profs) setProfiles(profs);

    // Fetch events
    const { data: evts } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (evts) {
      setEvents(evts);
      if (evts.length > 0 && !activeEventId) setActiveEventId(evts[0].id);
    }

    // Fetch projects
    const { data: projs } = await supabase.from('projects').select('*');
    if (projs) setProjects(projs);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('events').insert([{ name: newEventName, coordinator_id: profile.id }]).select();
    if (!error && data) {
      setEvents([data[0], ...events]);
      setActiveEventId(data[0].id);
      setShowEventModal(false);
      setNewEventName('');
    } else {
      alert("Error creating event: " + error?.message);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('projects').insert([{
      ...newProject,
      event_id: activeEventId
    }]).select();

    if (!error && data) {
      setProjects([data[0], ...projects]);
      setShowProjectModal(false);
      setNewProject({ title: '', category: 'Video', assigned_to: '', monitoring_admin_id: '', due_date: '', points_awarded: 10 });
    } else {
      alert("Error creating project: " + error?.message);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
    if (!error) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    }
  };

  const activeProjects = projects.filter(p => p.event_id === activeEventId);
  
  const columns = [
    { title: 'Ongoing', id: 'Ongoing', icon: Clock, color: 'var(--accent-info)' },
    { title: 'Completed', id: 'Completed', icon: CheckCircle, color: 'var(--accent-success)' },
    { title: 'Overdue', id: 'Overdue', icon: AlertTriangle, color: 'var(--accent-danger)' }
  ];

  return (
    <div className="projects-container animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">Projects & Events</h1>
          <p>Manage workflows and track progress.</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowEventModal(true)}><Plus size={18} /> New Event</button>
            <button className="btn btn-primary" onClick={() => {
              if(!activeEventId) return alert("Please create an event first.");
              setShowProjectModal(true);
            }}><Plus size={18} /> New Project</button>
          </div>
        )}
      </div>

      <div className="events-tabs">
        {events.map(evt => (
          <button 
            key={evt.id} 
            className={`event-tab ${activeEventId === evt.id ? 'active' : ''}`}
            onClick={() => setActiveEventId(evt.id)}
          >
            {evt.name}
          </button>
        ))}
      </div>

      <div className="kanban-board">
        {columns.map(column => (
          <div key={column.id} className="kanban-column">
            <div className="column-header" style={{ borderBottom: `2px solid ${column.color}` }}>
              <div className="flex-center" style={{ gap: '0.5rem' }}>
                <column.icon size={18} color={column.color} />
                <h3>{column.title}</h3>
              </div>
              <span className="column-count">
                {activeProjects.filter(p => p.status === column.id).length}
              </span>
            </div>
            <div className="column-content">
              {activeProjects.filter(p => p.status === column.id).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  profiles={profiles}
                  onStatusChange={handleStatusChange}
                  isAdmin={isAdmin}
                  isAssignee={project.assigned_to === profile?.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" className="glass-input" placeholder="Event Name" value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '400px' }}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" className="glass-input" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
              
              <select className="glass-input" value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})}>
                <option value="Video">Video</option>
                <option value="Caption">Caption</option>
                <option value="Graphic">Graphic</option>
              </select>

              <select className="glass-input" value={newProject.assigned_to} onChange={e => setNewProject({...newProject, assigned_to: e.target.value})} required>
                <option value="">Select Designer...</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select className="glass-input" value={newProject.monitoring_admin_id} onChange={e => setNewProject({...newProject, monitoring_admin_id: e.target.value})} required>
                <option value="">Select Monitoring Admin...</option>
                {profiles.filter(p => ['Super Admin', 'Admin', 'Event Coordinator'].includes(p.role)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <div className="input-group">
                <Calendar size={20} className="input-icon" />
                <input type="datetime-local" className="glass-input" value={newProject.due_date} onChange={e => setNewProject({...newProject, due_date: e.target.value})} required title="Select project deadline" />
              </div>
              
              <input type="number" className="glass-input" placeholder="Points Awarded" value={newProject.points_awarded} onChange={e => setNewProject({...newProject, points_awarded: e.target.value})} required />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
