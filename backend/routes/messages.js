import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_messages')
      .select('*, sender:profiles!user_id(name, username)')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages
router.post('/', authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  try {
    const { data, error } = await supabaseAdmin
      .from('global_messages')
      .insert([{ user_id: req.user.id, message: message.trim() }])
      .select('*, sender:profiles!user_id(name, username)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
