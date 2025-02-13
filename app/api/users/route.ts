import { NextResponse } from 'next/server'

import { getSupabaseClient } from '@/server/db/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  console.log('username', username)

  const supabase = getSupabaseClient()

  // if no username, return all users
  if (!username) {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, username, user_id')
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } else {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, username, user_id')
      .ilike('username', `%${username}%`)
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  }
}
