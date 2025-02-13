'use client'

import { useDisconnectAll } from '@/hooks/useAuthentication'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from '@/components/atoms/Button'
import { truncateEthAddress } from '@/lib/utils'
import { Chain } from 'wagmi/chains'
import { LogOut } from 'lucide-react'
import { logout } from '@/context/Web3Provider'

const LogoutButton = () => {
  const { connector, chain, address } = useAccount()
  const { disconnect } = useDisconnectAll()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Hook for switching networks
  const {
    chains,
    switchChainAsync,
    isPending: isPendingSwitchChain,
  } = useSwitchChain()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
    }
    if (connector) {
      disconnect()
    }
    router.refresh()
  }

  const handleChainChange = (selectedChain: Chain) => {
    if (!switchChainAsync) {
      console.error('switchNetwork function is not available')
      return
    }
    // Prevent unnecessary switch
    if (chain?.id === selectedChain.id) {
      return
    }
    // console.log('Switching to chain:', selectedChain)
    switchChainAsync({ chainId: selectedChain.id })
  }

  return (
    <>
      <div className='block w-full'>
        <Button variant='outline' onClick={handleLogout} disabled={isLoading}>
          {isLoading ? 'Logging out...' : `${truncateEthAddress(address)}`}
          <LogOut className='w-4 h-4 ml-2' />
        </Button>
      </div>
      {chain?.name && (
        <div className='block w-full mt-2'>
          <p className='text-sm text-gray-500'>Connected to {chain.name}</p>
        </div>
      )}
      <div className='block w-full mt-2'>
        <label
          htmlFor='chain-select'
          className='block text-sm font-medium text-gray-700'
        >
          Change Network
        </label>
        <select
          id='chain-select'
          className='mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          value={chain?.id || ''}
          onChange={(e) => {
            const selectedChainId = Number(e.target.value)
            const selectedChain = chains.find((c) => c.id === selectedChainId)
            if (selectedChain) {
              handleChainChange(selectedChain)
            }
          }}
        >
          {chains.map((network) => (
            <option key={network.id} value={network.id}>
              {network.name} {isPendingSwitchChain ? '(switching)' : ''}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default LogoutButton
