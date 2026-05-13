import supabaseAdmin from '../_supabaseAdmin.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, username, name, whatsapp, refresh_token } = req.body;

  try {
    // --- REGISTER ---
    if (action === 'register') {
      const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single();
      if (existing) return res.status(400).json({ error: 'Username is already taken.' });

      const { error } = await supabaseAdmin.auth.admin.createUser({
        email, password,
        email_confirm: true,
        user_metadata: { username, name, whatsapp_number: whatsapp }
      });
      if (error) throw error;
      return res.json({ message: 'Registration successful! You can now log in.' });
    }

    // --- LOGIN ---
    if (action === 'login') {
      const { data: profile, error: pErr } = await supabaseAdmin.from('profiles').select('email').eq('username', username).single();
      if (pErr || !profile) return res.status(400).json({ error: 'Username not found.' });

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email: profile.email, password });
      if (error) throw error;
      return res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: data.user });
    }

    // --- FORGOT PASSWORD ---
    if (action === 'forgot-password') {
      const frontendUrl = process.env.VITE_FRONTEND_URL || 'https://imssa-media.vercel.app';
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery', email,
        options: { redirectTo: `${frontendUrl}/reset-password` }
      });
      if (error) throw error;

      await transporter.sendMail({
        from: `"IMSSA Media" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset Your IMSSA Media Password',
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#06b6d4">Reset Your Password</h2>
          <p>Click the button below to reset your IMSSA Media password.</p>
          <a href="${data.properties.action_link}" style="display:inline-block;background:#06b6d4;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin:16px 0">Reset My Password</a>
          <p style="color:#888;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>`
      });
      return res.json({ message: 'Password reset email sent! Check your inbox.' });
    }

    // --- REFRESH TOKEN ---
    if (action === 'refresh') {
      const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
      if (error) throw error;
      return res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(400).json({ error: err.message });
  }
}
