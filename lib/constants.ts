import { mainnet, sepolia, polygon } from 'viem/chains'

export const accessTokenName = 'web3-wallet-platform-access-token'
export const refreshTokenName = 'web3-wallet-platform-refresh-token'
export const secureCookieName = 'web3-wallet-platform-secure-cookie'

export const chains = {
  [mainnet.id]: mainnet.name,
  [sepolia.id]: sepolia.name,
  [polygon.id]: polygon.name,
}
