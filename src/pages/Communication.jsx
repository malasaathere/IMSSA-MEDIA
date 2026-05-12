import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Send, MessageCircle } from 'lucide-react';
import './Communication.css';

const Communication = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profiles, setProfiles] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessagesAndProfiles();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, (payload) => {
        setMessages(current => [...current, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessagesAndProfiles = async () => {
    // Fetch all profiles to map IDs to Names
    const { data: profs } = await supabase.from('profiles').select('id, name, role');
    if (profs) {
      const profMap = {};
      profs.forEach(p => profMap[p.id] = p);
      setProfiles(profMap);
    }

    // Fetch message history
    const { data: msgs } = await supabase.from('global_messages').select('*').order('created_at', { ascending: true });
    if (msgs) setMessages(msgs);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('global_messages').insert([{
      user_id: profile.id,
      message: newMessage.trim()
    }]);

    if (!error) {
      setNewMessage('');
    } else {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      <div className="projects-header">
        <h1 className="gradient-text">Global Communication</h1>
        <p>Real-time team chat and announcements.</p>
      </div>

      <div className="glass-card chat-box">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-secondary)' }}>
              <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.user_id === profile?.id;
              const sender = profiles[msg.user_id] || { name: 'Unknown User', role: 'Member' };
              const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id;

              return (
                <div key={msg.id} className={`message-wrapper ${isMe ? 'my-message' : 'their-message'}`}>
                  {!isMe && showHeader && (
                    <div className="message-sender">
                      {sender.name} <span className="sender-role">({sender.role})</span>
                    </div>
                  )}
                  <div className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    {msg.message}
                    <span className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Communication;
