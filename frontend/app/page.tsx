"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import SideBar from "../components/SideBar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { wagmiContractConfig } from "@/utils/contractConfig";
import { config } from "@/utils/wagmiConfig";

export default function Home() {
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;

  const { data: ownerStatus, refetch: refetchOwnerStatus } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerStatus",
    args: [connectedUserAddress],
    chainId,
    query: { enabled: !!connectedUserAddress },
  });

  useEffect(() => {
    if (connectedUserAddress) refetchOwnerStatus();
  }, [connectedUserAddress, chainId, contractConfig]);

  useEffect(() => {
    if (!connectedUserAddress && ownerStatus != 2) {
      router.push("/auth");
    }
  }, [connectedUserAddress]);

  return (
    <div className="h-screen w-screen bg-(--color-bg) dark:bg-(--color-bg)">
      <div className="h-full w-full flex">
        <SideBar />
        <div className="h-full w-full"></div>
      </div>
    </div>
  );
}
