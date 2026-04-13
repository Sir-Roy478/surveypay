// api/paymentCheck.js
const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  var PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
  var PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;

  if (!PAYHERO_USERNAME || !PAYHERO_PASSWORD) {
    res.status(500).json({ error: 'PayHero credentials not set in Vercel environment variables' });
    return;
  }

  var reference = req.query.reference;
  if (!reference) {
    res.status(400).json({ error: 'Missing reference parameter' });
    return;
  }

  var credentials = Buffer.from(PAYHERO_USERNAME + ':' + PAYHERO_PASSWORD).toString('base64');

  var options = {
    hostname: 'backend.payhero.co.ke',
    path:     '/api/v2/transaction-status?reference=' + encodeURIComponent(reference),
    method:   'GET',
    headers: {
      'Authorization': 'Basic ' + credentials
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
    res.status(500).json({ error: 'Status check failed', details: err.message });
  });

  payheroReq.end();
};
