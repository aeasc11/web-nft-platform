'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { logout } from '@/context/Web3Provider'
import { useRouter } from 'next/navigation'
import { useDisconnectAll } from '@/hooks/useAuthentication'

const DetectAccountChange = () => {
  const router = useRouter()
  const { address: currentWalletAddress, connector } = useAccount()
  const { disconnect } = useDisconnectAll()

  // Use a ref to track wallet address without triggering re-renders
  const previousWalletAddressRef = useRef<string | undefined>(
    currentWalletAddress,
  )

  // Memoized sign out function
  const signOut = useCallback(async () => {
    console.log('Account change detected, signing out...')
    try {
      if (connector) {
        disconnect()
      }
      await logout()
      router.refresh()
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }, [disconnect, router])

  useEffect(() => {
    // update the ref without triggering a sign out.
    if (!previousWalletAddressRef.current && currentWalletAddress) {
      previousWalletAddressRef.current = currentWalletAddress
      return
    }

    // track wallet address changes
    if (
      previousWalletAddressRef.current &&
      previousWalletAddressRef.current !== currentWalletAddress
    ) {
      signOut()
      previousWalletAddressRef.current = currentWalletAddress
    }
  }, [currentWalletAddress, signOut])

  return null
}

export default DetectAccountChange
