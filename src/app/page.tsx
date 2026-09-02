import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ShieldCheck, Search, FileText, Fingerprint } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Secure Land Ownership.<br />
            Transparent Verification.<br />
            Digital Future.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the next generation of land registry powered by blockchain technology. Uncompromised security, instant verification, and seamless transfers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/properties" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg px-8 h-12" })}>
              <Search className="mr-2 h-5 w-5" /> Explore Properties
            </Link>
            <Link href="/about" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto text-lg px-8 h-12" })}>
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 container mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-center mb-16">Enterprise-Grade Architecture</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl border flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Cryptographic Security</h3>
            <p className="text-muted-foreground">
              Land ownership records are immutable and secured by the Ethereum blockchain, preventing fraud and unauthorized modifications.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Decentralized Metadata</h3>
            <p className="text-muted-foreground">
              Sensitive property documents are stored securely off-chain, with cryptographic hashes verified on-chain to maintain privacy.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 bg-primary/10 rounded-full">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Two-Step Verification</h3>
            <p className="text-muted-foreground">
              Ownership transfers require proposals and acceptances, ensuring zero-error transactions and robust legal compliance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to modernize land registry?</h2>
          <p className="text-xl opacity-90">
            Join the digital revolution. Whether you are a property owner, a verifier, or a legal authority, our platform is designed for you.
          </p>
          <div className="pt-4">
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "secondary", className: "text-lg px-8 h-12" })}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
