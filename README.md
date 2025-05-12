# MSWord Signature Proxy

Cloudflare Worker acting as a proxy to avoid CORS issues when uploading signature images to services like https://uguu.se.

## Deployment

1. Install Node.js (https://nodejs.org)
2. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```
3. Login:
   ```bash
   wrangler login
   ```
4. Deploy:
   ```bash
   wrangler deploy
   ```

## Result

The worker is accessible at:
```
https://msword-signature-proxy.<your-username>.workers.dev
E.g. 
https://msword-signature-proxy.johantre.workers.dev
```

Use this as upload-URL in your frontend JavaScript-app.

**Example in HTML-frontend:**
```js
const proxyUrl = "https://msword-signature-proxy.johantre.workers.dev";
fetch(proxyUrl, {
  method: "POST",
  body: formData
});
```
