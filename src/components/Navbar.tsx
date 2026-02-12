import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./WalletSelector";

export const Navbar = () => {
  const { connected } = useWallet();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
      connected ? 'bg-chocodark border-b border-gray-800' : 'bg-transparent'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
        <span className="text-xl font-bold text-white">Shelbew</span>
      </div>

      {/* Wallet Selector */}
      <WalletSelector />
    </nav>
  );
};