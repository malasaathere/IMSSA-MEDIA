import React, { useState } from 'react';
import { Calendar as CalendarIcon, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createCalendarEvent } from '../services/googleApi';
import './Calendar.css';

const CalendarPage = () => {
  const { googleConnected } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mockEvents = [
    { title: 'Summer Campaign Post 1 Due', date: 'May 15, 2026', time: '10:00 AM' },
    { title: 'Facebook Ad Banner Due', date: 'May 14, 2026', time: '2:00 PM' },
    { title: 'Logo Animation Due', date: 'May 12, 2026', time: '5:00 PM' }
  ];

  const handleSync = async () => {
    if (!googleConnected) {
      setErrorMsg("Please connect your Google Account in Settings first.");
      return;
    }
    
    setIsSyncing(true);
    setErrorMsg('');
    try {
      // Loop and sync mock events as real calendar events
      for (const event of mockEvents) {
        // Convert "May 15, 2026 10:00 AM" to ISO string. 
        // This is a naive conversion for the mock data demonstration.
        const dateString = `${event.date} ${event.time}`;
        const startDate = new Date(dateString);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour
        
        await createCalendarEvent({
          title: `Evaluvate Deadline: ${event.title}`,
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

      {errorMsg && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

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
