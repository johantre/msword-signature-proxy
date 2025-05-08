addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ success: false, errorcode: 400, description: 'No input file(s)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const uploadFormData = new FormData()
    uploadFormData.append('file', new File([file.stream()], file.name || 'upload.png', {
      type: file.type || 'application/octet-stream',
    }))

    const response = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: uploadFormData,
    })

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  return new Response('Method Not Allowed', { status: 405 })
}
