import { cookies, headers } from 'next/headers'
import { refreshTokenName } from '@/lib/constants'
import Web3Provider from '@/context/Web3Provider'
import AuthProvider from '@/context/AuthProvider'
import ConnectWallet from '@/components/organisms/ConnectWallet'
import UserNFTs from '@/components/organisms/UserNFTs'
import SendNFTModal from '@/components/organisms/SendNFTModal'
import DetectAccountChange from '@/components/organisms/DetectAccountChange'

const AuthServerProvider = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const cookieAvailable = (await cookies()).has(refreshTokenName)
  const cookie = (await headers()).get('cookie')

  return (
    <Web3Provider cookie={cookie}>
      <AuthProvider value={cookieAvailable}>{children}</AuthProvider>
    </Web3Provider>
  )
}

export default function Home() {
  return (
    <AuthServerProvider>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
            Web3 NFT Platform
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Connect your wallet to start managing your NFTs and interact with
            other users on the platform.
          </p>
          <div className='mt-10'>
            <ConnectWallet />
          </div>
        </div>
      </div>
      <UserNFTs />
      <SendNFTModal />
      <DetectAccountChange />
    </AuthServerProvider>
  )
}
