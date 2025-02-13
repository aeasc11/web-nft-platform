import { mainnet, sepolia, polygon } from 'wagmi/chains'

// Supported chains
export const SUPPORTED_CHAINS = [mainnet, sepolia, polygon] as const

// Union type of chain IDs
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

// RPC URLs as a map of chain IDs to URLs
export type RpcUrls = {
  readonly [ChainId in SupportedChainId]: readonly string[]
}

// Defined RPC URLs for each chain
export const RPC_URLS: RpcUrls = {
  [polygon.id]: ['https://polygon.llamarpc.com'],
  [mainnet.id]: ['https://eth.llamarpc.com', 'https://cloudflare-eth.com'],
  [sepolia.id]: ['https://rpc.sepolia.org'],
} as const

// Alchemy API mapping type
export type AlchemyChainMapToApi = {
  readonly [ChainId in SupportedChainId]: `https://${string}.alchemy.com/${string}/`
}

// Alchemy API mapping for each supported chain
export const ALCHEMY_CHAIN_MAP_TO_API: AlchemyChainMapToApi = {
  [polygon.id]: 'https://polygon-mainnet.g.alchemy.com/nft/v3/',
  [mainnet.id]: 'https://eth-mainnet.g.alchemy.com/nft/v3/',
  [sepolia.id]: 'https://eth-sepolia.g.alchemy.com/nft/v3/',
} as const
