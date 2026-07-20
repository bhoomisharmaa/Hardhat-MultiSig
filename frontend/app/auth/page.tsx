"use client";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import CustomConnectButton from "@/utils/CustomConnectButton";
import {
  AdjustmentsSVG,
  ExclamationSVG,
  PeopleSVG,
  ShieldCheckSVG,
} from "@/utils/svgs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { config } from "@/utils/wagmiConfig";
import { wagmiContractConfig } from "@/utils/contractConfig";

export default function AuthPage() {
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
    if (!!connectedUserAddress && ownerStatus == 2) {
      router.replace("/");
    }
  }, [connectedUserAddress, ownerStatus]);

  return (
    <div className="h-screen w-full bg-(--color-bg) dark:bg-(--color-bg)">
      <div className="h-full w-full flex flex-col">
        <div className="h-fit w-full bg-(--color-surface) px-6 py-4 flex items-center justify-between border-b border-(--color-border) dark:bg-(--color-surface) dark:border-(--color-border)">
          <span className="text-base text-(--color-text) font-bold tracking-[-0.01rem] dark:text-(--color-text)">
            Cosign
          </span>
          <ThemeToggleButton />
        </div>
        <div className="w-full h-full flex items-start justify-center px-6 py-12">
          <div className="h-fit w-sm flex flex-col gap-8">
            <div className="h-fit w-fit flex flex-col gap-[10px]">
              <div className="text-xs text-(--color-faint) font-semibold uppercase tracking-[0.08rem] flex items-center gap-1.5 dark:text-(--color-faint)">
                <div className="h-1.5 w-1.5 bg-(--color-go) rounded dark:bg-(--color-go)" />
                on sepolia
              </div>
              <span className="text-2xl font-bold tracking-tight text-(--color-text) dark:text-(--color-text)">
                Multisig vault
              </span>
              <p className="w-full h-fit text-sm/[1.6] text-(--color-sub) dark:text-(--color-sub)">
                Connect your wallet to access the vault. You'll need to be an
                invited owner to sign in.
              </p>
            </div>
            <div className="w-full flex flex-col items-start gap-3">
              {!connectedUserAddress ? (
                <ConnectCard />
              ) : (
                <NotAnOwnerCard connectedUserAddress={connectedUserAddress} />
              )}
              <div className="w-full h-fit flex flex-col border border-(--color-border) rounded-lg overflow-hidden bg-(--color-surface) dark:bg-(--color-surface) dark:border-(--color-border)">
                <div className="w-full flex items-start gap-2 px-4 py-3.5 bg-(--color-card) border-b border-(--color-border)">
                  <div className="flex items-center justify-center p-2 rounded-md text-(--color-sub) bg-(--color-bg)">
                    <ShieldCheckSVG />
                  </div>
                  <div className="w-full h-full flex flex-col gap-1 items-start">
                    <p className="text-(--color-text) text-sm font-semibold">
                      M-of-N approvals
                    </p>
                    <p className="text-xs text-(--color-sub)">
                      Transactions only execute when enough co-signers approve.
                    </p>
                  </div>
                </div>
                <div className="w-full flex items-start gap-2 px-4 py-3.5 bg-(--color-card) border-b border-(--color-border)">
                  <div className="flex items-center justify-center p-2 rounded-md text-(--color-sub) bg-(--color-bg)">
                    <PeopleSVG />
                  </div>
                  <div className="w-full h-full flex flex-col gap-1 items-start">
                    <p className="text-(--color-text) text-sm font-semibold">
                      Shared ownership
                    </p>
                    <p className="text-xs text-(--color-sub)">
                      Invite co-signers and manage who has access to the vault.
                    </p>
                  </div>
                </div>
                <div className="w-full flex items-start gap-2 px-4 py-3.5 bg-(--color-card)">
                  <div className="flex items-center justify-center p-2 rounded-md text-(--color-sub) bg-(--color-bg)">
                    <AdjustmentsSVG />
                  </div>
                  <div className="w-full h-full flex flex-col gap-1 items-start">
                    <p className="text-(--color-text) text-sm font-semibold">
                      Dynamic threshold
                    </p>
                    <p className="text-xs text-(--color-sub)">
                      Approval threshold adjusts automatically as owners join or
                      leave.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="w-full h-fit flex flex-col gap-3 p-5 text-center border border-(--color-border) rounded-lg bg-(--color-surface) dark:bg-(--color-surface) dark:border-(--color-border)">
      <CustomConnectButton />
      {
        <p className="text-xs text-(--color-faint) dark:text-(--color-faint)">
          Supports MetaMask, WalletConnect, Coinbase Wallet
        </p>
      }
    </div>
  );
}

function NotAnOwnerCard({
  connectedUserAddress,
}: {
  connectedUserAddress: Address;
}) {
  return (
    <div className="w-full h-fit bg-(--color-card) border border-(--color-border) rounded-lg p-6 flex flex-col items-center justify-center gap-3.5">
      <div className="bg-(--color-red-bg) text-(--color-red) p-3 rounded-[10px]">
        <ExclamationSVG />
      </div>
      <p className="text-[15px] font-bold text-(--color-text)">Not an owner</p>
      <p className="text-[13px] text-(--color-sub) text-center">
        This wallet isn't invited to the vault. Ask an existing owner to invite
        your address.
      </p>
      <div className="flex items-center gap-1.5 bg-(--color-bg) border border-(--color-border) rounded-md py-1.5 px-3 font-mono text-xs text-(--color-sub)">
        <div className="w-1.5 h-1.5 rounded bg-(--color-faint)" />
        {connectedUserAddress.slice(0, 6) +
          "…" +
          connectedUserAddress.slice(-4)}
      </div>
      <CustomConnectButton />
    </div>
  );
}
