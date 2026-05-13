import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /api/revisions/:projectId
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_revisions')
      .select('*, author:profiles!user_id(name, username)')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/revisions — Add text comment or image revision
router.post('/', authenticate, async (req, res) => {
  const { project_id, text_content, image_url } = req.body;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  try {
    const { data, error } = await supabaseAdmin
      .from('project_revisions')
      .insert([{ project_id, user_id: req.user.id, text_content, image_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
