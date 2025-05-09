/**
 * Cloudflare Worker to handle file uploads, process them, and send them to Uguu.
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',  // Sta verzoeken van elk domein toe
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Sta POST en OPTIONS methoden toe
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Sta specifieke headers toe
  };

  try {
    // CORS preflight verzoek (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: headers,
      });
    }

    // Alleen POST verzoeken accepteren
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
          success: false,
          errorcode: 405,
          description: "Method Not Allowed"
      }), {
          status: 405,
          headers: headers,
      });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('files[]');

    // Ensure that a file has been provided
    if (!file) {
      return new Response(JSON.stringify({ success: false, errorcode: 400, description: 'No input file(s)' }), {
        status: 400,
        headers: headers,
      });
    }

    // Log received file details for debugging
    console.log('📦 File received:', file.name, file.type, file.size);

    // Send the file to Uguu for hosting
    const response = await sendToUguu(file);

    // Return the result
    if (response.success && Array.isArray(response.files) && response.files.length > 0) {
      const uploadedUrl = response.files[0].url;
      console.log('📤 File uploaded successfully:', uploadedUrl);
      return new Response(JSON.stringify({ success: true, data: uploadedUrl }), {
        status: 200,
        headers: headers,
      });
    } else {
      console.log('📨 Uguu response error:', response);
      return new Response(JSON.stringify(response), {
        status: response.errorcode || 500,
        headers: headers,
      });
    }

  } catch (err) {
    console.log('Error:', err);
    return new Response(JSON.stringify({ success: false, errorcode: 500, description: "Upload failed: " + err.message }), {
      status: 500,
      headers: headers,
    });
  }
}

/**
 * Sends the file to Uguu for hosting and returns the response.
 *
 * @param {File} file - The file to upload
 * @returns {Object} - The response from Uguu
 */
async function sendToUguu(file) {
  console.log(file);
  const formData = new FormData();

  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  formData.append("files[]", blob, file.name);

  console.log(formData);
  console.log("🌐 Sending to Uguu with FormData:");
  for (const [key, value] of formData.entries()) {
    console.log(" →", key, value instanceof Blob ? `${value.type}, ${value.size} bytes` : value);
  }

  try {
    const response = await fetch("https://uguu.se/upload", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const text = await response.text();
    console.log("📨 Uguu raw response text:", text);

    return JSON.parse(text);
  } catch (error) {
    console.log("Error uploading file to Uguu:", error);
    return { success: false, errorcode: 500, description: "Error uploading to Uguu" };
  }
}
