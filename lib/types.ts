export interface SessionData {
  nonce: string
  address: string
  chain: string
}

export interface UserProfile {
  user_id: string
  created_at: string
  wallet_address: string
  username: string
  chain: string
}

export interface TokenPayload {
  sub: string
  username?: string
  walletAddress?: string
  chain?: string
}

export interface NFTContract {
  address: string
  name: string
  symbol: string
  totalBalance: string
  tokenType: string
  displayNft: {
    tokenId: string
    name: string
  }
  image: {
    cachedUrl: string
    thumbnailUrl: string | null
    pngUrl: string | null
    originalUrl: string
  }
  openSeaMetadata: {
    floorPrice: number | null
    collectionName: string
    imageUrl: string
    description: string | null
  }
  isSpam: boolean
}

export interface User {
  user_id: string
  username: string
  wallet_address: `0x${string}`
}
