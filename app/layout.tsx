import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Web3 Wallet Platform',
  description:
    'A modern web3 wallet interface for managing NFTs and connecting with other users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} font-sans`}>
        <main className='flex min-h-screen flex-col items-center justify-center p-24'>
          {children}
        </main>
      </body>
    </html>
  )
}
