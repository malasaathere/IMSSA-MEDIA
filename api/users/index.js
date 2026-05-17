import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const adminRoles = ['Super Admin', 'Admin', 'Event Coordinator'];

  // GET /api/users
  if (req.method === 'GET') {
    // Public leaderboard access
    if (req.query.leaderboard === 'true') {
      const { data, error } = await supabaseAdmin.from('profiles')
        .select('id, name, username, skill_level, total_points')
        .order('total_points', { ascending: false })
        .limit(5);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    // Admin only list all users
    if (!adminRoles.includes(auth.profile?.role)) return res.status(403).json({ error: 'Admin only.' });
    const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  // PATCH /api/users — update own profile
  if (req.method === 'PATCH') {
    const { name, whatsapp_number } = req.body;
    const { data, error } = await supabaseAdmin.from('profiles').update({ name, whatsapp_number }).eq('id', auth.user.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
