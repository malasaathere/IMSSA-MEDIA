import supabaseAdmin from '../_supabaseAdmin.js';
import { authenticate, setCors } from '../_auth.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, contentType, base64 } = req.body;
  
  if (!fileName || !base64) {
    return res.status(400).json({ error: 'Missing fileName or base64 data.' });
  }

  try {
    const buffer = Buffer.from(base64, 'base64');
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-files')
      .upload(fileName, buffer, { 
        contentType: contentType || 'image/png', 
        upsert: true 
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('project-files')
      .getPublicUrl(fileName);

    return res.json({ publicUrl: urlData.publicUrl });
  } catch (err) {
    console.error('Upload API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
