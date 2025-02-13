'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { truncateEthAddress } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/atoms/Dialog'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useGlobalStore } from '@/stores/global'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc721Abi, toHex } from 'viem'
import { erc1155Abi } from '@/abis/erc1155'
import AutocompleteSearch from '@/components/molecules/AutocompleteSearch'

type SendNFTFormData = {
  recipientAddress: string
  amount: string
}

const SendNFTModal: React.FC = () => {
  const { isSendNFTModalShown, setIsSendNFTModalShown, selectedNFT } =
    useGlobalStore()
  const { address, chain } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Web3 integration with destructured error
  const {
    data: hash,
    error: writeError,
    writeContract,
    reset: resetWriteContract,
    isPending,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SendNFTFormData>({
    mode: 'onChange',
    defaultValues: {
      recipientAddress: '',
      amount: '1',
    },
  })

  const isERC1155 = selectedNFT?.tokenType === 'ERC1155'

  // Reset form and errors when modal opens
  useEffect(() => {
    if (isSendNFTModalShown) {
      reset()
      resetWriteContract()
    }
  }, [isSendNFTModalShown, reset, resetWriteContract])

  const onSubmit: SubmitHandler<SendNFTFormData> = async (values) => {
    setIsSubmitting(true)
    try {
      if (!selectedNFT || !chain?.id) return

      const commonParams = {
        address: selectedNFT.address as `0x${string}`,
        account: address as `0x${string}`,
      }

      // Validate that the amount is a valid positive integer before conversion
      if (Number(values?.amount) <= 0) {
        throw new Error('Amount must be greater than zero')
      }

      if (isERC1155) {
        await writeContract({
          ...commonParams,
          abi: erc1155Abi,
          functionName: 'safeTransferFrom',
          args: [
            address as `0x${string}`,
            values.recipientAddress as `0x${string}`,
            BigInt(selectedNFT.displayNft.tokenId[0]),
            toHex(BigInt(values.amount)),
          ],
        })
      } else {
        await writeContract({
          ...commonParams,
          abi: erc721Abi,
          functionName: 'safeTransferFrom',
          args: [
            address as `0x${string}`,
            values.recipientAddress as `0x${string}`,
            BigInt(selectedNFT.displayNft.tokenId),
          ],
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonText = isPending
    ? 'Signing transaction...'
    : isConfirming || isSubmitting
      ? 'Sending...'
      : 'Send NFT'

  return (
    <Dialog open={isSendNFTModalShown} onOpenChange={setIsSendNFTModalShown}>
      <DialogContent className='bg-white shadow-lg sm:max-w-md'>
        <div className='max-h-[80vh] overflow-y-auto p-6'>
          <DialogTitle className='text-lg font-bold text-center'>
            Send NFT
          </DialogTitle>
          <Description className='text-center text-sm mb-4'>
            Send an NFT to another wallet. Make sure to check the recipient
            address and network before sending.
          </Description>
          <div className='text-center space-y-2'>
            <div className='flex flex-row gap-2 justify-between'>
              <div className='flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg'>
                <span className='text-sm font-bold'>
                  {chain?.name || 'Unknown Chain'}:
                </span>
                <span className='font-mono ml-1 text-sm'>
                  {truncateEthAddress(address || '')}
                </span>
              </div>
              <div className='flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 rounded-lg'>
                <span className='text-sm font-bold'>Type:</span>
                <span className='font-mono ml-1 text-sm'>
                  {selectedNFT?.tokenType}
                </span>
              </div>
            </div>
            {selectedNFT && (
              <div className='p-4 border rounded-lg'>
                <p className='font-medium'>{selectedNFT.name}</p>
                <p className='text-sm text-gray-600'>
                  Balance: {selectedNFT.totalBalance}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <Controller
                control={control}
                name='recipientAddress'
                rules={{
                  required: 'Recipient address is required',
                  pattern: {
                    value: /^0x[a-fA-F0-9]{40}$/,
                    message: 'Invalid Ethereum address',
                  },
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <AutocompleteSearch
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder='Recipient Address (0x...)'
                    className='mt-4'
                  />
                )}
              />
              {errors.recipientAddress && (
                <p className='text-red-500 mt-1 text-sm text-center'>
                  {errors.recipientAddress.message}
                </p>
              )}
            </div>

            <div>
              {isERC1155 && (
                <Input
                  {...register('amount', {
                    required: 'Amount is required for ERC1155',
                    min: { value: 1, message: 'Minimum amount is 1' },
                    max: {
                      value: selectedNFT?.totalBalance || 1,
                      message: `Maximum amount is ${selectedNFT?.totalBalance}`,
                    },
                  })}
                  type='number'
                  placeholder='Amount to send'
                  error={errors.amount?.message}
                />
              )}
            </div>

            {isConfirming && (
              <p className='bg-green-300 border text-xs text-green-700 rounded-lg p-2 text-sm text-center break-all'>
                <b>Confirming...</b> <br />
                <span className='font-mono'>{hash}</span>
              </p>
            )}

            {isConfirmed && (
              <p className='text-green-500 text-sm text-center'>
                Transfer successful!
              </p>
            )}

            {(writeError || waitError) && (
              <p className='text-red-500 text-sm text-center w-full'>
                <b>Error:</b> {writeError?.message || waitError?.message}
              </p>
            )}

            <Button
              type='submit'
              variant='primary'
              className='w-full'
              disabled={isSubmitting || isConfirming}
            >
              {buttonText}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendNFTModal
