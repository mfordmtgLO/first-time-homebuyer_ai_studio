const http = require('http');

const data = JSON.stringify({ url: 'https://cfmtg.com/mford/' });

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/knowledge/ingest',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer test-token' // Auth might fail, wait, we can bypass or see if it gets a 400 error.
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
