// /api/paymentCheck.js
// Polls PayHero for payment status

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  var reference = req.query.reference;
  if (!reference) { res.status(400).json({ error: 'Missing reference' }); return; }

  var PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
  var PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
  var credentials = Buffer.from(PAYHERO_USERNAME + ':' + PAYHERO_PASSWORD).toString('base64');

  try {
    var response = await fetch(
      'https://backend.payhero.co.ke/api/v2/transaction-status?reference=' + encodeURIComponent(reference),
      { headers: { 'Authorization': 'Basic ' + credentials } }
    );
    var data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: 'Status check failed', details: err.message });
  }
}
