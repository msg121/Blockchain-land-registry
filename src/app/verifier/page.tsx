'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, CheckCircle2, Search, Link as LinkIcon, FileCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatBytes32String, formatCoordinate } from '@/lib/format'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useRoles } from '@/hooks/useRoles'
import Link from 'next/link'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export default function VerifierPortal() {
  const { isVerifier: hasRole, isLoading: isCheckingRole } = useRoles()

  const [propertyIdStr, setPropertyIdStr] = useState('')
  const [searchId, setSearchId] = useState('')
  const [providedUri, setProvidedUri] = useState('')
  const [isMatched, setIsMatched] = useState<boolean | null>(null)

  // Fetch Property Data
  const { data: propertyData, isLoading: isFetchingProperty, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'getProperty',
    args: searchId ? [formatBytes32String(searchId)] : undefined,
    query: {
      enabled: !!searchId,
    }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyIdStr) return toast.error("Enter a Property ID")
    setSearchId(propertyIdStr)
    setIsMatched(null)
    setProvidedUri('')
  }

  const handleCheckHash = () => {
    if (!providedUri) return toast.error("Enter the IPFS URI to verify")
    if (!propertyData) return

    const prop = propertyData as any;
    const generatedHash = formatBytes32String(providedUri);
    
    if (generatedHash === prop.metadataHash) {
      setIsMatched(true)
      toast.success("Document Cryptographically Verified! ✅")
    } else {
      setIsMatched(false)
      toast.error("Hashes do not match! ❌ Fake or tampered document.")
    }
  }

  const handleVerify = () => {
    if (!searchId) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'verifyProperty',
      args: [formatBytes32String(searchId)],
    }, {
      onSuccess: () => {
         toast.success("Verification transaction submitted!")
         refetch()
      },
      onError: (err) => toast.error(`Verification failed: ${err.message}`)
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
        <div className="pt-4">
          <Link href="/properties">
            <Button variant="default">Return to Explorer</Button>
          </Link>
        </div>
      </div>
    )
  }

  const prop = propertyData as any;

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verifier Portal</h1>
        <p className="text-muted-foreground mt-2">Cryptographically verify property records before approval.</p>
      </div>

      <Card className="border-primary/20 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
        <CardHeader className="bg-primary/5 pb-4 border-b mb-6 relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Lookup Property
          </CardTitle>
          <CardDescription>Enter the unique Property Identifier string to fetch blockchain records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              id="propertyIdStr" 
              placeholder="e.g. LND-NYC-2026-001" 
              value={propertyIdStr} 
              onChange={(e) => setPropertyIdStr(e.target.value)}
            />
            <Button type="submit" disabled={isFetchingProperty}>
              <Search className="h-4 w-4 mr-2" /> {isFetchingProperty ? "Searching..." : "Search"}
            </Button>
          </form>

          {prop && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-slate-900/50">
                <div>
                  <p className="text-sm text-slate-400">Current Owner</p>
                  <p className="font-mono text-sm truncate" title={prop.owner}>{prop.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <p className={`font-bold ${prop.verified ? 'text-green-500' : 'text-amber-500'}`}>
                    {prop.verified ? 'Verified' : 'Unverified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Area (sqm)</p>
                  <p className="font-medium">{Number(prop.area)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Coordinates</p>
                  <p className="font-medium">{formatCoordinate(prop.latitudeE6)}, {formatCoordinate(prop.longitudeE6)}</p>
                </div>
              </div>

              {!prop.verified && (
                <div className="border border-primary/20 rounded-xl p-6 bg-primary/5 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    Cryptographic Document Matcher
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ask the owner to provide their IPFS URI. Paste it below to cryptographically verify it against the blockchain record.
                  </p>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="ipfs://Qm..." 
                      value={providedUri}
                      onChange={(e) => setProvidedUri(e.target.value)}
                    />
                    <Button onClick={handleCheckHash} variant="secondary">
                      <FileCheck className="h-4 w-4 mr-2" /> Check Hash
                    </Button>
                  </div>

                  {isMatched !== null && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${isMatched ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
                      {isMatched ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                      <div>
                        <p className="font-bold">{isMatched ? "Authentic Document" : "Tampered Document"}</p>
                        <p className="text-sm opacity-80">
                          {isMatched 
                            ? "The provided URI matches the cryptographic hash stored on the blockchain." 
                            : "The hashes do not match. The document is either incorrect or fake."}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleVerify} 
                    className="w-full mt-4" 
                    size="lg"
                    disabled={isPending || isConfirming || !isMatched}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" /> 
                    {isPending || isConfirming ? "Processing Transaction..." : "Approve & Verify Property"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {hash && (
            <div className="mt-4 p-4 bg-muted text-xs font-mono rounded-md break-all text-center">
              Tx Hash: {hash}
              {isSuccess && <p className="text-green-500 font-bold mt-2 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 mr-1"/> Verification Successful!</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
