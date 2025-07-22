import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Delete user function is running!");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Create Supabase admin client with the SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get the user object from the request's authorization header to identify the user
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();

    // 3. Check if a user was found
    if (!user) {
      throw new Error("Authentication error: Could not find user.");
    }

    // --- NEW STEP 4: CLEAN UP ALL ASSOCIATED PUBLIC DATA ---
    // This must happen BEFORE deleting the user from auth.
    // The order here matters to respect foreign key constraints.

    // 4a. Delete Learning Logs (depends on modules and departments)
    const { error: logsError } = await supabaseAdmin
      .from('learning_logs')
      .delete()
      .eq('user_id', user.id);
    if (logsError) throw new Error(`Failed to delete learning logs: ${logsError.message}`);

    // 4b. Delete Modules (depends on departments)
    const { error: modulesError } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('user_id', user.id);
    if (modulesError) throw new Error(`Failed to delete modules: ${modulesError.message}`);

    // 4c. Delete Departments (no other dependencies in this group)
    const { error: deptsError } = await supabaseAdmin
      .from('departments')
      .delete()
      .eq('user_id', user.id);
    if (deptsError) throw new Error(`Failed to delete departments: ${deptsError.message}`);
    
    // 4d. Delete Profile (depends only on auth.users)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (profileError) throw new Error(`Failed to delete profile: ${profileError.message}`);


    // --- STEP 5: PERFORM THE FINAL AUTH USER DELETION ---
    // This is now safe to do because no other tables reference this user.id.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (authError) {
      // This might catch cases like the user being already deleted or other issues.
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    // --- STEP 6: RETURN SUCCESS ---
    return new Response(JSON.stringify({ message: "User deleted successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // --- STEP 7: RETURN ERROR ---
    console.error("Error in delete-user function:", error.message); // Log the specific error on the server
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Using 500 for server-side errors is more appropriate
    });
  }
});