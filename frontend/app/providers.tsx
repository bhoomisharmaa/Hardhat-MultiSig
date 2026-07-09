"use client";

import { WagmiProvider } from "wagmi";
import { config } from "../utils/wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
