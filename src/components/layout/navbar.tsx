'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { Button } from '@/components/ui/button'
import { Map, Menu, Bell } from 'lucide-react'
import { Connect } from '@/components/connect'
import { useRoles } from '@/hooks/useRoles'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function Navbar() {
  const { address, isConnected, isAdmin, isRegistrar, isVerifier, isLegal } = useRoles()
  const publicClient = usePublicClient()
  const isMounted = useIsMounted()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!address || !publicClient) return
    let isMountedLocal = true

    async function checkUnread() {
      try {
        const lastSeenStr = localStorage.getItem('lastSeenBlock')
        if (!lastSeenStr) {
          if (isMountedLocal) setHasUnread(true)
          return
        }
        
        if (!publicClient) return
        const lastSeen = BigInt(lastSeenStr)
        const currentBlock = await publicClient.getBlockNumber()
        
        if (lastSeen >= currentBlock) return

        const PropertyRegistered = parseAbiItem('event PropertyRegistered(bytes32 indexed propertyId, address indexed owner, bytes32 indexed metadataHash, uint64 area, int32 latitudeE6, int32 longitudeE6)')
        const TransferProposed = parseAbiItem('event TransferProposed(bytes32 indexed propertyId, address indexed currentOwner, address indexed pendingOwner)')
        const TransferAccepted = parseAbiItem('event TransferAccepted(bytes32 indexed propertyId, address indexed previousOwner, address indexed newOwner)')
        const TransferCancelled = parseAbiItem('event TransferCancelled(bytes32 indexed propertyId, address indexed owner, address indexed pendingOwner)')

        const chunkSize = 49000n
        for (let b = currentBlock; b > lastSeen; b -= chunkSize) {
          if (!isMountedLocal) break
          const fromBlock = b - chunkSize + 1n > lastSeen ? b - chunkSize + 1n : lastSeen + 1n
          
          const queries = [
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: PropertyRegistered, args: { owner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferProposed, args: { currentOwner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferProposed, args: { pendingOwner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferAccepted, args: { previousOwner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferAccepted, args: { newOwner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferCancelled, args: { owner: address }, fromBlock, toBlock: b }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferCancelled, args: { pendingOwner: address }, fromBlock, toBlock: b }),
          ]
          
          const results = await Promise.all(queries)
          const hasAny = results.some(res => res.length > 0)
          if (hasAny) {
            if (isMountedLocal) setHasUnread(true)
            break
          }
        }
      } catch (err) {
        console.error("Failed to check unread notifications", err)
      }
    }

    checkUnread()
    
    const onFocus = () => checkUnread()
    const onRead = () => setHasUnread(false)
    
    window.addEventListener('focus', onFocus)
    window.addEventListener('notifications_read', onRead)
    
    return () => {
      isMountedLocal = false
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('notifications_read', onRead)
    }
  }, [address, publicClient])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container flex h-16 items-center px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Map className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">LandProof</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* Base Public Links */}
            <Link href="/properties" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Explorer
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Dashboard
            </Link>
            <Link href="/activity" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Transactions
            </Link>

            {/* Dynamic Role-Gated Links */}
            {isMounted && isConnected && (
              <>
                {isRegistrar && (
                  <Link href="/registrar" className="transition-colors hover:text-primary text-primary/80 font-semibold">
                    Registrar Portal
                  </Link>
                )}
                {isVerifier && (
                  <Link href="/verifier" className="transition-colors hover:text-primary text-primary/80 font-semibold">
                    Verifier Portal
                  </Link>
                )}
                {isLegal && (
                  <Link href="/legal" className="transition-colors hover:text-primary text-primary/80 font-semibold">
                    Legal Portal
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className="transition-colors hover:text-amber-500 text-amber-500/80 font-semibold">
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Mobile Menu Icon */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex items-center space-x-2">
            {isMounted && isConnected && (
              <Link href="/notifications" className="relative p-2 text-foreground/60 hover:text-foreground/80 transition-colors rounded-full hover:bg-muted">
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border border-background"></span>
                )}
              </Link>
            )}
            <Connect />
          </nav>
        </div>
      </div>
    </nav>
  )
}
