'use client'

import { useAccount } from 'wagmi'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { NFTContract } from '@/lib/types'
import { Button } from '@/components/atoms/Button'
import { useGlobalStore } from '@/stores/global'
import { useAuthenticated } from '@/hooks/useAuthentication'

const fetchNFTs = async (address: string, chainId: number) => {
  const response = await fetch(
    `/api/nfts?address=${address}&chainId=${chainId}`,
    {
      method: 'GET',
      headers: { accept: 'application/json' },
    },
  )
  if (!response.ok) throw new Error('Failed to fetch NFTs')
  return response.json()
}

const UserNFTs = () => {
  const { setIsSendNFTModalShown, setSelectedNFT } = useGlobalStore()
  const { address, chainId } = useAccount()
  const isAuthenticated = useAuthenticated()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['nfts', address, chainId],
    queryFn: () => fetchNFTs(address as string, chainId as number),
    enabled: !!chainId && isAuthenticated,
    refetchOnWindowFocus: false,
  })

  if (!isAuthenticated)
    return (
      <div className='flex justify-center items-center h-32 text-lg text-gray-400'>
        Connect your wallet to view your NFTs
      </div>
    )

  if (isLoading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='flex justify-center items-center h-32 text-lg text-gray-400'
      >
        Loading your NFTs...
      </motion.div>
    )

  if (isError)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='flex justify-center items-center h-32 text-lg text-red-400'
      >
        Error loading NFTs
      </motion.div>
    )

  const nfts: NFTContract[] = data?.contracts || []
  const filteredNfts = nfts.filter((nft) => !nft.isSpam)

  const getNFTImage = (nft: NFTContract) =>
    nft.image?.cachedUrl ||
    nft.image?.thumbnailUrl ||
    nft.image?.pngUrl ||
    nft.image?.originalUrl ||
    nft.openSeaMetadata?.imageUrl ||
    ''

  const handleNFTClick = (nft: NFTContract) => {
    setSelectedNFT(nft)
    setIsSendNFTModalShown(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='w-full mt-10 max-w-5xl'
    >
      {filteredNfts.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='text-center py-8'
        >
          No NFTs found
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'
        >
          {filteredNfts.map((nft) => (
            <motion.div
              key={nft.address}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className='bg-white/5 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200/10 group'
            >
              <div className='aspect-square w-full relative bg-gray-800'>
                {getNFTImage(nft) ? (
                  <Image
                    onClick={() => handleNFTClick(nft)}
                    src={getNFTImage(nft)}
                    alt={nft.displayNft?.name || nft.name}
                    className='object-cover w-full h-full cursor-pointer'
                    loading='lazy'
                    fill
                    unoptimized={getNFTImage(nft)
                      .toLowerCase()
                      .endsWith('.gif')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.parentElement?.classList.add(
                        'flex',
                        'items-center',
                        'justify-center',
                      )
                      target.replaceWith(document.createTextNode('No Image'))
                    }}
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-400'>
                    No Image
                  </div>
                )}
              </div>
              <div className='p-4'>
                <h3 className='font-semibold truncate'>
                  {nft.displayNft?.name || nft.name}
                </h3>
                <p className='text-sm text-gray-400'>
                  {nft.totalBalance} {nft.symbol}
                </p>
              </div>
              <div className='p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <Button
                  variant='primary'
                  className='w-full'
                  onClick={() => handleNFTClick(nft)}
                >
                  Send to a friend
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default UserNFTs
