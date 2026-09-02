'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, PlusCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { keccak256, toBytes } from 'viem'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { formatBytes32String, parseCoordinate } from '@/lib/format'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
const REGISTRAR_ROLE = keccak256(toBytes("REGISTRAR_ROLE"))

export default function RegistrarPortal() {
  const { address } = useAccount()

  const { data: hasRole, isLoading: isCheckingRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: [REGISTRAR_ROLE, address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [formData, setFormData] = useState({
    propertyIdStr: '',
    initialOwner: '',
    metadataUri: '',
    area: '',
    latitude: '',
    longitude: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const propertyId = formatBytes32String(formData.propertyIdStr)
      const metadataHash = formatBytes32String(formData.metadataUri)
      const area = BigInt(formData.area)
      const latE6 = parseCoordinate(formData.latitude)
      const lngE6 = parseCoordinate(formData.longitude)

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: landRegistryABI,
        functionName: 'registerProperty',
        args: [propertyId, formData.initialOwner as `0x${string}`, metadataHash, area, latE6, lngE6],
      }, {
        onSuccess: () => toast.success("Transaction submitted to register property!"),
        onError: (err) => toast.error(`Registration failed: ${err.message}`)
      })
    } catch (err: any) {
      toast.error(`Invalid input data: ${err.message}`)
    }
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
          Your wallet address does not have the <code className="bg-muted px-2 py-1 rounded">REGISTRAR_ROLE</code> required to mint new properties.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Portal</h1>
        <p className="text-muted-foreground mt-2">Mint new properties directly to the blockchain.</p>
      </div>

      <Card className="border-primary/20 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <CardHeader className="bg-primary/5 pb-4 border-b mb-6 relative z-10">
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Register New Property
          </CardTitle>
          <CardDescription>All fields are required. Coordinates must be valid decimal degrees.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyIdStr">Unique Property Identifier</Label>
                <Input 
                  id="propertyIdStr" name="propertyIdStr" required
                  placeholder="e.g. LND-NYC-2026-001" 
                  value={formData.propertyIdStr} onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialOwner">Initial Owner Address</Label>
                <Input 
                  id="initialOwner" name="initialOwner" required
                  placeholder="0x..." className="font-mono text-sm"
                  value={formData.initialOwner} onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadataUri">Document URI / Hash</Label>
              <Input 
                id="metadataUri" name="metadataUri" required
                placeholder="ipfs://... or Document Hash" 
                value={formData.metadataUri} onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="area">Area (sqm)</Label>
                <Input 
                  id="area" name="area" type="number" min="1" required
                  placeholder="500" 
                  value={formData.area} onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" name="latitude" type="number" step="0.000001" required
                  placeholder="40.7128" 
                  value={formData.latitude} onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" name="longitude" type="number" step="0.000001" required
                  placeholder="-74.0060" 
                  value={formData.longitude} onChange={handleChange}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Processing Transaction..." : <><PlusCircle className="mr-2 h-4 w-4" /> Register Property</>}
            </Button>

            {hash && (
              <div className="mt-4 p-4 bg-muted text-xs font-mono rounded-md break-all text-center">
                Tx Hash: {hash}
                {isSuccess && <p className="text-green-500 font-bold mt-2 flex items-center justify-center"><Check className="h-4 w-4 mr-1"/> Registration Successful!</p>}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
