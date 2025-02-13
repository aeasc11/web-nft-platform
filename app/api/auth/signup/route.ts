import { NextResponse } from 'next/server'
import { getSecureSession } from '@/server/auth'
import { getSupabaseAdminClient } from '@/server/db/supabase'
import { generateTokens } from '@/server/auth'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    // Validate required input from the request body
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 },
      )
    }

    // Retrieve the secure session
    const session = await getSecureSession()

    // Check if the session contains the wallet address and nonce
    if (!session.address || !session.nonce) {
      console.error(
        'Invalid session: Missing wallet address or nonce.',
        session,
      )
      return NextResponse.json(
        { error: 'Invalid session: wallet address or nonce missing.' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdminClient()

    // Check for an existing profile with this wallet
    const { data: profileWithWallet } = await supabase
      .from('users')
      .select('*')
      .eq('walletAddress', session.address)
      .eq('chain', session.chain)

    if (profileWithWallet && profileWithWallet.length > 0) {
      return NextResponse.json(
        { error: 'User with specified wallet already exists.' },
        { status: 409 },
      )
    }

    // Check if the username already exists
    const { data: profileWithUsername } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)

    if (profileWithUsername && profileWithUsername.length > 0) {
      return NextResponse.json(
        { error: 'User with specified username already exists.' },
        { status: 409 },
      )
    }

    // Insert the new user into the database
    const { error } = await supabase.from('users').insert({
      username,
      wallet_address: session.address,
      chain: session.chain,
    })

    if (error) {
      console.error('Error while inserting new user:', error)
      return NextResponse.json(
        { error: 'Error while creating new user!' },
        { status: 500 },
      )
    }

    // Retrieve the newly created profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', session.address)
      .eq('chain', session.chain)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found after signup' },
        { status: 404 },
      )
    }

    // Generate tokens and clean up the session
    await generateTokens(profile.user_id)
    session.destroy()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
