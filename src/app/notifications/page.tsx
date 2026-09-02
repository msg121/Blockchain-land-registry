'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, MapPin, ArrowLeftRight, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { Skeleton } from '@/components/ui/skeleton'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

type Notification = {
  id: string;
  eventName: string;
  args: any;
  transactionHash: string;
  timestamp: number;
  blockNumber: number;
}

export default function NotificationsPage() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const isMounted = useIsMounted()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchNotifications() {
      if (!address || !publicClient) return
      setIsLoading(true)
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const startBlock = currentBlock - BigInt(200000) > BigInt(0) ? currentBlock - BigInt(200000) : BigInt(0)
        
        let allLogs: any[] = []
        const chunkSize = BigInt(49000)
        
        const PropertyRegistered = parseAbiItem('event PropertyRegistered(bytes32 indexed propertyId, address indexed owner, bytes32 indexed metadataHash, uint64 area, int32 latitudeE6, int32 longitudeE6)')
        const TransferProposed = parseAbiItem('event TransferProposed(bytes32 indexed propertyId, address indexed currentOwner, address indexed pendingOwner)')
        const TransferAccepted = parseAbiItem('event TransferAccepted(bytes32 indexed propertyId, address indexed previousOwner, address indexed newOwner)')
        const TransferCancelled = parseAbiItem('event TransferCancelled(bytes32 indexed propertyId, address indexed owner, address indexed pendingOwner)')

        for (let b = startBlock; b <= currentBlock; b += chunkSize) {
          const toBlock = b + chunkSize - BigInt(1) > currentBlock ? currentBlock : b + chunkSize - BigInt(1)
          
          const queries = [
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: PropertyRegistered, args: { owner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferProposed, args: { currentOwner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferProposed, args: { pendingOwner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferAccepted, args: { previousOwner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferAccepted, args: { newOwner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferCancelled, args: { owner: address }, fromBlock: b, toBlock }),
            publicClient.getLogs({ address: CONTRACT_ADDRESS, event: TransferCancelled, args: { pendingOwner: address }, fromBlock: b, toBlock }),
          ]
          
          const results = await Promise.all(queries)
          results.forEach(res => allLogs.push(...res))
        }
        
        // Remove duplicates (e.g. if a user sent a transfer to themselves somehow, they'd match two queries)
        const uniqueLogsMap = new Map()
        allLogs.forEach(log => {
          uniqueLogsMap.set(`${log.transactionHash}-${log.logIndex}`, log)
        })
        const uniqueLogs = Array.from(uniqueLogsMap.values())
        
        // Fetch timestamps
        const blockNumbers = Array.from(new Set(uniqueLogs.map(log => log.blockNumber)))
        const blockPromises = blockNumbers.map(bn => publicClient.getBlock({ blockNumber: bn }))
        const blocks = await Promise.all(blockPromises)
        
        const blockTimeMap = new Map()
        blocks.forEach(block => {
          blockTimeMap.set(block.number.toString(), Number(block.timestamp) * 1000)
        })
        
        const formatted = uniqueLogs.map(log => {
          const time = blockTimeMap.get(log.blockNumber.toString()) || Date.now()
          return {
             id: `${log.transactionHash}-${log.logIndex}`,
             eventName: log.eventName,
             args: log.args,
             transactionHash: log.transactionHash,
             timestamp: time,
             blockNumber: Number(log.blockNumber)
          }
        })
        
        formatted.sort((a, b) => b.timestamp - a.timestamp)
        setNotifications(formatted)
        
        // Update local storage and dispatch event so Navbar can hide the red dot
        localStorage.setItem('lastSeenBlock', currentBlock.toString())
        window.dispatchEvent(new Event('notifications_read'))
      } catch (error) {
        console.error("Failed to fetch notifications", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [address, publicClient])

  if (!isMounted) return null

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold tracking-tight">Connect Wallet</h2>
        <p className="text-muted-foreground mt-2">Please connect your wallet to view your notifications.</p>
      </div>
    )
  }

  const renderNotification = (n: Notification) => {
    let title = ""
    let description = ""
    let icon = <Bell className="h-5 w-5" />
    let iconColor = "text-muted-foreground"
    let bgColor = "bg-muted"
    
    const { propertyId } = n.args
    const displayId = propertyId ? `${propertyId.slice(0, 10)}...${propertyId.slice(-8)}` : ""

    if (n.eventName === 'PropertyRegistered') {
      title = "Property Registered"
      description = `You registered a new property (${displayId}).`
      icon = <MapPin className="h-5 w-5" />
      iconColor = "text-blue-500"
      bgColor = "bg-blue-500/10"
    } 
    else if (n.eventName === 'TransferProposed') {
      if (n.args.pendingOwner === address) {
        title = "Transfer Proposed To You"
        description = `${n.args.currentOwner.slice(0,6)}...${n.args.currentOwner.slice(-4)} has proposed transferring property (${displayId}) to you.`
        icon = <ArrowLeftRight className="h-5 w-5" />
        iconColor = "text-amber-500"
        bgColor = "bg-amber-500/10"
      } else {
        title = "Transfer Proposed"
        description = `You proposed transferring property (${displayId}) to ${n.args.pendingOwner.slice(0,6)}...${n.args.pendingOwner.slice(-4)}.`
        icon = <ArrowRight className="h-5 w-5" />
        iconColor = "text-primary"
        bgColor = "bg-primary/10"
      }
    }
    else if (n.eventName === 'TransferAccepted') {
      if (n.args.newOwner === address) {
        title = "Transfer Accepted"
        description = `You accepted the transfer of property (${displayId}) from ${n.args.previousOwner.slice(0,6)}...${n.args.previousOwner.slice(-4)}.`
        icon = <CheckCircle2 className="h-5 w-5" />
        iconColor = "text-green-500"
        bgColor = "bg-green-500/10"
      } else {
        title = "Transfer Accepted"
        description = `${n.args.newOwner.slice(0,6)}...${n.args.newOwner.slice(-4)} accepted your transfer proposal for property (${displayId}).`
        icon = <CheckCircle2 className="h-5 w-5" />
        iconColor = "text-green-500"
        bgColor = "bg-green-500/10"
      }
    }
    else if (n.eventName === 'TransferCancelled') {
      title = "Transfer Cancelled"
      description = `The transfer for property (${displayId}) was cancelled.`
      icon = <XCircle className="h-5 w-5" />
      iconColor = "text-destructive"
      bgColor = "bg-destructive/10"
    }

    const date = new Date(n.timestamp)
    const timeString = date.toLocaleString()

    return (
      <Card key={n.id} className="overflow-hidden hover:bg-muted/30 transition-colors">
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-4">
            <div className={`p-2 rounded-full ${bgColor} ${iconColor} shrink-0 mt-1`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{timeString}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-10 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">Your recent activity on the LandProof network.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4 items-start">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(renderNotification)}
        </div>
      ) : (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No recent activity</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              You haven't been involved in any property registrations or transfers recently.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
