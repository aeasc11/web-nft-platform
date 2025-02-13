import { NextResponse } from 'next/server'
import { clearTokens } from '@/server/auth'

export async function POST() {
  try {
    await clearTokens()

    // 200 ms delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
