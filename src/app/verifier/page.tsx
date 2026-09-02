'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { keccak256, toBytes } from 'viem'
import { formatBytes32String } from '@/lib/format'
import { useIsMounted } from '@/hooks/use-is-mounted'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const VERIFIER_ROLE = keccak256(toBytes("VERIFIER_ROLE"))
const REASON_METADATA_CHANGED = keccak256(toBytes("METADATA_CHANGED"))

export default function VerifierPortal() {
  const { address } = useAccount()

  const { data: hasRole, isLoading: isCheckingRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: [VERIFIER_ROLE, address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [propertyIdStr, setPropertyIdStr] = useState('')

  const handleVerify = () => {
    if (!propertyIdStr) return toast.error("Property ID is required")
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'verifyProperty',
      args: [formatBytes32String(propertyIdStr)],
    }, {
      onSuccess: () => toast.success("Verification transaction submitted!"),
      onError: (err) => toast.error(`Verification failed: ${err.message}`)
    })
  }

  const handleReset = () => {
    if (!propertyIdStr) return toast.error("Property ID is required")
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'verifyProperty',
      args: [formatBytes32String(propertyIdStr)],
    }, {
      onSuccess: () => toast.success("Reset verification transaction submitted!"),
      onError: (err) => toast.error(`Reset failed: ${err.message}`)
    })
  }

  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (isCheckingRole) {
    return <div className="text-center py-20 animate-pulse">Verifying access...</div>
  }

  if (!hasRole) {
    return (
      <div className="container max-w-2xl mx-auto py-20 text-center space-y-6">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          Your wallet address does not have the <code className="bg-muted px-2 py-1 rounded">VERIFIER_ROLE</code> required to verify properties.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verifier Portal</h1>
        <p className="text-muted-foreground mt-2">Approve or revoke property verifications.</p>
      </div>

      <Card className="border-primary/20 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <CardHeader className="bg-primary/5 pb-4 border-b mb-6 relative z-10">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Manage Verification Status
          </CardTitle>
          <CardDescription>Enter the unique Property Identifier string or 32-byte hash.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="propertyIdStr">Property Identifier</Label>
            <Input 
              id="propertyIdStr" 
              placeholder="e.g. LND-NYC-2026-001" 
              value={propertyIdStr} 
              onChange={(e) => setPropertyIdStr(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleVerify} 
              className="flex-1" 
              disabled={isPending || isConfirming}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Property
            </Button>
            <Button 
              onClick={handleReset} 
              variant="destructive" 
              className="flex-1" 
              disabled={isPending || isConfirming}
            >
              <XCircle className="mr-2 h-4 w-4" /> Revoke / Reset
            </Button>
          </div>

          {hash && (
            <div className="mt-4 p-4 bg-muted text-xs font-mono rounded-md break-all text-center">
              Tx Hash: {hash}
              {isSuccess && <p className="text-green-500 font-bold mt-2">Transaction Successful!</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
