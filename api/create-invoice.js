export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { price, orderId, appName, planName } = req.body;

  const NOWPAYMENTS_API_KEY = "0F2K452-EVR466V-PA9G1EY-XH9FH90";

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'usd',
        order_id: orderId.toString(),
        order_description: `WebToApp ${planName} (${appName})`,
        success_url: `${req.headers.origin || 'https://builder.vercel.app'}/dashboard?status=success`,
        cancel_url: `${req.headers.origin || 'https://builder.vercel.app'}/?status=cancelled`
      })
    });

    const data = await response.json();

    if (!response.ok || !data.invoice_url) {
      return res.status(500).json({ error: data.message || 'Payment provider error' });
    }

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
