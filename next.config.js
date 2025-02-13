/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'localhost',
      'opensea.io',
      'nft-cdn.alchemy.com',
      'metadata.ens.domains',
      'ipfs.io',
      'i.seadn.io',
    ],
  },
}

module.exports = nextConfig
