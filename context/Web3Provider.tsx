'use client'

import { useRouter } from 'next/navigation'
import { SiweMessage } from 'siwe'
import { createSiweMessage } from 'viem/siwe'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider as NextRainbowKitProvider,
  darkTheme,
  createAuthenticationAdapter,
} from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css'

import { web3Config } from '@/config/web3-config'
import { useAuthenticated, useDisconnectAll } from '@/hooks/useAuthentication'
import { useGlobalStore } from '@/stores/global'
import TanstackProvider from './TanstackProvider'

type Props = {
  cookie: string | null
  children?: React.ReactNode
}

const isProd = process.env.NODE_ENV === 'production'

// API endpoint functions replacing TRPC calls
export const getNonce = async () => {
  const res = await fetch('/api/auth/nonce', {
    method: 'POST',
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch nonce')
  const data = await res.json()
  return data.nonce
}

export const login = async (message: any, signature: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  return data
}

export const logout = async () => {
  const res = await fetch('/api/auth/logout', { method: 'POST' })
  if (!res.ok) throw new Error('Logout failed')
}

const RainbowKitProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { setIsSignupModalShown } = useGlobalStore()
  const { disconnect } = useDisconnectAll()
  const isAuthenticated = useAuthenticated()

  const adapter = createAuthenticationAdapter({
    getNonce: async () => await getNonce(),
    createMessage: ({ nonce, address, chainId }) => {
      return createSiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        chainId,
        statement: 'Sign in with Ethereum',
        uri: window.location.origin,
        version: '1',
        nonce,
      })
    },
    getMessageBody: ({ message }) => message,
    verify: async ({ message, signature }) => {
      const data = await login(message, signature)
      if (data?.signup) {
        setIsSignupModalShown(true)
        return true
      }
      router.refresh()
      return true
    },
    signOut: async () => {
      await logout()
      router.refresh()
    },
  })

  const status = isAuthenticated ? 'authenticated' : 'unauthenticated'

  return (
    <RainbowKitAuthenticationProvider status={status} adapter={adapter}>
      <NextRainbowKitProvider
        theme={darkTheme()}
        modalSize='compact'
        initialChain={isProd ? mainnet : sepolia}
      >
        {children}
      </NextRainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  )
}

const Web3Provider: React.FC<Props> = ({ cookie, children }) => {
  const initialState = cookieToInitialState(web3Config, cookie)

  return (
    <WagmiProvider config={web3Config} initialState={initialState}>
      <TanstackProvider>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </TanstackProvider>
    </WagmiProvider>
  )
}

export default Web3Provider
