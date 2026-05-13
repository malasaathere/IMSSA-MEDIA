import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';
import supabaseAdmin from '../db/supabaseAdmin.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/upload/drive — Upload to Google Drive
router.post('/drive', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided.' });

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const drive = google.drive({ version: 'v3', auth });

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${req.file.originalname}`,
        mimeType: req.file.mimetype,
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    // Make the file publicly viewable
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const publicUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    res.json({ url: publicUrl, id: response.data.id, webViewLink: response.data.webViewLink });
  } catch (err) {
    console.error('Google Drive upload error:', err.message);
    res.status(500).json({ error: 'Google Drive upload failed: ' + err.message });
  }
});

// POST /api/upload/storage — Upload to Supabase Storage
router.post('/storage', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided.' });

  const { projectId } = req.body;
  const fileName = `revisions/${projectId || 'general'}/${Date.now()}_${req.file.originalname}`;

  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-files')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from('project-files').getPublicUrl(fileName);
    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error('Storage upload error:', err.message);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

export default router;
