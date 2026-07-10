// ============================================================
// Lolo Cosmetics — Edge Function: admin-users
// Owner-only user management. Deployed on Supabase servers, so
// the service (secret) key never reaches the browser.
//
// Deploy: Dashboard → Edge Functions → Deploy new function
//         → via Editor → name it EXACTLY: admin-users → paste
//         this whole file → Deploy. (Keep "Verify JWT" ON.)
//
// Rules enforced here, on the server:
//   - caller must be signed in AND have role 'owner'
//   - mutating actions only ever target role 'employee'
//     (the owner account can never be banned/deleted — not even
//     by itself; account recovery stays in the Supabase Dashboard)
//   - created accounts are employees (DB trigger assigns the role)
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // --- who is calling? ---
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: userData } = await admin.auth.getUser(token)
    const caller = userData?.user
    if (!caller) return json({ error: 'unauthorized' }, 401)

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()
    if (callerProfile?.role !== 'owner') return json({ error: 'forbidden' }, 403)

    const body = await req.json()

    // mutating actions may only target employees
    const assertEmployee = async (userId: string) => {
      const { data } = await admin.from('profiles').select('role').eq('id', userId).single()
      if (!data) throw new Error('user not found')
      if (data.role !== 'employee') throw new Error('target must be an employee')
    }

    switch (body.action) {
      case 'list': {
        const [authList, profiles] = await Promise.all([
          admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
          admin.from('profiles').select('*'),
        ])
        if (authList.error) throw authList.error
        if (profiles.error) throw profiles.error
        const users = (profiles.data ?? [])
          .map((p) => {
            const au = authList.data.users.find((u) => u.id === p.id) as
              | { last_sign_in_at?: string; banned_until?: string }
              | undefined
            return {
              id: p.id,
              email: p.email,
              full_name: p.full_name,
              role: p.role,
              created_at: p.created_at,
              last_sign_in_at: au?.last_sign_in_at ?? null,
              banned: !!au?.banned_until && new Date(au.banned_until) > new Date(),
            }
          })
          .sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0))
        return json({ users })
      }

      case 'create': {
        const { email, password, full_name } = body
        if (!email || !password || String(password).length < 8)
          throw new Error('password too short')
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
        if (error) throw error
        if (full_name)
          await admin.from('profiles').update({ full_name }).eq('id', data.user.id)
        return json({ ok: true })
      }

      case 'set_password': {
        if (!body.password || String(body.password).length < 8)
          throw new Error('password too short')
        await assertEmployee(body.user_id)
        const { error } = await admin.auth.admin.updateUserById(body.user_id, {
          password: body.password,
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'set_email': {
        if (!body.email) throw new Error('invalid email')
        await assertEmployee(body.user_id)
        const { error } = await admin.auth.admin.updateUserById(body.user_id, {
          email: body.email,
          email_confirm: true,
        })
        if (error) throw error
        // profiles.email is a copy — keep it in sync
        await admin.from('profiles').update({ email: body.email }).eq('id', body.user_id)
        return json({ ok: true })
      }

      case 'ban': {
        await assertEmployee(body.user_id)
        const { error } = await admin.auth.admin.updateUserById(body.user_id, {
          ban_duration: '87600h', // ~10 years
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'unban': {
        await assertEmployee(body.user_id)
        const { error } = await admin.auth.admin.updateUserById(body.user_id, {
          ban_duration: 'none',
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'delete': {
        await assertEmployee(body.user_id)
        const { error } = await admin.auth.admin.deleteUser(body.user_id)
        if (error) throw error
        return json({ ok: true })
      }

      default:
        return json({ error: 'unknown action' }, 400)
    }
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 400)
  }
})
