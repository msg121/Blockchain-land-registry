import { useAccount, useReadContracts } from 'wagmi'
import { landRegistryABI } from '@/contracts/LandRegistry.abi'
import { keccak256, toBytes } from 'viem'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

// Define role hashes matching the smart contract
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const REGISTRAR_ROLE = keccak256(toBytes("REGISTRAR_ROLE"))
export const VERIFIER_ROLE = keccak256(toBytes("VERIFIER_ROLE"))
export const LEGAL_ROLE = keccak256(toBytes("LEGAL_ROLE"))

export function useRoles() {
  const { address, isConnected } = useAccount()

  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: landRegistryABI,
        functionName: 'hasRole',
        args: [DEFAULT_ADMIN_ROLE, address as `0x${string}`],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: landRegistryABI,
        functionName: 'hasRole',
        args: [REGISTRAR_ROLE, address as `0x${string}`],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: landRegistryABI,
        functionName: 'hasRole',
        args: [VERIFIER_ROLE, address as `0x${string}`],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: landRegistryABI,
        functionName: 'hasRole',
        args: [LEGAL_ROLE, address as `0x${string}`],
      }
    ],
    query: {
      enabled: !!address,
      staleTime: 60000, // Cache results to prevent redundant RPC calls
    }
  })

  return {
    isAdmin: !!data?.[0]?.result,
    isRegistrar: !!data?.[1]?.result,
    isVerifier: !!data?.[2]?.result,
    isLegal: !!data?.[3]?.result,
    isLoading: isLoading && !!address,
    isError,
    isConnected,
    address
  }
}
