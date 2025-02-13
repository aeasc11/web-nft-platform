'use client'

import { AuthContext } from '@/context/AuthProvider'
import { useContext } from 'react'
import { useConnections, useDisconnect } from 'wagmi'

export const useAuthenticated = () => useContext(AuthContext)

export const useDisconnectAll = () => {
  const connections = useConnections()
  const { disconnect } = useDisconnect()
  const disconnectAll = () => {
    connections.forEach(({ connector }) => {
      disconnect({ connector })
    })
  }
  return { disconnect: disconnectAll }
}
