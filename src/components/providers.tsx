'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, mainnet } from '@reown/appkit/networks'
import { useState } from 'react'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const metadata = {
  name: 'LandProof',
  description: 'Digital Land Ownership & Verification Platform',
  url: 'https://landproof.example.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [sepolia, mainnet],
})

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, mainnet],
  defaultNetwork: sepolia,
  metadata: metadata,
  features: {
    analytics: true
  }
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
