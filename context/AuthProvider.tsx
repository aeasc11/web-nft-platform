'use client'

import { createContext } from 'react'

export const AuthContext = createContext<boolean>(false)

const AuthProvider = ({
  children,
  value,
}: {
  children: React.ReactNode
  value: boolean
}) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
