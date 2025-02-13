'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { useRouter } from 'next/navigation'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useMutation } from '@tanstack/react-query'

import { useAuthenticated, useDisconnectAll } from '@/hooks/useAuthentication'
import { useGlobalStore } from '@/stores/global'

import LogoutButton from '@/components/organisms/LogoutButton'
import SignupModal, { SignupFormData } from '@/components/organisms/SignupModal'
import { Button } from '@/components/atoms/Button'

interface SignupResponse {
  ok: boolean
  error?: string
}

const signupRequest = async ({
  username,
}: SignupFormData): Promise<SignupResponse> => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Signup failed. Please try again.')
  }

  return data
}

const ConnectWallet: React.FC = () => {
  const router = useRouter()
  const { isSignupModalShown, setIsSignupModalShown } = useGlobalStore()
  const { disconnect } = useDisconnectAll()
  const { openConnectModal } = useConnectModal()

  const { mutateAsync: signup } = useMutation<
    SignupResponse,
    Error,
    SignupFormData
  >({
    mutationFn: signupRequest,
    onSuccess: () => {
      setIsSignupModalShown(false)
      router.refresh()
    },
    onError: (error) => {
      console.error('Signup error:', error.message)
      disconnect()
    },
  })

  if (useAuthenticated()) {
    return <LogoutButton />
  }

  return (
    <>
      <Button variant='primary' onClick={openConnectModal}>
        Connect Wallet
      </Button>

      <SignupModal
        open={isSignupModalShown}
        setOpen={setIsSignupModalShown}
        onSubmit={signup}
      />
    </>
  )
}

export default ConnectWallet
