import jwt from 'jsonwebtoken'

import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'

import {
  accessTokenName,
  refreshTokenName,
  secureCookieName,
} from '@/lib/constants'

import { getSupabaseAdminClient } from '@/server/db/supabase'

import { TokenPayload, UserProfile, SessionData } from '@/lib/types'

// extending the session data type to include our session data interface
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}

const minute = 60
const hour = minute * 60

const accessTokenExpiration = hour
const refreshTokenExpiration = 8 * hour

const generateAccessToken = async (data: TokenPayload) => {
  const expiresIn = accessTokenExpiration

  const accessToken = await jwt.sign(
    data,
    process.env.SUPABASE_JWT_SECRET as string,
    { expiresIn },
  )
  ;(await cookies()).set(accessTokenName, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    expires: new Date(Date.now() + expiresIn * 1000),
  })
}

const generateRefreshToken = async (data: { sub: string }) => {
  const expiresIn = refreshTokenExpiration

  const refreshToken = await jwt.sign(
    data,
    process.env.SUPABASE_JWT_SECRET as string,
    { expiresIn },
  )
  ;(await cookies()).set(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    expires: new Date(Date.now() + expiresIn * 1000),
  })
}

// Get the user
const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const supabase = getSupabaseAdminClient()

  const { data: profile, error } = await supabase
    .from('users')
    .select('user_id, created_at, wallet_address, username, chain')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !profile) {
    console.error('Error fetching user profile for id:', userId, error)
    throw new Error('User profile not found')
  }

  return profile
}

// Generate login tokens for the user
export const generateTokens = async (userId: string) => {
  const profile = await getUserProfile(userId)

  // Token payload
  const sessionPayload: TokenPayload = {
    sub: profile.user_id,
    username: profile.username,
    walletAddress: profile.wallet_address,
    chain: profile.chain,
  }

  // Ensure that tokens are generated and set in cookies.
  await generateAccessToken(sessionPayload)
  await generateRefreshToken({ sub: profile.user_id })

  return sessionPayload
}

// Clear the tokens
export const clearTokens = async () => {
  ;(await cookies()).delete(accessTokenName)
  ;(await cookies()).delete(refreshTokenName)
}

// Get the server auth session
export const getServerAuthSession = async () => {
  const token = (await cookies()).get(accessTokenName)?.value

  if (token) {
    try {
      return jwt.verify(
        token,
        process.env.SUPABASE_JWT_SECRET as string,
      ) as TokenPayload
    } catch (error) {
      console.error('[SIWE] Error verifying server auth session:', error)
      return null
    }
  }

  const refreshToken = (await cookies()).get(refreshTokenName)?.value
  if (!refreshToken) return null

  const decoded = jwt.verify(
    refreshToken,
    process.env.SUPABASE_JWT_SECRET as string,
  ) as { sub: string }

  const userId = decoded.sub
  if (!userId) return null

  return await generateTokens(userId)
}

// Get the secure session
export const getSecureSession = async () => {
  try {
    if (!process.env.SUPABASE_JWT_SECRET) {
      console.error('[SIWE] Missing SUPABASE_JWT_SECRET')
      throw new Error(
        'Missing required environment variable: SUPABASE_JWT_SECRET',
      )
    }

    const cookieStore = await cookies()
    console.debug('[SIWE] Cookie store initialized')

    const session = await getIronSession<SessionData>(cookieStore, {
      cookieName: secureCookieName,
      password: process.env.SUPABASE_JWT_SECRET,
      ttl: 5 * minute,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
      },
    })

    if (!session.nonce && !session.address && !session.chain) {
      console.debug('[SIWE] Initializing new session with empty values')
      session.nonce = ''
      session.address = ''
      session.chain = ''
      await session.save()
    }

    console.debug('[SIWE] Secure session state:', {
      hasNonce: !!session.nonce,
      hasAddress: !!session.address,
      hasChain: !!session.chain,
      cookieName: secureCookieName,
      env: process.env.NODE_ENV,
    })

    return session
  } catch (error) {
    console.error('[SIWE] Error initializing secure session:', error)
    throw error
  }
}

export const getCurrentUserId = async () => {
  const token = (await cookies()).get(accessTokenName)?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string,
    ) as { sub: string }

    return decoded.sub
  } catch (error) {
    return null
  }
}

export const isAuthenticated = async () => {
  const token = (await cookies()).get(accessTokenName)?.value
  if (!token) return false

  try {
    jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string)
    return true
  } catch (error) {
    return false
  }
}
