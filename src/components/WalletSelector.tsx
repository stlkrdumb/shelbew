"use client";

import React, { useState } from "react";
import {
  useWallet,
  WalletReadyState,
  type AdapterWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletSelector() {
  const {
    connect,
    account,
    connected,
    disconnect,
    wallets,
    isLoading,
  } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);

  // Helper to format address
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const onWalletSelect = (wallet: AdapterWallet) => {
    connect(wallet.name);
    closeDialog();
  };


  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="font-mono bg-shelbypink hover:bg-pink-700 text-white border-none">
            {formatAddress(account.address.toString())}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              disconnect();
              closeDialog();
            }}
            className="text-red-500 focus:text-red-500 cursor-pointer"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-shelbypink hover:bg-pink-700 text-white">
            {isLoading ? "Loading..." : "Connect Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {wallets &&
            wallets.map((wallet) => {
               return (
                <WalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={() => onWalletSelect(wallet)}
                />
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet;
  onConnect: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <Button
      variant="outline"
      onClick={onConnect}
      className="w-full justify-start gap-4 h-14"
    >
      <img src={wallet.icon} alt={wallet.name} className="h-6 w-6 rounded-full" />
      <div className="flex flex-col items-start">
        <span className="font-semibold">{wallet.name}</span>
        {wallet.readyState === WalletReadyState.Installed && (
             <span className="text-xs text-green-500">Detected</span>
        )}
      </div>
    </Button>
  );
}
