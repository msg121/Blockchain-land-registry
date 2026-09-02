# LandProof - Digital Land Registry

**LandProof** is a modern, Web3-powered decentralized application (dApp) for secure, transparent, and immutable land ownership registration and verification on the Ethereum blockchain.

By leveraging cryptographic security and decentralized architecture, LandProof eliminates fraud, streamlines property transfers, and provides an enterprise-grade role-based access system for government and legal entities.

## 🌟 Key Features

- **Role-Based Access Control (RBAC):** Dedicated portals for `Admin`, `Registrar`, `Verifier`, and `Legal` roles, ensuring only authorized personnel can perform sensitive actions.
- **Secure Property Registration:** Properties are registered with cryptographic hashes of their documents. Metadata is securely stored off-chain (e.g., IPFS), while verification happens on-chain.
- **Two-Step Secure Transfers:** To prevent accidental or malicious transfers, property ownership changes require a two-step process: the current owner proposes a transfer, and the new owner must explicitly accept it.
- **Real-time Blockchain Indexing:** Built-in activity feeds and notification systems that listen to on-chain events (like `PropertyRegistered`, `TransferProposed`, etc.) to keep users updated in real-time.
- **Premium VIP UI:** A state-of-the-art, glassmorphism-inspired dark theme built with Next.js 14 and TailwindCSS for a professional and sleek user experience.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS & shadcn/ui
- **Web3 Integration:** [Wagmi](https://wagmi.sh/) & [viem](https://viem.sh/)
- **Wallet Connection:** Reown AppKit (WalletConnect)
- **State Management:** React Query

### Smart Contracts (Blockchain)
- **Language:** Solidity
- **Network:** Sepolia Testnet / Ethereum Mainnet
- **Features:** Role-Based Access Control (OpenZeppelin)

## 🚀 Getting Started

Follow these steps to run the frontend application locally:

### 1. Clone the repository
```bash
git clone https://github.com/msg121/Blockchain-land-registry.git
cd Blockchain-land-registry
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_smart_contract_address_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👥 User Roles

- **Admin:** Can grant or revoke roles to other wallet addresses.
- **Registrar:** Responsible for registering new land properties onto the blockchain.
- **Verifier:** Responsible for verifying the legal documents and metadata of a property.
- **Legal:** Has emergency powers to recover property ownership in case of disputes or lost access.
- **Standard User (Property Owner):** Can view their properties, propose transfers, and accept pending transfers.

## 📄 License

This project is licensed under the MIT License.
