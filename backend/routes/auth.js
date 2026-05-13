import express from 'express';
import supabaseAdmin from '../db/supabaseAdmin.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, username, name, whatsapp } = req.body;

  if (!email || !password || !username || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if username is taken
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm — no OTP needed
      user_metadata: { username, name, whatsapp_number: whatsapp }
    });

    if (error) throw error;

    res.status(201).json({ message: 'Registration successful! You can now log in.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Look up email by username
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ error: 'Username not found.' });
    }

    // Sign in with Supabase Auth to get the session JWT
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: profile.email,
      password
    });

    if (error) throw error;

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    // Generate a reset link via Supabase
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${process.env.FRONTEND_URL}/reset-password` }
    });

    if (error) throw error;

    // Send the link via Nodemailer (Gmail SMTP)
    await transporter.sendMail({
      from: `"IMSSA Media" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your IMSSA Media Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #06b6d4;">Reset Your Password</h2>
          <p>You requested a password reset for your IMSSA Media account.</p>
          <a href="${data.properties.action_link}" 
             style="display:inline-block; background:#06b6d4; color:white; padding:12px 24px;
                    text-decoration:none; border-radius:8px; font-weight:bold; margin: 16px 0;">
            Reset My Password
          </a>
          <p style="color:#888; font-size:12px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'Password reset email sent! Check your inbox.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Refresh token required.' });

  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) throw error;
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
