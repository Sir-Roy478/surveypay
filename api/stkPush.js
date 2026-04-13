// /api/stkPush.js
// This runs on Vercel's server - no CORS issues

export default async function handler(req, res) {
  // Allow requests from your site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  var PAYHERO_USERNAME   = process.env.PAYHERO_USERNAME;
  var PAYHERO_PASSWORD   = process.env.PAYHERO_PASSWORD;
  var PAYHERO_CHANNEL_ID = process.env.PAYHERO_CHANNEL_ID;

  var { amount, phone_number, external_reference } = req.body;

  if (!amount || !phone_number) {
    res.status(400).json({ error: 'Missing amount or phone_number' });
    return;
  }

  var credentials = Buffer.from(PAYHERO_USERNAME + ':' + PAYHERO_PASSWORD).toString('base64');

  try {
    var response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + credentials
      },
      body: JSON.stringify({
        amount:             amount,
        phone_number:       phone_number,
        channel_id:         Number(PAYHERO_CHANNEL_ID),
        provider:           'm-pesa',
        external_reference: external_reference || 'SPY-' + Date.now(),
        callback_url:       process.env.CALLBACK_URL || 'https://your-site.vercel.app/api/payment-callback'
      })
    });

    var data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: 'PayHero request failed', details: err.message });
  }
}