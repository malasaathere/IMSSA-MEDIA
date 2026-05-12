import React, { useState } from 'react';
import { Calendar as CalendarIcon, Check, RefreshCw } from 'lucide-react';
import './Calendar.css';

const CalendarPage = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const mockEvents = [
    { title: 'Summer Campaign Post 1 Due', date: 'May 15, 2026', time: '10:00 AM' },
    { title: 'Facebook Ad Banner Due', date: 'May 14, 2026', time: '2:00 PM' },
    { title: 'Logo Animation Due', date: 'May 12, 2026', time: '5:00 PM' }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    // Mock API call to Google Calendar API
    setTimeout(() => {
      setIsSyncing(false);
      setSynced(true);
    }, 2000);
  };

  return (
    <div className="calendar-container animate-fade-in">
      <div className="projects-header flex-between">
        <div>
          <h1 className="gradient-text">Google Calendar Sync</h1>
          <p>Sync all project deadlines and events to your personal Google Calendar.</p>
        </div>
        <button 
          className={`btn ${synced ? 'btn-success' : 'btn-primary'}`} 
          onClick={handleSync}
          disabled={isSyncing || synced}
        >
          {isSyncing ? <RefreshCw className="spin" size={18} /> : (synced ? <Check size={18} /> : <CalendarIcon size={18} />)}
          {isSyncing ? 'Syncing...' : (synced ? 'Synced' : 'Sync Now')}
        </button>
      </div>

      <div className="glass-card panel mt-2">
        <h3>Upcoming Deadlines to Sync</h3>
        <p className="subtitle">These items will be pushed to your connected calendar.</p>
        
        <div className="sync-list mt-2">
          {mockEvents.map((event, idx) => (
            <div key={idx} className="sync-item">
              <div className="sync-icon">
                <CalendarIcon size={20} className="text-primary" />
              </div>
              <div className="sync-details">
                <h4>{event.title}</h4>
                <p>{event.date} at {event.time}</p>
              </div>
              <div className="sync-status">
                {synced ? (
                  <span className="badge badge-success"><Check size={12}/> Synced</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
