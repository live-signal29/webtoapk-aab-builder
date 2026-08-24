import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(express.json());

// Supabase Service Role Client (Backend Admin Actions)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'WebToApp Conversion Engine is Running' });
});

/**
 * 1. Build Processing Route
 * Receives build requests from frontend/database, triggers conversion, and updates DB status
 */
app.post('/api/build', async (req, res) => {
  const { buildId, websiteUrl, appName, packageName, buildFormat, iconUrl } = req.body;

  if (!buildId || !websiteUrl) {
    return res.status(400).json({ error: 'Missing required build parameters' });
  }

  try {
    // A. Update DB status to 'building'
    await supabaseAdmin
      .from('builds')
      .update({ status: 'building' })
      .eq('id', buildId);

    // B. Call PWABuilder API or Android CLI conversion worker
    // Note: Replace this placeholder section with your PWABuilder Cloud API endpoint or custom docker worker
    console.log(`Starting conversion for URL: ${websiteUrl} [${buildFormat}]`);

    // Simulated Conversion Processing Delay (In Production, replace with real PWABuilder API Response)
    setTimeout(async () => {
      const mockApkUrl = `https://your-storage-bucket.supabase.co/storage/v1/object/public/build-outputs/${buildId}/app-release.apk`;
      const mockAabUrl = `https://your-storage-bucket.supabase.co/storage/v1/object/public/build-outputs/${buildId}/app-release.aab`;

      // C. Update DB status to 'completed' with output download URLs
      await supabaseAdmin
        .from('builds')
        .update({
          status: 'completed',
          apk_download_url: buildFormat === 'aab' ? null : mockApkUrl,
          aab_download_url: buildFormat === 'apk' ? null : mockAabUrl,
        })
        .eq('id', buildId);

      console.log(`Build completed for ID: ${buildId}`);
    }, 5000);

    return res.status(200).json({ message: 'Build queued and processing started' });

  } catch (error) {
    console.error('Build Engine Error:', error.message);

    // Update DB status to 'failed' on error
    await supabaseAdmin
      .from('builds')
      .update({ status: 'failed' })
      .eq('id', buildId);

    return res.status(500).json({ error: 'Failed to process app build request' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`WebToApp Backend Engine listening on port ${PORT}`);
});
