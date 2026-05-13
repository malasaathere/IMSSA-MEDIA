import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('events')
      .select('*, coordinator:profiles!coordinator_id(name)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const adminRoles = ['Super Admin', 'Admin', 'Event Coordinator'];
    if (!adminRoles.includes(auth.profile?.role)) return res.status(403).json({ error: 'Admin only.' });
    const { name, coordinator_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Event name is required.' });
    const { data, error } = await supabaseAdmin.from('events').insert([{ name, coordinator_id }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
