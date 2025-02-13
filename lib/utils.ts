import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const truncateEthAddress = (
  publicKey?: string,
  maxEthAddressLength = 4,
) => {
  if (!publicKey) return ''

  return `${publicKey.slice(0, maxEthAddressLength)}...${publicKey.slice(-maxEthAddressLength)}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
