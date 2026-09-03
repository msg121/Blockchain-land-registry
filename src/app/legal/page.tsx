'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, Scale, Check, Copy, AlertTriangle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { isAddress } from 'viem'
import { formatBytes32String } from '@/lib/format'
import { useRoles } from '@/hooks/useRoles'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useIsMounted } from '@/hooks/use-is-mounted'
import Link from 'next/link'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function LegalPortal() {
  const { isLegal: hasRole, isLoading: isCheckingRole } = useRoles()

  const [formData, setFormData] = useState({
    propertyIdStr: '',
    newOwner: '',
  })
  
  const [debouncedId, setDebouncedId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  // Debounce property ID input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedId(formData.propertyIdStr)
    }, 500)
    return () => clearTimeout(handler)
  }, [formData.propertyIdStr])

  // Live Property Fetching
  const { data: propertyData, isLoading: isFetchingProperty } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'getProperty',
    args: debouncedId ? [formatBytes32String(debouncedId)] : undefined,
    query: {
      enabled: !!debouncedId,
    }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePreFlightCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.propertyIdStr || !formData.newOwner) return toast.error("All fields are required")
    
    // Validations
    if (!isAddress(formData.newOwner)) {
      return toast.error("Invalid EVM Address provided for New Owner")
    }

    if (propertyData) {
      const prop = propertyData as any
      if (prop.owner === '0x0000000000000000000000000000000000000000') {
        return toast.error("Property does not exist on-chain")
      }
      if (prop.owner.toLowerCase() === formData.newOwner.toLowerCase()) {
        return toast.error("New Owner address is identical to Current Owner")
      }
    } else {
      return toast.error("Please wait for property data to load")
    }

    // Open Confirmation Modal
    setIsConfirmed(false)
    setIsModalOpen(true)
  }

  const executeTransfer = () => {
    if (!isConfirmed) return
    setIsModalOpen(false)

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
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
        <div className="pt-4">
          <Link href="/properties">
            <Button variant="default">Return to Explorer</Button>
          </Link>
        </div>
      </div>
    )
  }

  const prop = propertyData as any
  const propertyExists = prop && prop.owner !== '0x0000000000000000000000000000000000000000'

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
            WARNING: This action circumvents the two-step verification process and immediately transfers ownership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreFlightCheck} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="propertyIdStr">Property Identifier</Label>
              <Input 
                id="propertyIdStr" name="propertyIdStr" required
                placeholder="e.g. LND-NYC-2026-001 or 0x..." 
                value={formData.propertyIdStr} onChange={handleChange}
              />
              
              {/* Live Preview UI */}
              {debouncedId && (
                <div className="mt-2 p-3 rounded-md border text-sm bg-slate-950/50 relative">
                  {isFetchingProperty ? (
                    <div className="animate-pulse text-muted-foreground">Fetching on-chain record...</div>
                  ) : propertyExists ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Owner:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{prop.owner.slice(0,6)}...{prop.owner.slice(-4)}</span>
                          <button type="button" onClick={() => copyToClipboard(prop.owner)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-bold ${prop.verified ? 'text-green-500' : 'text-amber-500'}`}>
                          {prop.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-destructive flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Property not registered on-chain
                    </div>
                  )}
                </div>
              )}
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
              disabled={isPending || isConfirming || !propertyExists}
            >
              {isPending ? "Awaiting Signature..." : isConfirming ? "Confirming on Blockchain..." : <><Scale className="mr-2 h-4 w-4" /> Trigger Legal Recovery</>}
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

      {/* Two-Step Critical Action Confirmation Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Confirm Court-Ordered Transfer
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground space-y-4 pt-2">
              <p>You are executing a high-privilege legal transfer. This cannot be undone.</p>
              
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2 border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">From (Current):</span>
                  <span className="text-destructive">{propertyExists ? `${prop.owner.slice(0,6)}...${prop.owner.slice(-4)}` : ''}</span>
                </div>
                <div className="flex justify-center py-1 text-muted-foreground"><ArrowRight className="h-4 w-4" /></div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">To (New):</span>
                  <span className="text-green-500">{formData.newOwner.slice(0,6)}...{formData.newOwner.slice(-4)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <input 
                  type="checkbox" 
                  id="legal-confirm" 
                  className="mt-1 h-4 w-4 shrink-0 rounded-sm"
                  checked={isConfirmed} 
                  onChange={(e) => setIsConfirmed(e.target.checked)} 
                />
                <label htmlFor="legal-confirm" className="text-sm cursor-pointer select-none">
                  I confirm this transfer complies with legal consensus and a valid court order exists.
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button 
              onClick={executeTransfer} 
              disabled={!isConfirmed}
              variant="destructive"
            >
              Confirm & Sign
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
