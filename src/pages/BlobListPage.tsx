"use client";

import { BlobList } from "../components/BlobList";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const BlobListPage = () => {
    const { account, connected, signAndSubmitTransaction } = useWallet();
    if (!connected || !account || !signAndSubmitTransaction) {
        return;
    }
    if (connected) {
        return (
            <BlobList account={account.address.toStringLongWithoutPrefix()} />
        )
    }
}