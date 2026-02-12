"use client";

import React from "react";
import { BlobList } from "../components/BlobList";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const BlobListPage = () => {
    const { account, connected, signAndSubmitTransaction } = useWallet();
    
    if (!connected || !account || !signAndSubmitTransaction) {
        return (
            <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
                {/* Thomas Shelby Banner Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/banner.png"
                        alt="Thomas Shelby"
                        className="w-full h-full object-cover opacity-40"
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-6 space-y-8 max-w-2xl">
                    {/* Main Message */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                            Welcome to <span className="text-shelbypink">Shelbew</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light">
                            Your decentralized file storage on Shelby Network
                        </p>
                    </div>

                    {/* Call to Action */}
                    <div className="space-y-4">
                        <div className="inline-block px-8 py-4 bg-shelbypink/10 border-2 border-shelbypink rounded-lg backdrop-blur-sm">
                            <p className="text-2xl font-semibold text-shelbypink">
                                Connect your wallet first!
                            </p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Click the "Connect Wallet" button in the top right to get started
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <div className="text-4xl mb-3">🔒</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
                            <p className="text-sm text-gray-400">Your files are encrypted and stored on-chain</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <div className="text-4xl mb-3">⚡</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
                            <p className="text-sm text-gray-400">Lightning-fast uploads and downloads</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <div className="text-4xl mb-3">🌐</div>
                            <h3 className="text-lg font-semibold text-white mb-2">Decentralized</h3>
                            <p className="text-sm text-gray-400">No single point of failure</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (connected) {
        return (
            <BlobList account={account.address.toStringLongWithoutPrefix()} />
        )
    }
}