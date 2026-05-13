import supabaseAdmin from '../../_supabaseAdmin.js';
import { authenticate, setCors } from '../../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  if (auth.profile?.role !== 'Super Admin') return res.status(403).json({ error: 'Only Super Admins can change roles.' });

  const { id } = req.query;
  const { role } = req.body;
  const validRoles = ['Super Admin', 'Admin', 'Event Coordinator', 'Member'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role.' });

  const { data, error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
