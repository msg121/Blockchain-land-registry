'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { landRegistryABI as landRegistryAbi } from '@/contracts/LandRegistry.abi'
import { CONTRACT_ADDRESS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle, Power, PowerOff, AlertCircle, Loader2 } from 'lucide-react'
import { keccak256, toHex } from 'viem'
import { toast } from 'sonner'
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

const EMERGENCY_ROLE = keccak256(toHex('EMERGENCY_ROLE'))

export default function EmergencyControlsPage() {
  const { address } = useAccount()

  const { data: hasEmergencyRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryAbi,
    functionName: 'hasRole',
    args: [EMERGENCY_ROLE, address as `0x${string}`],
  })

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryAbi,
    functionName: 'paused',
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const handleTogglePause = () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: landRegistryAbi,
        functionName: isPaused ? 'unpause' : 'pause',
      })
    } catch (err: any) {
      toast.error('Transaction failed: ' + err.message)
    }
  }

  const isMounted = useIsMounted()
  if (!isMounted) return null

  if (hasEmergencyRole === false) {
    return (
      <div className="container mx-auto py-20 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You do not have the Emergency Role to access this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8" />
          Emergency Controls
        </h1>
        <p className="text-muted-foreground mt-2">Suspend or resume core smart contract functionalities.</p>
      </div>

      <Card className="border-destructive/50">
        <CardHeader className="bg-destructive/10 pb-4">
          <CardTitle className="text-destructive flex items-center justify-between">
            System Status
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaused ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'}`}>
              {isPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {isPaused 
              ? 'The contract is currently paused. Transfers and registrations are blocked.' 
              : 'The contract is running normally. Use caution when pausing.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted p-4 rounded-lg mb-6 border">
            <h3 className="font-medium mb-2">When Paused:</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Property registrations are disabled</li>
              <li>Ownership transfers are blocked</li>
              <li>Legal recoveries are halted</li>
              <li>Read-only functions remain active</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger 
              className={buttonVariants({ variant: isPaused ? "default" : "destructive", size: "lg", className: "w-full h-14 text-lg font-bold" })}
              disabled={isPending || isWaiting}
            >
                {isPending || isWaiting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : isPaused ? (
                  <><Power className="mr-2 h-5 w-5" /> Unpause System</>
                ) : (
                  <><PowerOff className="mr-2 h-5 w-5" /> Pause System</>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isPaused 
                    ? 'This will resume all operations on the LandRegistry smart contract. Normal users will be able to transfer and register properties again.' 
                    : 'This will instantly suspend all major write operations on the smart contract. Only use this in case of a critical emergency or vulnerability.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTogglePause} className={isPaused ? "" : "bg-destructive hover:bg-destructive/90"}>
                  Confirm {isPaused ? 'Unpause' : 'Pause'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {isSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm text-center">
              System state updated successfully!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
