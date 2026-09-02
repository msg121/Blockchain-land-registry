'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity as ActivityIcon, ArrowRightLeft, FileCheck, FileSignature, ShieldAlert } from 'lucide-react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia } from 'viem/chains'
import { formatBytes32String, parseBytes32String } from '@/lib/format'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

type ActivityEvent = {
  id: string
  type: 'Registration' | 'Verification' | 'Transfer' | 'Emergency'
  title: string
  propertyId: string
  details: string
  txHash: string
  blockNumber: string
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentEvents() {
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - BigInt(900) // Reduced to 900 to avoid RPC 1000 block limits
        
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock,
          toBlock: 'latest',
        })

        // Simple parsing of logs for UI demo purposes
        // In a real production app, use TheGraph or a dedicated indexer backend.
        const parsedEvents: ActivityEvent[] = logs.map((log, index) => {
          let type: ActivityEvent['type'] = 'Transfer'
          let title = 'Smart Contract Event'
          let propertyId = 'Unknown'
          let details = 'Action performed on the registry.'

          // Very simplified parsing based on topics
          // PropertyRegistered
          if (log.topics[0] === '0x9953d50f837335d1e4663c01bf26e4e7ddfc95a703d15b0b2dd17a4126dfd151') {
            type = 'Registration'
            title = 'Property Minted'
            propertyId = log.topics[1] ? parseBytes32String(log.topics[1]) : 'Unknown'
            details = `New property registered by Registrar.`
          }
          // PropertyVerified
          else if (log.topics[0] === '0xa7a43f873ce3bb4062cb4794e24eb29ef40b6e9a68a529e46a39ffc402a7b8e1') {
            type = 'Verification'
            title = 'Property Verified'
            propertyId = log.topics[1] ? parseBytes32String(log.topics[1]) : 'Unknown'
            details = 'Property verified by authorized verifier.'
          }
          
          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            type,
            title,
            propertyId,
            details,
            txHash: log.transactionHash || '',
            blockNumber: log.blockNumber?.toString() || '0'
          }
        }).reverse() // Newest first

        setEvents(parsedEvents)
      } catch (err) {
        console.error("Failed to fetch logs", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentEvents()
  }, [])

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Activity</h1>
        <p className="text-muted-foreground mt-2">Recent on-chain events from the LandProof smart contract.</p>
        <p className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-1 rounded">
          Showing events from the last 5,000 blocks. For full history, a sub-graph indexer is required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" /> Live Audit Trail
          </CardTitle>
          <CardDescription>Immutable record of all property registrations and transfers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted w-1/4 rounded"></div>
                    <div className="h-3 bg-muted w-3/4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No recent activity found in the last 5,000 blocks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="shrink-0 mt-1">
                    {event.type === 'Registration' && <FileSignature className="h-8 w-8 text-blue-500" />}
                    {event.type === 'Verification' && <FileCheck className="h-8 w-8 text-green-500" />}
                    {event.type === 'Transfer' && <ArrowRightLeft className="h-8 w-8 text-amber-500" />}
                    {event.type === 'Emergency' && <ShieldAlert className="h-8 w-8 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{event.title}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Block {event.blockNumber}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                    <div className="flex gap-4 mt-2 text-xs font-mono text-muted-foreground overflow-hidden">
                      <span className="truncate" title={event.propertyId}>ID: {event.propertyId}</span>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${event.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Tx: {event.txHash.slice(0, 10)}...
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
