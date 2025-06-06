# MSWord Signature Proxy

Cloudflare Worker acting as a proxy to avoid CORS issues when uploading signature images to services like https://uguu.se.

## ⚠️Dependencies⚠️
- Cloudflare services
- CLOUDFLARE_API_TOKEN stored in this project Secrets section
- Node.js package manager to install the dependency below
- Wrangler 

## Manual Deployment

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
## Automatic Deployment
This repo is provided with a [deploy.yml](.github/workflows/deploy.yml) workflow, that's been triggered when a change in the script is pushed to the main branch.

## Testing & Debugging
To check if all works properly, a separate [tail-logs.yml](.github/workflows/tail-logs.yml) is foreseen. It needs to be triggered manually and listens for 30sec to what's passing the line to Cloudflare.\
During those 30sec it becomes possible through CLI to investigate logging.
```
curl -X POST -F 'files[]=@<local path to an image>/img.png' https://msword-signature-proxy.johan-tre.workers.dev/
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
