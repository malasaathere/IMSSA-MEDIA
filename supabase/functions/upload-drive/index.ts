// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// Supabase Edge Function — Upload file to Google Drive
// Uses modern Deno.serve() instead of deprecated deno.land/std import

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, mimeType, fileBase64 } = await req.json()

    if (!fileName || !fileBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: fileName and fileBase64 are required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 1. Read Google API Credentials from Supabase Secrets
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!clientId || !clientSecret || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Google credentials not configured in Supabase secrets.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 2. Exchange Refresh Token for a fresh Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      const errMsg = `Token refresh failed: ${tokenData.error} — ${tokenData.error_description}`
      console.error(errMsg)
      return new Response(
        JSON.stringify({ error: errMsg }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const accessToken = tokenData.access_token

    // 3. Convert base64 to binary
    const byteCharacters = atob(fileBase64)
    const byteArray = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i)
    }
    const fileBlob = new Blob([byteArray], { type: mimeType })

    // 4. Upload to Google Drive using multipart upload
    const formData = new FormData()
    formData.append(
      'metadata',
      new Blob([JSON.stringify({ name: fileName })], { type: 'application/json' })
    )
    formData.append('file', fileBlob)

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    )

    const uploadData = await uploadResponse.json()
    if (!uploadResponse.ok) {
      throw new Error(`Google Drive upload failed: ${JSON.stringify(uploadData)}`)
    }

    // 5. Make the file publicly viewable
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    })

    const publicUrl = `https://drive.google.com/uc?export=view&id=${uploadData.id}`

    return new Response(
      JSON.stringify({ url: publicUrl, id: uploadData.id, webViewLink: uploadData.webViewLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Edge Function error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
