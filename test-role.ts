import { createPublicClient, http, pad } from 'viem'
import { sepolia } from 'viem/chains'

const CONTRACT_ADDRESS = '0x40Ef677C20C5a04D6Bc5B22D28c65AcfF963b86f'
const ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "hasRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

async function main() {
  const adminRole = pad('0x00', { size: 32 })
  console.log('Admin Role:', adminRole)
  console.log('Is it 64 zeros?', adminRole === '0x' + '0'.repeat(64))
  
  // Try checking an arbitrary address to see if the call succeeds without reverting
  const hasRole = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasRole',
    args: [adminRole, '0x0000000000000000000000000000000000000000']
  })
  console.log('Result:', hasRole)
}

main().catch(console.error)
