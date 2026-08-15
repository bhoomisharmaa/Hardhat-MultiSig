"use client";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useWatchBlockNumber,
} from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Abi, Address } from "viem";
import { wagmiContractConfig } from "@/utils/contractConfig";
import { config } from "@/utils/wagmiConfig";
import { useToast } from "@/utils/hooks/useToast";
import SideBar from "@/components/SideBar";
import Loading from "@/components/Loading";

function shortAddr(address: string) {
  return address.slice(0, 6) + "…" + address.slice(-4);
}

export default function Settings() {
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;

  const { data: ownersCount, refetch: refetchOwnersCount } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerCount",
    chainId,
  });

  const { data: threshold, refetch: refetchThreshold } = useReadContract({
    ...contractConfig,
    functionName: "getApprovalThreshold",
    chainId,
  });

  const { data: ownerStatus, refetch: refetchOwnerStatus } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerStatus",
    args: [connectedUserAddress],
    chainId,
    query: { enabled: !!connectedUserAddress },
  });

  const refetchData = () => {
    refetchOwnersCount();
    refetchThreshold();
    refetchOwnerStatus();
  };

  useEffect(() => {
    refetchData();
  }, [connectedUserAddress, contractConfig, chainId]);

  useEffect(() => {
    if ((ownerStatus && ownerStatus !== 2) || !connectedUserAddress) {
      router.push("/auth");
    }
  }, [connectedUserAddress, ownerStatus]);

  useWatchBlockNumber({
    onBlockNumber() {
      refetchData();
    },
  });

  if (!contractConfig || !ownerStatus) {
    return <Loading />;
  }

  return (
    <div className="h-full w-full flex flex-col ml:flex-row bg-(--color-bg)">
      <SideBar />
      <div className="flex-1 min-w-0 w-full max-w-[960px] pt-6 pb-20 px-4 sm:px-8 md:pt-10 md:px-12">
        <div className="flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
              Config
            </span>
            <h1 className="text-[22px] sm:text-[28px] text-(--color-text) font-bold tracking-tight">
              Settings
            </h1>
          </div>

          <ContractSection
            contractAddress={contractConfig?.address}
            ownersCount={ownersCount as bigint}
            threshold={threshold as bigint}
          />

          <YouSection
            contractAddress={contractConfig?.address}
            contractAbi={contractConfig?.abi}
            connectedUserAddress={connectedUserAddress}
          />

          <DangerZone />
        </div>
      </div>
    </div>
  );
}

function ContractSection({
  contractAddress,
  threshold,
  ownersCount,
}: {
  contractAddress: Address | undefined;
  threshold: bigint;
  ownersCount: bigint;
}) {
  const rows = [
    {
      label: "Address",
      value: contractAddress ? shortAddr(contractAddress) : "—",
      mono: true,
    },
    { label: "Network", value: "Sepolia testnet", mono: false },
    {
      label: "Threshold",
      value: `${threshold} of ${ownersCount}`,
      mono: false,
    },
    { label: "Formula", value: "ceil(accepted × 80%)", mono: true },
    { label: "Total owners", value: `${ownersCount}`, mono: false },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
        Contract
      </span>
      <div className="border border-(--color-border) rounded-lg overflow-hidden bg-(--color-card)">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-[14px] sm:px-[18px] py-[12px] sm:py-[15px] gap-1 sm:gap-4 ${i > 0 ? "border-t border-(--color-border)" : ""}`}
          >
            <span className="text-[12.5px] sm:text-[13px] text-(--color-sub)">
              {row.label}
            </span>
            <span
              className={`text-[12.5px] sm:text-[13px] font-semibold text-(--color-text) break-all sm:text-right ${row.mono ? "font-mono" : ""}`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YouSection({
  contractAddress,
  contractAbi,
  connectedUserAddress,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  connectedUserAddress: Address | undefined;
}) {
  const router = useRouter();
  const { toasts, showToast } = useToast();

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      showToast("You left the wallet");
      setTimeout(() => router.push("/auth"), 1500);
    }
  }, [isSuccess]);

  function handleLeave() {
    if (!contractAddress || !contractAbi) return;
    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "leaveWallet",
    });
  }

  const isLoading = isPending || isConfirming;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
        You
      </span>
      <div className="border border-(--color-border) rounded-lg overflow-hidden bg-(--color-card)">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-[14px] sm:px-[18px] py-[12px] sm:py-[15px] gap-1 sm:gap-4">
          <span className="text-[12.5px] sm:text-[13px] text-(--color-sub)">
            Address
          </span>
          <span className="text-[12.5px] sm:text-[13px] font-mono font-semibold text-(--color-text) break-all sm:text-right">
            {connectedUserAddress ? shortAddr(connectedUserAddress) : "—"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-[14px] sm:px-[18px] py-[12px] sm:py-[15px] gap-1 sm:gap-4 border-t border-(--color-border)">
          <span className="text-[12.5px] sm:text-[13px] text-(--color-sub)">
            Status
          </span>
          <span className="text-[12.5px] sm:text-[13px] font-semibold text-(--color-go)">
            Accepted
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-[14px] sm:px-[18px] py-[12px] sm:py-[15px] gap-2 sm:gap-4 border-t border-(--color-border)">
          <span className="text-[12.5px] sm:text-[13px] text-(--color-sub)">
            Leave wallet
          </span>
          <button
            type="button"
            onClick={handleLeave}
            disabled={isLoading}
            className="w-full sm:w-auto bg-(--color-red-bg) text-(--color-red) text-[12.5px] sm:text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending
              ? "Waiting..."
              : isConfirming
                ? "Confirming..."
                : "Leave"}
          </button>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 left-5 sm:left-auto flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-(--color-text) text-(--color-surface) text-sm font-semibold px-4 py-3 rounded-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerZone() {
  return (
    <div className="border border-(--color-border) border-l-4 border-l-(--color-red) rounded-lg p-4 sm:p-5 bg-(--color-card)">
      <h3 className="text-[13px] sm:text-[13.5px] font-bold text-(--color-red) mb-1.5">
        Threshold is immutable
      </h3>
      <p className="text-[12px] sm:text-[12.5px] text-(--color-sub) leading-relaxed">
        The threshold formula —{" "}
        <span className="font-mono">ceil(accepted × 80%)</span> — is baked into
        the contract and cannot be changed. It recalculates automatically when
        owners join or leave.
      </p>
    </div>
  );
}
