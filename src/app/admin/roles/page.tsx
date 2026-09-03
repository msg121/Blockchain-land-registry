'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { landRegistryABI as landRegistryAbi } from '@/contracts/LandRegistry.abi'
import { CONTRACT_ADDRESS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, UserPlus, UserMinus, AlertCircle, Loader2 } from 'lucide-react'
import { keccak256, toHex } from 'viem'
import { toast } from 'sonner'
import { useIsMounted } from '@/hooks/use-is-mounted'

const ROLES = {
  ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`, // DEFAULT_ADMIN_ROLE
  REGISTRAR: keccak256(toHex('REGISTRAR_ROLE')),
  VERIFIER: keccak256(toHex('VERIFIER_ROLE')),
  LEGAL: keccak256(toHex('LEGAL_ROLE')),
  EMERGENCY: keccak256(toHex('EMERGENCY_ROLE')),
}

export default function RoleManagementPage() {
  const { address } = useAccount()
  const [targetAddress, setTargetAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState<`0x${string}`>(ROLES.REGISTRAR)
  const [action, setAction] = useState<'grant' | 'revoke'>('grant')

  const { data: isAdmin, isLoading: isCheckingAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryAbi,
    functionName: 'hasRole',
    args: [ROLES.ADMIN, address as `0x${string}`],
    query: {
      enabled: !!address
    }
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetAddress) {
      toast.error('Please enter an address')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: landRegistryAbi,
        functionName: action === 'grant' ? 'grantRole' : 'revokeRole',
        args: [selectedRole as `0x${string}`, targetAddress as `0x${string}`],
      })
    } catch (err: any) {
      toast.error('Failed to initiate transaction: ' + err.message)
    }
  }

  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (!address) {
    return <div className="text-center py-20">Please connect your wallet first.</div>
  }

  if (isCheckingAdmin) {
    return <div className="text-center py-20 animate-pulse">Verifying access...</div>
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-20 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You do not have the required Admin Role to manage roles.</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Manage Access Control
          </CardTitle>
          <CardDescription>Only Default Admins can perform these actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Wallet Address</label>
              <Input
                placeholder="0x..."
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Role</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as `0x${string}`)}
              >
                <option value={ROLES.REGISTRAR}>Registrar Role</option>
                <option value={ROLES.VERIFIER}>Verifier Role</option>
                <option value={ROLES.LEGAL}>Legal Role</option>
                <option value={ROLES.EMERGENCY}>Emergency Role</option>
                <option value={ROLES.ADMIN}>Default Admin Role</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant={action === 'grant' ? 'default' : 'outline'}
                onClick={() => setAction('grant')}
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Grant Role
              </Button>
              <Button
                type="button"
                variant={action === 'revoke' ? 'destructive' : 'outline'}
                onClick={() => setAction('revoke')}
                className="flex-1"
              >
                <UserMinus className="mr-2 h-4 w-4" /> Revoke Role
              </Button>
            </div>

            <Button type="submit" disabled={isPending || isWaiting || !targetAddress} className="w-full h-12 text-lg">
              {isPending || isWaiting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Transaction...</>
              ) : (
                action === 'grant' ? 'Confirm Grant Role' : 'Confirm Revoke Role'
              )}
            </Button>
            
            {isSuccess && (
              <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm text-center">
                Transaction successful!
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
