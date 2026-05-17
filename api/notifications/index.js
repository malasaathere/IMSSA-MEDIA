import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Find projects assigned to this user (if member) or all projects (if admin)
    const isAdmin = ['Super Admin', 'Admin', 'Event Coordinator'].includes(auth.profile?.role);
    let projectIds = [];
    
    if (isAdmin) {
      const { data: projs } = await supabaseAdmin.from('projects').select('id');
      projectIds = (projs || []).map(p => p.id);
    } else {
      const { data: projs } = await supabaseAdmin.from('projects').select('id').eq('assigned_to', auth.user.id);
      projectIds = (projs || []).map(p => p.id);
    }

    if (projectIds.length === 0) {
      return res.json([]);
    }

    // 2. Fetch the latest 10 revisions for these projects
    const { data: revisions, error } = await supabaseAdmin
      .from('project_revisions')
      .select('*, projects(title), profiles(name)')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Format them as notifications
    const notifications = revisions.map(rev => ({
      id: rev.id,
      title: `New update on ${rev.projects?.title || 'a project'}`,
      message: `${rev.profiles?.name || 'Someone'} said: "${rev.text_content.substring(0, 50)}${rev.text_content.length > 50 ? '...' : ''}"`,
      time: rev.created_at,
      read: false // Fake read state for now
    }));

    return res.json(notifications);
  } catch (err) {
    console.error('Notifications Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
