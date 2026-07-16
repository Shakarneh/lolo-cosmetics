// ============================================================
// Lolo Cosmetics — Edge Function: submit-review
// Public review submission, protected by Cloudflare Turnstile.
//
// Deploy: Dashboard → Edge Functions → Deploy new function
//         → via Editor → name it EXACTLY: submit-review → paste
//         this whole file → Deploy.
//         Then in the function's Details/Settings turn "Verify JWT" OFF
//         (visitors call this anonymously; Turnstile is the gate).
//
// Requires one secret (Dashboard → Edge Functions → Secrets):
//   TURNSTILE_SECRET_KEY = the Turnstile widget's Secret Key
//
// Flow, all on the server:
//   1. verify the Turnstile token with Cloudflare (rejects bots/scripts)
//   2. validate the fields (DB CHECK constraints backstop them)
//   3. insert the pending review with the service key
//   4. store up to 3 photos (best-effort — the review survives failures)
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PHOTOS = 3
const MAX_BYTES = 5 * 1024 * 1024 // matches the bucket's 5 MB limit
const EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

    const form = await req.formData()
    const token = String(form.get('token') ?? '')
    const productId = String(form.get('product_id') ?? '')
    const customerName = String(form.get('customer_name') ?? '').trim()
    const rating = Number(form.get('rating'))
    const reviewBody = String(form.get('body') ?? '').trim()

    // --- 1: the sender must be a human (Turnstile) ---
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) return json({ error: 'server not configured' }, 500)
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    })
    const outcome = await verify.json()
    if (!outcome.success) return json({ error: 'captcha failed' }, 403)

    // --- 2: validate ---
    if (!productId || customerName.length < 2 || customerName.length > 50)
      return json({ error: 'invalid input' }, 400)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return json({ error: 'invalid input' }, 400)
    if (reviewBody.length < 1 || reviewBody.length > 200)
      return json({ error: 'invalid input' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // --- 3: the review itself ---
    const { data: review, error: insError } = await admin
      .from('reviews')
      .insert({ product_id: productId, customer_name: customerName, rating, body: reviewBody })
      .select('id')
      .single()
    if (insError) throw insError

    // --- 4: photos, best-effort ---
    let photoFailed = false
    const files: File[] = []
    for (let i = 0; i < MAX_PHOTOS; i++) {
      const f = form.get(`photo${i}`)
      if (f instanceof File) files.push(f)
    }
    for (let i = 0; i < files.length; i++) {
      try {
        const f = files[i]
        const ext = EXT[f.type]
        if (!ext || f.size > MAX_BYTES) throw new Error('bad file')
        const path = `${review.id}/${i}.${ext}`
        const { error: upError } = await admin.storage
          .from('review-images')
          .upload(path, f, { contentType: f.type })
        if (upError) throw upError
        const { error: imgError } = await admin
          .from('review_images')
          .insert({ review_id: review.id, storage_path: path, position: i })
        if (imgError) throw imgError
      } catch {
        photoFailed = true
      }
    }

    return json({ ok: true, photoFailed })
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 400)
  }
})
