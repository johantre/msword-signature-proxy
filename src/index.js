export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response('Invalid Content-Type', { status: 400 });
    }

    const uploadResponse = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      headers: {
        'content-type': contentType
      },
      body: request.body
    });

    const result = await uploadResponse.text();
    const json = JSON.parse(result);

    return new Response(JSON.stringify(json), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}