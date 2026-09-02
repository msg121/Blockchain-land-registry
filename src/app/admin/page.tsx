'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldAlert, Pause, Play, UserCog, Check, Activity, FileCode, Network } from 'lucide-react'
import { toast } from 'sonner'
import { keccak256, toBytes } from 'viem'
import { useIsMounted } from '@/hooks/use-is-mounted'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

const ROLES = {
  REGISTRAR: keccak256(toBytes("REGISTRAR_ROLE")),
  VERIFIER: keccak256(toBytes("VERIFIER_ROLE")),
  LEGAL: keccak256(toBytes("LEGAL_ROLE")),
  EMERGENCY: keccak256(toBytes("EMERGENCY_ROLE")),
}

export default function AdminPortal() {
  const { address, chain } = useAccount()

  // Contract reads
  const { data: hasAdminRole, isLoading: isCheckingAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: ['0x0000000000000000000000000000000000000000000000000000000000000000', address as `0x${string}`], // DEFAULT_ADMIN_ROLE is 0x00
    query: { enabled: !!address }
  })

  const { data: hasEmergencyRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: [ROLES.EMERGENCY, address as `0x${string}`],
    query: { enabled: !!address }
  })

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'paused',
  })

  // Contract writes
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [roleAction, setRoleAction] = useState<'grant' | 'revoke'>('grant')
  const [selectedRole, setSelectedRole] = useState<string>('REGISTRAR')
  const [targetAddress, setTargetAddress] = useState('')

  const handleRoleAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetAddress) return toast.error("Address is required")

    const roleHash = ROLES[selectedRole as keyof typeof ROLES]
    const functionName = roleAction === 'grant' ? 'grantRole' : 'revokeRole'

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName,
      args: [roleHash, targetAddress as `0x${string}`],
    }, {
      onSuccess: () => toast.success(`Transaction submitted to ${roleAction} role`),
      onError: (err) => toast.error(`Failed: ${err.message}`)
    })
  }

  const togglePause = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: isPaused ? 'unpause' : 'pause',
    }, {
      onSuccess: () => toast.success(`Transaction submitted to ${isPaused ? 'unpause' : 'pause'} contract`),
      onError: (err) => toast.error(`Failed: ${err.message}`)
    })
  }

  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (!address) {
    return <div className="text-center py-20">Please connect your wallet first.</div>
  }

  if (isCheckingAdmin) {
    return <div className="text-center py-20 animate-pulse">Verifying access...</div>
  }

  if (hasAdminRole === false && hasEmergencyRole === false) {
    return (
      <div className="container max-w-2xl mx-auto py-20 text-center space-y-6">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          Your wallet does not have Admin or Emergency privileges.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage roles and global contract state.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPaused ? <span className="text-amber-500">Paused</span> : <span className="text-green-500">Active</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Smart Contract State</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              Contract Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate" title={CONTRACT_ADDRESS}>
              {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registry Address</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Network className="h-4 w-4 mr-2" />
              Network Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {chain?.name || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chain ID: {chain?.id || '---'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Role Management */}
        {hasAdminRole && (
          <Card className="border-primary/20 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 p-32 bg-primary/10 rounded-full -ml-16 -mt-16 blur-3xl pointer-events-none"></div>
            <CardHeader className="bg-primary/5 pb-4 border-b relative z-10">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" /> Role Management
              </CardTitle>
              <CardDescription>Grant or revoke system roles.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleRoleAction} className="space-y-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={roleAction} onValueChange={(v) => { if(v) setRoleAction(v as 'grant'|'revoke') }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant Role</SelectItem>
                      <SelectItem value="revoke">Revoke Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => { if(v) setSelectedRole(v) }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGISTRAR">Registrar</SelectItem>
                      <SelectItem value="VERIFIER">Verifier</SelectItem>
                      <SelectItem value="LEGAL">Legal Authority</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Address</Label>
                  <Input 
                    required placeholder="0x..." className="font-mono text-sm"
                    value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
                  {isPending || isConfirming ? "Processing..." : "Submit Transaction"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Emergency Controls */}
        {hasEmergencyRole && (
          <Card className={`border shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden ${isPaused ? 'border-amber-500/50' : 'border-destructive/30'}`}>
            <div className="absolute top-0 right-0 p-32 bg-destructive/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
            <CardHeader className={`pb-4 border-b relative z-10 ${isPaused ? 'bg-amber-500/10' : 'bg-destructive/10'}`}>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" /> Emergency Controls
              </CardTitle>
              <CardDescription>
                Pause the contract in case of a critical vulnerability.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Status</p>
                {isPaused ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                    <Pause className="h-4 w-4" /> CONTRACT PAUSED
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-bold">
                    <Play className="h-4 w-4" /> ACTIVE
                  </div>
                )}
              </div>

              <Button 
                variant={isPaused ? "default" : "destructive"} 
                size="lg" 
                className="w-full font-bold"
                onClick={togglePause}
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? "Processing..." : isPaused ? "UNPAUSE CONTRACT" : "PAUSE CONTRACT"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {hash && (
        <div className="p-4 bg-muted text-xs font-mono rounded-md break-all text-center">
          Tx Hash: {hash}
          {isSuccess && <p className="text-green-500 font-bold mt-2 flex items-center justify-center"><Check className="h-4 w-4 mr-1"/> Success!</p>}
        </div>
      )}
    </div>
  )
}
