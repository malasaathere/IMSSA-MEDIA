import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { profile } = auth;

  const adminRoles = ['Super Admin', 'Admin', 'Event Coordinator'];

  // GET /api/projects
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, events(name), assigned_profile:profiles!assigned_to(name, username), monitor_profile:profiles!monitoring_admin_id(name, username)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // POST /api/projects
  if (req.method === 'POST') {
    if (!adminRoles.includes(profile?.role)) return res.status(403).json({ error: 'Admin only.' });
    const { event_id, title, category, assigned_to, monitoring_admin_id, due_date } = req.body;
    if (!title || !category || !event_id) return res.status(400).json({ error: 'Title, category, and event are required.' });
    const { data, error } = await supabaseAdmin.from('projects')
      .insert([{ event_id, title, category, assigned_to, monitoring_admin_id, due_date }])
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
