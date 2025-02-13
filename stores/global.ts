import { create } from 'zustand'
import { NFTContract } from '@/lib/types'

type GlobalStore = {
  isSignupModalShown: boolean
  setIsSignupModalShown: (value: boolean) => void
  isSendNFTModalShown: boolean
  setIsSendNFTModalShown: (value: boolean) => void
  selectedNFT: NFTContract | null
  setSelectedNFT: (value: NFTContract | null) => void
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  isSignupModalShown: false,
  setIsSignupModalShown: (value) => set({ isSignupModalShown: value }),
  isSendNFTModalShown: false,
  setIsSendNFTModalShown: (value) => set({ isSendNFTModalShown: value }),
  selectedNFT: null,
  setSelectedNFT: (value) => set({ selectedNFT: value }),
}))
