import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LandProof | Digital Land Registry",
  description: "Secure Land Ownership and Verification Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 relative overflow-hidden text-slate-100">
            {/* Global Decorative background elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-60 -left-20 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
