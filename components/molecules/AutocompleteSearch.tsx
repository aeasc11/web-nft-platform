'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/atoms/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Send, UserRound, LoaderCircle } from 'lucide-react'
import useDebounce from '@/hooks/useDebounce'
import { truncateEthAddress } from '@/lib/utils'
import { User } from '@/lib/types'

interface AutocompleteSearchProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

// Fetch all users
const fetchAllUsers = async () => {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch all users')
  return response.json()
}

// Fetch users by username
const fetchFilteredUsers = async (query: string) => {
  const response = await fetch(`/api/users?username=${query}`)
  if (!response.ok) throw new Error('Failed to fetch filtered users')
  return response.json()
}

// Can be used as a controlled component or uncontrolled component.
const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Search for a user',
  error,
  className,
  onBlur,
}) => {
  const [query, setQuery] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  // Synchronize local state when parent value changes.
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Query to fetch all users (cached data)
  const {
    data: allUsers,
    isFetched: isFetchedAllUsers,
    isLoading: isLoadingAllUsers,
  } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: fetchAllUsers,
  })

  // Query for filtered results; runs only when the debounced query exists
  // and is not a wallet address (starting with "0x")
  const {
    data: filteredUsers,
    isFetched: isFetchedFilteredUsers,
    isLoading: isLoadingFilteredUsers,
  } = useQuery({
    queryKey: ['users', debouncedQuery],
    queryFn: () => fetchFilteredUsers(debouncedQuery),
    enabled:
      !!debouncedQuery &&
      !debouncedQuery.startsWith('0x') &&
      debouncedQuery.length > 2,
  })

  const isLoading = isLoadingAllUsers || isLoadingFilteredUsers

  const handleUserSelect = (user: User) => {
    const selectedAddress = user.wallet_address
    setQuery(selectedAddress)
    onChange && onChange(selectedAddress)
    setIsFocused(false)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange && onChange(e.target.value)
  }

  // Determine which user list to display based on the query type.
  let displayedUsers: User[] = []

  if (debouncedQuery.startsWith('0x') && allUsers) {
    // When the query is a wallet address, filter the cached allUsers data client-side.
    displayedUsers = allUsers.filter((user: User) =>
      user.wallet_address.toLowerCase().includes(debouncedQuery.toLowerCase()),
    )
  } else if (debouncedQuery && !debouncedQuery.startsWith('0x')) {
    if (filteredUsers) {
      displayedUsers = filteredUsers
    }
  } else if (!debouncedQuery && allUsers) {
    displayedUsers = allUsers
  }

  // Decide if dropdown should be shown.
  const shouldShowDropdown =
    isFocused && (isFetchedAllUsers || isFetchedFilteredUsers)

  return (
    <div className={`w-full max-w-xl mx-auto relative ${className}`}>
      <div className='relative flex flex-col justify-start items-center'>
        <div className='w-full max-w-sm sticky top-0 bg-background z-10 '>
          <div>
            <Input
              type='text'
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={(e) => {
                setTimeout(() => setIsFocused(false), 200)
                onBlur && onBlur(e)
              }}
              error={error}
              displayError='top'
              className='pl-3 pr-9 py-1.5 h-9 rounded-lg focus-visible:ring-offset-0 h-[42px]'
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4'>
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  <motion.div
                    key='loader'
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LoaderCircle className='w-4 h-4 animate-spin text-gray-400 dark:text-gray-500' />
                  </motion.div>
                ) : query.length > 2 ? (
                  <motion.div
                    key='send'
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                  </motion.div>
                ) : (
                  <motion.div
                    key='search'
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Search className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className='w-full absolute top-10 z-10'>
          <AnimatePresence>
            {shouldShowDropdown && displayedUsers.length > 0 && (
              <motion.div
                className='w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  height: { duration: 0.4 },
                  opacity: { duration: 0.2 },
                }}
              >
                <motion.ul>
                  {displayedUsers.map((user: User) => (
                    <motion.li
                      key={user.user_id}
                      className='px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className='flex items-center gap-2'>
                        <UserRound className='h-4 w-4 text-gray-500' />
                        <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {user.username}
                        </span>
                        <span className='text-gray-500 text-xs'>
                          {truncateEthAddress(user.wallet_address)}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AutocompleteSearch
