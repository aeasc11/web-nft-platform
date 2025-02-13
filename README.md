# Web3 NFT Wallet Platform

A modern web3 wallet interface that allows users to discover and send their NFTs and connect with other users.

## Features

- Login with wallet
- Change network (Ethereum, Polygon, Sepolia), default is Ethereum
- List of users NFTs
- Send NFTs to other wallets
- Search for users by username

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Blockchain**: wagmi, viem, rainbowkit
- **Database**: Supabase (PostgreSQL), Alchemy (Web3)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Query Handling**: React Query
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 20.x or later
- Supabase account
- Alchemy account
- Git

## Environment Variables

There is .env.example file with all the variables that are needed to be set, copy the file to .env and set the variables.

## Getting Started

1. Clone the repository:
   bash
   git clone <repository-url>
   cd web3-wallet-platform

2. Install dependencies:
   bash
   npm install

3. Set up your environment variables as described above.

4. Run the development server:
   bash
   npm run dev

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

├── abis/ # Contract ABIs
├── app/
│ ├── api/ # API routes
│ │ ├── auth/ # Authentication routes
│ │ ├── nft/ # NFT routes
│ │ ├── user/ # User routes
│ └── layout.tsx # Root layout
├── components/ # Reusable components
│ ├── atoms/ # Atoms
│ ├── molecules/ # Molecules
│ ├── organisms/ # Organisms
│ └── templates/ # Templates
├── config/ # Configuration files
├── context/ # Context providers
├── hooks/ # Custom React hooks
├── lib/ # Utility functions and configurations
├── server/ # Server actions and supabase client
├── stores/ # Zustand stores
└── types/ # TypeScript type definitions

### Users Table

- id (uuid, primary key)
- wallet_address (text, unique)
- username (text, unique)
- created_at (timestamp)
- updated_at (timestamp)

## Caveats and comments

- Next.js API routes are using POST requests without additional authentication headers. There could be a middleware to prevent CSRF attacks.
- There is not clickjacking protection and iframe is allowed
- When user change account from the wallet the page logs out
- There are few UI issues and improvements
- Added change network
- NFTs are fetched from alchemy API
- Missing is list of tokens
- dApp is not responsive
