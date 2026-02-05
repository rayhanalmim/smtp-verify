// smtp-verifier.js - Run on your VPS with port 25 open
const express = require('express');
const net = require('net');
const dns = require('dns').promises;

const app = express();
app.use(express.json());

// Secret key for authentication
const API_KEY = process.env.VERIFIER_API_KEY || 'your-secret-key';

app.post('/verify', async (req, res) => {
  // Authenticate request
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, from_email } = req.body;
  const [localPart, domain] = email.split('@');

  try {
    // Get MX records
    const mxRecords = await dns.resolveMx(domain);
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    // SMTP handshake
    const result = await smtpVerify(email, mxHost, from_email);
    res.json(result);
  } catch (error) {
    res.json({ verified: false, error: error.message });
  }
});

function smtpVerify(email, mxHost, fromEmail) {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    socket.setTimeout(10000);
    
    let step = 0;
    let response = '';

    socket.on('data', (data) => {
      response = data.toString();
      const code = parseInt(response.substring(0, 3));

      if (step === 0 && code === 220) {
        socket.write(`EHLO verifier.local\r\n`);
        step++;
      } else if (step === 1 && code === 250) {
        socket.write(`MAIL FROM:<${fromEmail}>\r\n`);
        step++;
      } else if (step === 2 && code === 250) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        step++;
      } else if (step === 3) {
        socket.write('QUIT\r\n');
        socket.end();
        resolve({
          verified: code === 250 || code === 251 || code === 252,
          code,
          response: response.trim()
        });
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ verified: false, error: 'Timeout' });
    });

    socket.on('error', (err) => {
      resolve({ verified: false, error: err.message });
    });
  });
}

app.listen(3000, () => console.log('SMTP Verifier running on port 3000'));
