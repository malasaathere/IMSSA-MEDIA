import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip } from 'lucide-react';
import './Projects.css';

const ProjectCard = ({ project }) => {
  return (
    <div className="glass-card project-card">
      <div className="project-card-header">
        <span className={`badge badge-${project.priority === 'High' ? 'danger' : 'info'}`}>
          {project.priority}
        </span>
        <button className="btn-icon"><MoreHorizontal size={16} /></button>
      </div>
      <h4>{project.title}</h4>
      <p className="project-desc">{project.description}</p>
      
      {project.thumbnail && (
        <div className="project-thumbnail">
          <img src={project.thumbnail} alt="Project preview" />
        </div>
      )}

      <div className="project-footer">
        <div className="project-meta">
          <span title="Due Date"><Calendar size={14} /> {project.dueDate}</span>
          <span title="Comments"><MessageSquare size={14} /> {project.comments}</span>
          {project.attachments > 0 && <span title="Attachments"><Paperclip size={14} /> {project.attachments}</span>}
        </div>
        <div className="avatar small" title={project.assignee}>{project.assignee.charAt(0)}</div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState('Summer Campaign');

  const events = ['Summer Campaign', 'Spring Event Series', 'Brand Identity', 'Social Media Q3'];

  const columns = [
    { title: 'To Do', id: 'todo' },
    { title: 'In Progress', id: 'in-progress' },
    { title: 'Ready for Review', id: 'review' },
    { title: 'Approved', id: 'approved' }
  ];

  const mockProjects = [
    { id: 1, title: 'Instagram Post 1', description: 'Design carousel for summer sale.', status: 'todo', priority: 'Normal', dueDate: 'May 15', comments: 2, attachments: 0, assignee: 'Sarah' },
    { id: 2, title: 'Facebook Ad Banner', description: 'Create variants for A/B testing.', status: 'in-progress', priority: 'High', dueDate: 'May 14', comments: 5, attachments: 2, assignee: 'John' },
    { id: 3, title: 'Logo Animation', description: '5s animation for video intros.', status: 'review', priority: 'Normal', dueDate: 'May 12', comments: 12, attachments: 1, assignee: 'Sarah', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="projects-container animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">Projects & Events</h1>
          <p>Manage workflows and track progress.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary"><Plus size={18} /> New Project</button>
        )}
      </div>

      <div className="events-tabs">
        {events.map(event => (
          <button 
            key={event} 
            className={`event-tab ${activeEvent === event ? 'active' : ''}`}
            onClick={() => setActiveEvent(event)}
          >
            {event}
          </button>
        ))}
      </div>

      <div className="kanban-board">
        {columns.map(column => (
          <div key={column.id} className="kanban-column">
            <div className="column-header">
              <h3>{column.title}</h3>
              <span className="column-count">
                {mockProjects.filter(p => p.status === column.id).length}
              </span>
            </div>
            <div className="column-content">
              {mockProjects.filter(p => p.status === column.id).map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
