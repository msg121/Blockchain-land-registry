import { stringToHex, hexToString, keccak256, toBytes } from "viem"

export function formatBytes32String(text: string): `0x${string}` {
  if (!text) return '0x0000000000000000000000000000000000000000000000000000000000000000'
  try {
    const hex = stringToHex(text, { size: 32 })
    return hex
  } catch {
    if (text.startsWith('0x') && text.length === 66) return text as `0x${string}`
    return keccak256(toBytes(text))
  }
}

export function parseBytes32String(bytes32: string): string {
  if (!bytes32 || bytes32 === '0x0000000000000000000000000000000000000000000000000000000000000000') return ''
  try {
    return hexToString(bytes32 as `0x${string}`, { size: 32 }).replace(/\0/g, '')
  } catch {
    return bytes32
  }
}

export function formatCoordinate(e6Value: number | bigint): string {
  if (e6Value === undefined || e6Value === null) return "0.000000"
  return (Number(e6Value) / 1e6).toFixed(6)
}

export function parseCoordinate(coordStr: string): number {
  return Math.round(parseFloat(coordStr) * 1e6)
}

export function formatDate(timestamp: number | bigint): string {
  if (!timestamp) return "N/A"
  return new Date(Number(timestamp) * 1000).toLocaleString()
}
