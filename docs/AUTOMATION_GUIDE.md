# CoderNest Lead Harvester - Automation Guide

Welcome to the CoderNest Universal Webhook Automation Guide. This document explains how to automatically funnel high-ticket leads from external platforms (like Upwork, Fiverr, LinkedIn, or Legiit) directly into your CRM.

## The Webhook Endpoint

Your universal ingestion endpoint is:
`POST https://codernest.cloud/api/webhooks/leads`

### Security
All requests to this endpoint must include an `Authorization` header containing your `WEBHOOK_SECRET`. 

**Header Format:**
```
Authorization: Bearer YOUR_WEBHOOK_SECRET
```
*(You can set `WEBHOOK_SECRET` in your `.env` file or Vercel environment variables).*

---

## Payload Structure

Your automation tools (Zapier, Make, custom scrapers) must send a JSON payload in the following format:

```json
{
  "name": "Client Name",
  "email": "client@email.com",
  "source": "Upwork", 
  "requirements": "Looking for Next.js full stack developer...",
  "budget": "$2,500"
}
```

### Data Normalization Rules (What happens automatically):
1. **Name:** Auto-capitalized and trimmed. If missing, defaults to "Unknown Lead".
2. **Email:** Validated via strict Regex. **Invalid emails will cause the webhook to fail with a `400 Bad Request`**.
3. **Source:** Validated against known platforms (Upwork, Legiit, Fiverr, LinkedIn, Website, Manual). Unrecognized sources default to "Unknown Platform".
4. **Duplicates:** If the email already exists in your CoderNest CRM, the system will gracefully update the lead's `updatedAt` activity timestamp rather than creating a duplicate.

---

## Integration Examples

### 1. Zapier / Make.com Integration
If you are scraping Upwork RSS feeds or receiving emails from platforms, you can use Zapier or Make to parse the data and POST it to CoderNest.

**Setup in Make.com (Integromat):**
1. Add an **HTTP: Make a request** module.
2. **URL:** `https://codernest.cloud/api/webhooks/leads`
3. **Method:** `POST`
4. **Headers:**
   - Key: `Authorization` | Value: `Bearer YOUR_WEBHOOK_SECRET`
5. **Body Type:** Raw -> JSON
6. Map the parsed fields (`name`, `email`, `source`, `requirements`, `budget`) into the JSON format above.

### 2. Custom Python Scraper / Puppeteer
If you are building your own custom scraper to hunt leads, you can push them directly using Python's `requests` library.

**Python Example:**
```python
import requests

webhook_url = "https://codernest.cloud/api/webhooks/leads"
headers = {
    "Authorization": "Bearer YOUR_WEBHOOK_SECRET",
    "Content-Type": "application/json"
}

payload = {
    "name": "Jane Doe",
    "email": "jane@techstartup.com",
    "source": "LinkedIn",
    "requirements": "Need a React native developer for a 3-month contract.",
    "budget": "$5,000"
}

response = requests.post(webhook_url, json=payload, headers=headers)

if response.status_code == 201:
    print("Lead successfully injected into CoderNest!")
else:
    print(f"Failed to push lead: {response.text}")
```

### 3. Client Website Contact Form
You can easily plug this webhook into any external WordPress site or landing page builder (Webflow, Framer) that supports Webhooks on form submission. Just map the form fields to the required JSON schema and pass the Bearer token in the header.

---
**Happy Hunting!** All ingested leads will appear instantly in your `/admin` command center and the live feed on the Lead Harvester page.
