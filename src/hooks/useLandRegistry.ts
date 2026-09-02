'use client'

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export function useLandRegistry() {
  const { address } = useAccount()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Example Read functions
  const { data: hasRegistrarRole } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: landRegistryABI,
    functionName: 'hasRole',
    args: ['0x...', address as `0x${string}`], // TODO: Use actual keccak256 hash of 'REGISTRAR_ROLE'
  })

  // Example Write function
  const registerProperty = (propertyId: `0x${string}`, initialOwner: `0x${string}`, metadataHash: `0x${string}`, area: bigint, latitudeE6: number, longitudeE6: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: landRegistryABI,
      functionName: 'registerProperty',
      args: [propertyId, initialOwner, metadataHash, area, latitudeE6, longitudeE6],
    })
  }

  return {
    address,
    hasRegistrarRole,
    registerProperty,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
