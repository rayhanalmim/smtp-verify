# SMTP Email Verifier Service

A Node.js service that verifies email addresses using SMTP protocol by connecting to mail servers and performing SMTP handshakes.

## Features

- Verifies email addresses via SMTP
- MX record lookup
- API key authentication
- RESTful API endpoint

## Requirements

- Node.js (v14 or higher)
- Port 25 access (for SMTP connections)
- VPS or server with outbound SMTP capabilities

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Set your API key in `.env`:
```
VERIFIER_API_KEY=your-secure-secret-key
```

## Usage

### Start the server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on port 3000.

### API Endpoint

**POST** `/verify`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: your-secret-key`

**Request Body:**
```json
{
  "email": "user@example.com",
  "from_email": "verify@yourdomain.com"
}
```

**Response:**
```json
{
  "verified": true,
  "code": 250,
  "response": "2.1.5 Ok"
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{
    "email": "test@gmail.com",
    "from_email": "verify@yourdomain.com"
  }'
```

## How It Works

1. Extracts domain from email address
2. Performs DNS MX record lookup
3. Connects to mail server on port 25
4. Performs SMTP handshake:
   - EHLO
   - MAIL FROM
   - RCPT TO
5. Returns verification result based on SMTP response codes

## Response Codes

- **250**: Email accepted (verified)
- **251**: User not local, will forward (verified)
- **252**: Cannot verify user, but will accept (verified)
- **550**: Mailbox unavailable (not verified)
- **553**: Mailbox name not allowed (not verified)

## Important Notes

- This service requires port 25 to be open for outbound connections
- Some ISPs and cloud providers block port 25
- Best deployed on a VPS with proper SMTP access
- Results may vary based on mail server configurations
- Some servers may reject verification attempts

## Security

- Always use a strong API key
- Keep your `.env` file secure and never commit it
- Consider rate limiting in production
- Use HTTPS when deploying to production

## License

ISC
