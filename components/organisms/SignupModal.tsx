import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useForm, SubmitHandler } from 'react-hook-form'
import { truncateEthAddress } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/atoms/Dialog'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'

export type SignupFormData = {
  username: string
}

interface SignupModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (data: SignupFormData) => Promise<{ ok: boolean; error?: string }>
}

const SignupModal: React.FC<SignupModalProps> = ({
  open,
  setOpen,
  onSubmit,
}) => {
  const { address, chain } = useAccount()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<SignupFormData>({
    mode: 'onChange',
    defaultValues: { username: '' },
  })

  // Reset errors when the modal opens
  useEffect(() => {
    if (open) setApiError(null)
  }, [open])

  const handleFormSubmit: SubmitHandler<SignupFormData> = async (values) => {
    setIsSubmitting(true)

    try {
      const response = await onSubmit(values)
      if (!response.ok) throw new Error(response.error || 'Signup failed')

      setOpen(false)
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-white shadow-lg sm:max-w-md p-6'>
        <div className='space-y-4'>
          <DialogTitle className='text-lg font-bold text-center'>
            Welcome
          </DialogTitle>

          <div className='text-center space-y-2'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg'>
              <span className='text-sm font-medium'>
                {chain?.name || 'Unknown Chain'}:
                <span className='font-mono ml-1'>
                  {truncateEthAddress(address)}
                </span>
              </span>
            </div>
            <Description className='text-gray-600'>
              Please choose a username for your profile
            </Description>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='username' className='block text-sm font-medium'>
                Username
              </label>
              <Input
                id='username'
                autoFocus
                disabled={isSubmitting}
                className={errors.username ? 'border-red-500' : ''}
                {...register('username', {
                  required: 'Required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 40, message: 'Maximum 40 characters' },
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: 'Letters and numbers only',
                  },
                })}
              />

              {errors.username && (
                <p className='text-sm text-red-500'>
                  {errors.username.message}
                </p>
              )}
              {apiError && (
                <p className='text-sm text-red-500 text-center'>{apiError}</p>
              )}
            </div>

            <Button
              variant='primary'
              className='w-full'
              disabled={isSubmitting}
              type='submit'
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Signup'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SignupModal
