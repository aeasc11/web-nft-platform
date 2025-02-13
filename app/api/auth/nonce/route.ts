import { NextResponse } from 'next/server'
// import { generateNonce } from 'siwe'
import { getSecureSession } from '@/server/auth'
import { generateSiweNonce } from 'viem/siwe'

export async function GET() {
  const session = await getSecureSession()
  session.nonce = generateSiweNonce()
  await session.save()
  return NextResponse.json({ nonce: session.nonce })
}
