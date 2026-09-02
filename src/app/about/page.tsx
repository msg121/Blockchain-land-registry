import { Shield, BookOpen, Key, Link as LinkIcon, Database } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Architecture & Security</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 border-b pb-2">
            <Shield className="text-primary" /> System Architecture
          </h2>
          <p className="text-lg text-muted-foreground">
            LandProof is built on top of a robust Ethereum smart contract utilizing OpenZeppelin's standard libraries for Access Control, Reentrancy protection, and Pausable mechanics. This guarantees an enterprise-grade security posture for managing digital land records.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border p-6 rounded-xl space-y-3 shadow-sm">
            <Key className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Actions are strictly restricted based on cryptographic roles. Registrars can mint properties, Verifiers can validate them, and Legal authorities can process emergency transfers, while default users can only manage properties they own.
            </p>
          </div>
          
          <div className="bg-card border p-6 rounded-xl space-y-3 shadow-sm">
            <Database className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Metadata Privacy</h3>
            <p className="text-sm text-muted-foreground">
              To comply with PII (Personally Identifiable Information) regulations, no raw data is stored on-chain. We utilize a secure `bytes32` metadata hash representing an encrypted IPFS document.
            </p>
          </div>
          
          <div className="bg-card border p-6 rounded-xl space-y-3 shadow-sm">
            <LinkIcon className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Two-Step Transfers</h3>
            <p className="text-sm text-muted-foreground">
              Transferring ownership requires a handshake. The current owner proposes the transfer, and the pending owner must accept it. This eliminates the risk of sending high-value assets to zero or inaccessible addresses.
            </p>
          </div>

          <div className="bg-card border p-6 rounded-xl space-y-3 shadow-sm">
            <BookOpen className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-bold">Transparent Auditing</h3>
            <p className="text-sm text-muted-foreground">
              Every action emits a permanent, immutable event on the blockchain. Property registrations, verifications, transfers, and metadata updates create an undeniable audit trail.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
