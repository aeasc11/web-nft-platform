import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import { createStorage, cookieStorage, http, fallback } from 'wagmi'

import { RPC_URLS } from '@/config/rpcs'
import { mainnet, sepolia, polygon } from 'wagmi/chains'
import { createPublicClient } from 'viem'

// Create transports for each chain
const createTransport = (chainId: number) => {
  const urls = RPC_URLS[chainId as keyof typeof RPC_URLS] || []
  return fallback(
    urls.map((url: string) =>
      http(url, {
        batch: { wait: 0 },
        fetchOptions: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }),
    ),
  )
}

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID')
}

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const web3Config = getDefaultConfig({
  appName: 'Web3 NFT Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [
    {
      ...mainnet,
      rpcUrls: {
        default: {
          http: RPC_URLS[mainnet.id],
        },
        public: {
          http: RPC_URLS[mainnet.id],
        },
      },
    },
    {
      ...polygon,
      rpcUrls: {
        default: {
          http: RPC_URLS[polygon.id],
        },
      },
    },
    {
      ...sepolia,
      rpcUrls: {
        default: {
          http: RPC_URLS[sepolia.id],
        },
        public: {
          http: RPC_URLS[sepolia.id],
        },
      },
    },
  ],
  transports: {
    [mainnet.id]: createTransport(mainnet.id),
    [polygon.id]: createTransport(polygon.id),
    [sepolia.id]: createTransport(sepolia.id),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
