import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users — All profiles
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me — Current user's profile
router.get('/me', authenticate, async (req, res) => {
  res.json(req.profile);
});

// PATCH /api/users/:id/role — Update role (Super Admin only)
router.patch('/:id/role', authenticate, async (req, res) => {
  if (req.profile?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admins can change roles.' });
  }

  const { role } = req.body;
  const validRoles = ['Super Admin', 'Admin', 'Event Coordinator', 'Member'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me — Update own profile
router.patch('/me', authenticate, async (req, res) => {
  const { name, whatsapp_number } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, whatsapp_number })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
