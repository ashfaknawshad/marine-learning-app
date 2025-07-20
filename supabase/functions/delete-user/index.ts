import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Delete user function is running!");

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Create a Supabase client with SERVICE_ROLE_KEY for admin privileges.
    // This is safe to do in a server-side Edge Function.
    // It uses the new, valid secret name 'SERVICE_ROLE_KEY'.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get the user object from the request's authorization header.
    // This is how we identify who is calling the function.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await userClient.auth.getUser()

    // 3. Check if a user was found. If not, they are not authenticated.
    if (!user) {
      throw new Error("Authentication error: Could not find user.")
    }

    // 4. Perform the deletion using the admin client.
    // This is the protected administrative action.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
      throw error
    }

    // 5. Return a success response.
    return new Response(JSON.stringify({ message: "User deleted successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // 6. Return an error response if anything went wrong.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})