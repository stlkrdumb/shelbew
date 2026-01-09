"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient();
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect
        dappConfig={{ 
          network: Network.SHELBYNET,
          // It is recommended to add your API key to this configuration object.
           aptosApiKeys: { shelbynet: import.meta.env.VITE_PUBLIC_SHELBYNET_API_KEY},
        }}
      >
        {children}
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}