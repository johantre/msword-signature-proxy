export default {
  async fetch(request) {
    console.log("🚀 New request:", request.method, request.url);

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        console.log("❌ Not multipart/form-data:", contentType);
        return new Response("Expected multipart/form-data", { status: 400 });
      }

      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file.arrayBuffer !== "function") {
        console.log("❌ No file found in formData or not a valid file");
        return new Response(
          JSON.stringify({ success: false, description: "No valid file in upload" }),
          { status: 400 }
        );
      }

      console.log("📦 File received:", file.name, file.type, file.size);

      const forwardFormData = new FormData();
      forwardFormData.append("file", file, file.name);

      console.log("📤 Sending to Uguu...");
      const uguuResponse = await fetch("https://uguu.se/upload.php", {
        method: "POST",
        body: forwardFormData,
      });

      const uguuText = await uguuResponse.text();
      console.log("📨 Uguu raw response text:", uguuText);

      return new Response(JSON.stringify({
        success: true,
        status: uguuResponse.status,
        data: uguuText
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      console.log("🔥 Error during upload:", err.stack || err.message);
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}
