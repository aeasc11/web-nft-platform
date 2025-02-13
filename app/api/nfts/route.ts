import { NextRequest, NextResponse } from 'next/server'

import {
  ALCHEMY_CHAIN_MAP_TO_API,
  SUPPORTED_CHAINS,
  SupportedChainId,
} from '@/config/rpcs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chainId = searchParams.get('chainId')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 },
      )
    }

    if (!chainId || !(chainId in ALCHEMY_CHAIN_MAP_TO_API)) {
      return NextResponse.json(
        { error: 'Valid chainId parameter is required' },
        { status: 400 },
      )
    }

    const apiUrl = ALCHEMY_CHAIN_MAP_TO_API[Number(chainId) as SupportedChainId]
    const apiKey = process.env.ALCHEMY_API_KEY
    const url = `${apiUrl}${apiKey}/getContractsForOwner?owner=${address}&pageSize=100&withMetadata=true`

    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch NFTs' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in NFTs API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
