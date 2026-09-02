'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, Scale, Check } from 'lucide-react'
import { toast } from 'sonner'
import { keccak256, toBytes } from 'viem'
import { formatBytes32String } from '@/lib/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useIsMounted } from '@/hooks/use-is-mounted'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const LEGAL_ROLE = keccak256(toBytes("LEGAL_ROLE"))

export default function LegalPortal() {
  const { address } = useAccount()

  const { data: hasRole, isLoading: isCheckingRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: [LEGAL_ROLE, address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [formData, setFormData] = useState({
    propertyIdStr: '',
    newOwner: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.propertyIdStr || !formData.newOwner) return toast.error("All fields are required")
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'recoverOwnership',
      args: [formatBytes32String(formData.propertyIdStr), formData.newOwner as `0x${string}`],
    }, {
      onSuccess: () => toast.success("Legal recovery transaction submitted!"),
      onError: (err) => toast.error(`Recovery failed: ${err.message}`)
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
          Your wallet address does not have the <code className="bg-muted px-2 py-1 rounded">LEGAL_ROLE</code> required to execute court-ordered transfers.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Legal Recovery Portal</h1>
        <p className="text-muted-foreground mt-2">Execute emergency court-ordered property transfers.</p>
      </div>

      <Card className="border-primary/20 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <CardHeader className="bg-primary/5 pb-4 border-b mb-6 relative z-10">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <Scale className="h-5 w-5" /> Force Property Transfer
          </CardTitle>
          <CardDescription>
            WARNING: This action circumvents the two-step verification process and immediately transfers ownership. It also revokes any existing verification status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecover} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="propertyIdStr">Property Identifier</Label>
              <Input 
                id="propertyIdStr" name="propertyIdStr" required
                placeholder="e.g. LND-NYC-2026-001" 
                value={formData.propertyIdStr} onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newOwner">New Owner Address</Label>
              <Input 
                id="newOwner" name="newOwner" required
                placeholder="0x..." className="font-mono text-sm"
                value={formData.newOwner} onChange={handleChange}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
              size="lg"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Processing..." : <><Scale className="mr-2 h-4 w-4" /> Execute Legal Recovery</>}
            </Button>

            {hash && (
              <div className="mt-4 p-4 bg-muted text-xs font-mono rounded-md break-all text-center">
                Tx Hash: {hash}
                {isSuccess && <p className="text-green-500 font-bold mt-2 flex items-center justify-center"><Check className="h-4 w-4 mr-1"/> Recovery Successful!</p>}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
