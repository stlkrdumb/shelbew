"use client";

import { BlobList } from "../components/BlobList";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const BlobListPage = () => {
    const { account, connected } = useWallet();

    if (!connected) {
        return (
            <div>Please connect your wallet first</div>
        )
    }
    
    if (connected) {
        return (
            <>
            <div className="flex justify-center">
                  <BlobList account={account.address}/>
            </div>
            </>
        )
    }
}