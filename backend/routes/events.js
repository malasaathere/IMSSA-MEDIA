import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, coordinator:profiles!coordinator_id(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, coordinator_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Event name is required.' });

  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([{ name, coordinator_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
