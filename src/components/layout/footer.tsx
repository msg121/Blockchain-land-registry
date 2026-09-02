import Link from "next/link"
import { Map, Globe, MessageSquare, Users } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Map className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">LandProof</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Secure Land Ownership. Transparent Verification. Digital Future. Powered by Blockchain.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/properties" className="hover:text-primary transition-colors">Property Explorer</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">User Dashboard</Link></li>
              <li><Link href="/activity" className="hover:text-primary transition-colors">Network Activity</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Portals</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/registrar" className="hover:text-primary transition-colors">Registrar Portal</Link></li>
              <li><Link href="/verifier" className="hover:text-primary transition-colors">Verifier Portal</Link></li>
              <li><Link href="/legal" className="hover:text-primary transition-colors">Legal Recovery</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LandProof. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
