import { createClient } from '@supabase/supabase-js';

// Supabase client config
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    // Jab NOWPayments confirm kare ke payment ho gayi hai
    if (body.payment_status === 'finished' || body.payment_status === 'confirmed') {
      const buildId = body.order_id;

      // Supabase table mein payment_status ko 'paid' kar do
      const { error } = await supabase
        .from('builds')
        .update({ payment_status: 'paid', status: 'pending' })
        .eq('id', buildId);

      if (error) throw error;
      console.log(`Build ID ${buildId} marked as PAID automatically.`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
