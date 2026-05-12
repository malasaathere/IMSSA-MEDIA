import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Rocket, MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import './Calendar.css';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    setLoading(true);
    
    // Fetch Projects
    const { data: projs } = await supabase.from('projects').select('*');
    // Fetch Revisions
    const { data: revs } = await supabase.from('project_revisions').select('*, projects(title)');
    
    const events = [];

    if (projs) {
      projs.forEach(p => {
        // Project Start
        events.push({
          id: `start-${p.id}`,
          type: 'start',
          date: new Date(p.created_at),
          title: `Project Started: ${p.title}`,
          desc: `Category: ${p.category}`,
          status: p.status
        });
        
        // Project Deadline
        if (p.due_date) {
          events.push({
            id: `due-${p.id}`,
            type: 'deadline',
            date: new Date(p.due_date),
            title: `Deadline: ${p.title}`,
            desc: `Status: ${p.status}`,
            status: p.status
          });
        }
      });
    }

    if (revs) {
      revs.forEach(r => {
        events.push({
          id: `rev-${r.id}`,
          type: 'revision',
          date: new Date(r.created_at),
          title: `Revision Submitted`,
          desc: `For: ${r.projects?.title || 'Unknown Project'}`,
          status: 'Ongoing'
        });
      });
    }

    // Sort descending (newest first)
    events.sort((a, b) => b.date - a.date);
    setTimelineEvents(events);
    setLoading(false);
  };

  // --- MINI CALENDAR LOGIC ---
  const renderHeader = () => {
    return (
      <div className="mini-cal-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={20}/></button>
        <span className="month-label">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={20}/></button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="day-name" key={i}>
          {format(addDays(startDate, i), 'EEEEEE')}
        </div>
      );
    }
    return <div className="days-row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Check if there's an event on this day
        const dayEvents = timelineEvents.filter(e => isSameDay(e.date, cloneDay));
        const hasDeadline = dayEvents.some(e => e.type === 'deadline');
        const hasActivity = dayEvents.some(e => e.type === 'start' || e.type === 'revision');

        days.push(
          <div
            className={`day-cell ${
              !isSameMonth(day, monthStart) ? 'disabled' : 
              isSameDay(day, selectedDate) ? 'selected' : ''
            } ${hasDeadline ? 'has-deadline' : hasActivity ? 'has-activity' : ''}`}
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span>{formattedDate}</span>
            <div className="day-dots">
              {hasDeadline && <div className="dot dot-deadline"></div>}
              {hasActivity && <div className="dot dot-activity"></div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="days-grid" key={day}>{days}</div>);
      days = [];
    }
    return <div className="cal-body">{rows}</div>;
  };

  // --- TIMELINE LOGIC ---
  const getIconForType = (type) => {
    switch(type) {
      case 'start': return <Rocket size={18} />;
      case 'revision': return <MessageSquare size={18} />;
      case 'deadline': return <AlertTriangle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getColorForType = (type) => {
    switch(type) {
      case 'start': return 'var(--accent-info)';
      case 'revision': return 'var(--accent-primary)';
      case 'deadline': return 'var(--accent-danger)';
      default: return 'white';
    }
  };

  // Filter timeline by selected month and day (or show all if they click a "Clear Filter" button)
  const filteredEvents = timelineEvents.filter(e => isSameDay(e.date, selectedDate));

  return (
    <div className="calendar-container animate-fade-in">
      <div className="projects-header flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="gradient-text">Project Timeline & Calendar</h1>
          <p>Track started projects, submitted revisions, and upcoming deadlines.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setSelectedDate(new Date())}>Today</button>
      </div>

      <div className="calendar-layout">
        
        {/* Left Side: Mini Calendar */}
        <div className="mini-calendar-wrapper glass-card">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          <div className="cal-legend mt-2">
            <div className="legend-item"><div className="dot dot-deadline"></div> Deadlines</div>
            <div className="legend-item"><div className="dot dot-activity"></div> Activity / Starts</div>
          </div>
        </div>

        {/* Right Side: Timeline */}
        <div className="timeline-wrapper glass-card">
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          {loading ? (
            <p>Loading timeline...</p>
          ) : filteredEvents.length === 0 ? (
            <div className="flex-center" style={{ flexDirection: 'column', color: 'var(--text-secondary)', height: '200px' }}>
              <Clock size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>No project events recorded for this day.</p>
            </div>
          ) : (
            <div className="timeline-list">
              {filteredEvents.map(event => (
                <div className="timeline-item" key={event.id}>
                  <div className="timeline-icon" style={{ backgroundColor: getColorForType(event.type) }}>
                    {getIconForType(event.type)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-time">{format(event.date, 'h:mm a')}</div>
                    <div className="timeline-card">
                      <h4>{event.title}</h4>
                      <p>{event.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Recent Global Activity</h3>
            <div className="timeline-list">
              {timelineEvents.slice(0, 5).map(event => (
                <div className="timeline-item" key={`recent-${event.id}`}>
                  <div className="timeline-icon" style={{ backgroundColor: getColorForType(event.type) }}>
                    {getIconForType(event.type)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-time">{format(event.date, 'MMM d, h:mm a')}</div>
                    <div className="timeline-card">
                      <h4>{event.title}</h4>
                      <p>{event.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarPage;
