import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { projectId } = req.query;
    const { data, error } = await supabaseAdmin.from('project_revisions')
      .select('*, author:profiles!user_id(name, username)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { project_id, text_content, image_url } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id is required.' });
    const { data, error } = await supabaseAdmin.from('project_revisions')
      .insert([{ project_id, user_id: auth.user.id, text_content, image_url }])
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
