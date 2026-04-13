// api/stkPush.js
const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  var PAYHERO_USERNAME   = process.env.PAYHERO_USERNAME;
  var PAYHERO_PASSWORD   = process.env.PAYHERO_PASSWORD;
  var PAYHERO_CHANNEL_ID = process.env.PAYHERO_CHANNEL_ID;

  if (!PAYHERO_USERNAME || !PAYHERO_PASSWORD || !PAYHERO_CHANNEL_ID) {
    res.status(500).json({ error: 'PayHero credentials not set in Vercel environment variables' });
    return;
  }

  var amount             = req.body.amount;
  var phone_number       = req.body.phone_number;
  var external_reference = req.body.external_reference || ('SPY-' + Date.now());

  if (!amount || !phone_number) {
    res.status(400).json({ error: 'Missing amount or phone_number' });
    return;
  }

  var credentials = Buffer.from(PAYHERO_USERNAME + ':' + PAYHERO_PASSWORD).toString('base64');

  var payload = JSON.stringify({
    amount:             amount,
    phone_number:       phone_number,
    channel_id:         Number(PAYHERO_CHANNEL_ID),
    provider:           'm-pesa',
    external_reference: external_reference,
    callback_url:       'https://' + req.headers.host + '/api/paymentCheck'
  });

  var options = {
    hostname: 'backend.payhero.co.ke',
    path:     '/api/v2/payments',
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Authorization':  'Basic ' + credentials,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  var responseData = '';
  var payheroReq = https.request(options, function(payheroRes) {
    payheroRes.on('data', function(chunk) { responseData += chunk; });
    payheroRes.on('end', function() {
      try {
        res.status(200).json(JSON.parse(responseData));
      } catch(e) {
        res.status(200).json({ raw: responseData });
      }
    });
  });

  payheroReq.on('error', function(err) {
    res.status(500).json({ error: 'Request to PayHero failed', details: err.message });
  });

  payheroReq.write(payload);
  payheroReq.end();
};
