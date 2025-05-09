/**
 * Cloudflare Worker to handle file uploads, process them, and send them to Uguu.
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
  try {
    // Only accept POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({
            success: false,
            errorcode: 405,
            description: "Method Not Allowed"
        }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');

    // Ensure that a file has been provided
    if (!file) {
      return new Response(JSON.stringify({ success: false, errorcode: 400, description: 'No input file(s)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log received file details for debugging
    console.log('📦 File received:', file.name, file.type, file.size);

    // Send the file to Uguu for hosting
    const response = await sendToUguu(file);

    // Return the result
    if (response.success) {
      console.log('📤 File uploaded successfully:', response.data);
      return new Response(JSON.stringify({ success: true, data: response.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('📨 Uguu response error:', response);
      return new Response(JSON.stringify(response), {
        status: response.errorcode || 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.log('Error:', err);
    return new Response(JSON.stringify({ success: false, errorcode: 500, description: "Upload failed: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
  formData.append("files[]", file, file.name);
  console.log(formData);
  try {
    const response = await fetch("https://uguu.se/upload", {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    console.log("📨 Uguu raw response text:", text);

    return JSON.parse(text);
  } catch (error) {
    console.log("Error uploading file to Uguu:", error);
    return { success: false, errorcode: 500, description: "Error uploading to Uguu" };
  }
}
