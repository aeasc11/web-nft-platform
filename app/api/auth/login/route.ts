import { NextResponse } from 'next/server'
import { createSiweMessage, verifySiweMessage } from 'viem/siwe'
import { getSecureSession } from '@/server/auth'
import { chains } from '@/lib/constants'
import { getSupabaseAdminClient } from '@/server/db/supabase'
import { generateTokens } from '@/server/auth'
import { publicClient } from '@/config/web3-config'

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json()
    const session = await getSecureSession()

    const siweMessage = createSiweMessage(message)

    try {
      // First verify the signature
      const success = await publicClient.verifySiweMessage({
        message,
        signature,
      })

      if (!success) {
        console.error('Signature verification failed')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 422 },
        )
      }

      //  Verify if the nonce matches
      if (siweMessage.nonce !== session.nonce) {
        console.error('Nonce verification failed:', {
          expectedNonce: session.nonce,
          receivedNonce: siweMessage.nonce,
        })
        return NextResponse.json({ error: 'Invalid nonce' }, { status: 422 })
      }

      // Update session with verified data
      session.address = siweMessage.address
      session.chain = chains[siweMessage.chainId as keyof typeof chains]
      await session.save()

      // Get the user user from the database
      const supabase = getSupabaseAdminClient()

      // Find the user user by wallet address and chain
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', session.address)
        .maybeSingle()

      if (userError) {
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 },
        )
      }

      if (!user) {
        return NextResponse.json({ signup: true })
      }

      // Generate login tokens for the user
      await generateTokens(user.user_id)

      // Cleanup current auth data
      await session.destroy()

      return NextResponse.json({ success: true })
    } catch (verifyError) {
      console.error('SIWE verification error:', verifyError)
      return NextResponse.json(
        { error: 'Failed to verify signature' },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
