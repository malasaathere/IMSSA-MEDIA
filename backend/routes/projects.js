import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects — All projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(`*, events(name), assigned_profile:profiles!assigned_to(name, username), monitor_profile:profiles!monitoring_admin_id(name, username)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects — Create project (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { event_id, title, category, assigned_to, monitoring_admin_id, due_date } = req.body;

  if (!title || !category || !event_id) {
    return res.status(400).json({ error: 'Title, category, and event are required.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([{ event_id, title, category, assigned_to, monitoring_admin_id, due_date }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id — Update project status
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id — Delete project (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
