import supabaseAdmin from '../db/supabaseAdmin.js';

// Verifies the Supabase JWT from the Authorization header
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use Supabase to verify the JWT — no need for a separate JWT secret
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user and their profile to the request
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  const adminRoles = ['Super Admin', 'Admin', 'Event Coordinator'];
  if (!req.profile || !adminRoles.includes(req.profile.role)) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

export default authenticate;
