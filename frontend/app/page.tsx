"use client";
import { useAccount, useChainId, useReadContract } from "wagmi";
import SideBar from "../components/SideBar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { wagmiContractConfig } from "@/utils/contractConfig";
import { config } from "@/utils/wagmiConfig";
import { CrossSVG } from "@/utils/svgs";

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
    <div className="h-screen w-screen">
      <div className="h-full w-full flex bg-(--color-bg)">
        <SideBar />
        <Overview />
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="h-full w-full max-w-[960px] pt-10 pb-20 px-12">
      <div className="flex flex-col gap-10">
        <OverviewHead />
        <OverviewCredit />
        <OverviewTransaction />
        <OverviewOwners />
      </div>
    </div>
  );
}

function OverviewHead() {
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
          <div className="h-1 w-1 rounded bg-(--color-go)" />
          Live on Sepolia
        </div>
        <h1 className="text-[28px] text-(--color-text) font-bold tracking-tight flex flex-col items-start">
          Overview
          <small className="font-mono text-xs text-(--color-faint) font-normal tracking-normal">
            0x8B2c4E9aF71d3B5C2A7e9810bD4F6E3C1A2f7F19
          </small>
        </h1>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="bg-(--color-card) text-(--color-text) border border-(--color-border) text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:border-(--color-border2)">
          Copy Address
        </button>
        <button className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]">
          Propose Transaction
        </button>
      </div>
    </div>
  );
}

function OverviewCredit() {
  return (
    <div className="grid grid-cols-3 gap-px border border-(--color-border) rounded-lg overflow-hidden">
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2 border-r border-(--color-border)">
        <span className="text-[11px] text-(--color-faint) uppercase tracking-[.06rem] font-semibold">
          balance
        </span>
        <div className="flex flex-col items-start gap-px">
          <span className="text-[26px] text-(--color-text) font-bold tracking-[-.02em]">
            4.820
            <small className="text-[13px] text-(--color-sub) font-normal ml-1">
              ETH
            </small>
          </span>
          <span className="text-xs text-(--color-sub)">≈ $16,937</span>
        </div>
      </div>
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2 border-r border-(--color-border)">
        <span className="text-[11px] text-(--color-faint) uppercase tracking-[.06rem] font-semibold">
          pending
        </span>
        <div className="flex flex-col items-start gap-px">
          <span className="text-[26px] text-(--color-text) font-bold tracking-[-.02em]">
            2
          </span>
          <span className="text-xs text-(--color-sub)">awaiting approvals</span>
        </div>
      </div>
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2">
        <span className="text-[11px] text-(--color-faint) uppercase tracking-[.06rem] font-semibold">
          owners
        </span>
        <div className="flex flex-col items-start gap-px">
          <span className="text-[26px] text-(--color-text) font-bold tracking-[-.02em]">
            1
            <small className="text-[13px] text-(--color-sub) font-normal ml-1">
              / 3
            </small>
          </span>
          <span className="text-xs text-(--color-sub)">accepted</span>
        </div>
      </div>
    </div>
  );
}

function OverviewTransaction() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
          Needs your approval — 1
        </span>
        <button className="text-xs text-(--color-accent) font-semibold hover:cursor-pointer hover:underline">
          View all
        </button>
      </div>
      <div className="block border border-(--color-border) rounded-lg bg-(--color-card) overflow-hidden px-4.5 py-4">
        <div className="flex flex-col ">
          <div className="border-b border-(--color-border) flex flex-col gap-3">
            <div className="flex items-start justify-between flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-(--color-sub) text-[12.5px]">
                  → 0x7a3f…521c
                </span>
                <span className="text-[20px] text-(--color-text) font-bold tracking-[-.02em]">
                  1.200
                  <small className="text-xs text-(--color-sub) font-normal ml-1">
                    ETH
                  </small>
                </span>
              </div>
              <span className="bg-(--color-accent-bg) text-(--color-accent) text-[11.5px] font-semibold py-[3px] px-[9px] rounded-sm">
                Ready
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              <div className="h-[22px] w-[22px] bg-(--color-accent) text-[#fff] text-[10px] font-bold rounded-sm flex items-center justify-center">
                ✓
              </div>
              <span className="text-xs text-(--color-sub)">
                <span className="text-(--color-text) font-bold">1</span> of 1
              </span>
            </div>
            <button className="text-xs text-(--color-warn) font-semibold px-3 py-1.5 rounded-[5px] bg-(--color-warn-bg) border border-[#0000] hover:border-(--color-warn)">
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewOwners() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
          Owners
        </span>
        <button className="text-xs text-(--color-accent) font-semibold hover:cursor-pointer hover:underline">
          Manage
        </button>
      </div>
      <div className="block border border-(--color-border) rounded-lg overflow-hidden bg-(--color-card) font-mono text-[14px] text-(--color-text)">
        <div className="flex items-center gap-3 px-[14px] py-[18px] border-b border-(--color-border)">
          <div className="w-2 h-2 rounded bg-(--color-go)" />
          <span className="flex flex-col">
            0x4e21…0091
            <span className="text-[11px] text-(--color-go)">Accpeted</span>
          </span>
        </div>
        <div className="flex items-center gap-3 px-[14px] py-[18px]">
          <div className="w-2 h-2 rounded bg-(--color-warn)" />
          <span className="flex flex-col">
            0x4e21…0091
            <span className="text-[11px] text-(--color-warn)">Invited</span>
          </span>
          <button className="w-7 h-7 rounded-[5px] border border-(--color-border) text-(--color-faint) flex items-center justify-center ml-auto hover:text-(--color-red) hover:border-(--color-red) hover:cursor-pointer">
            <CrossSVG />
          </button>
        </div>
      </div>
    </div>
  );
}
