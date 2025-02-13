import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

// Get the admin client (read/write to the database)
const getSupabaseAdminClient = (): SupabaseClient => {
  if (!adminClient) {
    // Check if the environment variables are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_API_KEY) {
      throw new Error(
        'Missing required Supabase environment variables: SUPABASE_URL or SUPABASE_API_KEY',
      )
    }

    adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_API_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        db: {
          schema: 'public',
        },
      },
    )
  }
  return adminClient
}

// Get the client (read only from the database)
const getSupabaseClient = (accessToken?: string) => {
  // Check if the environment variables are set
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error('Missing required Supabase environment variables')
  }

  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    ...(accessToken && {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }),
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
  )
}

export { type SupabaseClient, getSupabaseAdminClient, getSupabaseClient }
