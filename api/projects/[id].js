import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { profile } = auth;

  const { id } = req.query;
  const adminRoles = ['Super Admin', 'Admin', 'Event Coordinator'];

  // PATCH /api/projects/:id
  if (req.method === 'PATCH') {
    const { data, error } = await supabaseAdmin.from('projects').update(req.body).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // DELETE /api/projects/:id
  if (req.method === 'DELETE') {
    if (!adminRoles.includes(profile?.role)) return res.status(403).json({ error: 'Admin only.' });
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Project deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
