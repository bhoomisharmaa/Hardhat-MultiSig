"use client";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import CustomConnectButton from "@/utils/CustomConnectButton";
import {
  AdjustmentsSVG,
  ExclamationSVG,
  PeopleSVG,
  ShieldCheckSVG,
  UserSVG,
} from "@/utils/svgs";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useEffect, useState } from "react";
import { Address } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { config } from "@/utils/wagmiConfig";
import { wagmiContractConfig } from "@/utils/contractConfig";

export default function AuthPage() {
  const [acceptedOwners, setAcceptedOwners] = useState<Number>();
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;
  const { writeContract } = useWriteContract();

  const { data: ownerStatus, refetch: refetchOwnerStatus } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerStatus",
    args: [connectedUserAddress],
    chainId,
    query: { enabled: !!connectedUserAddress },
  });

  const { data: threshold, refetch: refetchThreshold } = useReadContract({
    ...contractConfig,
    functionName: "getApprovalThreshold",
    chainId,
  });

  const { data: owners, refetch: refetchOwners } = useReadContract({
    ...contractConfig,
    functionName: "getOwners",
    chainId,
  });

  const { data: statuses, refetch: refetchStatuses } = useReadContracts({
    contracts: ((owners as Address[]) ?? []).map((owner) => ({
      ...contractConfig,
      functionName: "getOwnerStatus",
      args: [owner],
    })),
    query: { enabled: !!owners && !!contractConfig?.address },
  });

  const calculateAcceptedOwners = () => {
    const acceptedCount = statuses?.filter((s) => s.result === 2).length;
    setAcceptedOwners(acceptedCount);
  };

  const acceptInvitation = async () => {
    writeContract({
      address: contractConfig!.address,
      abi: contractConfig!.abi,
      functionName: "acceptInvitation",
    });
  };

  const declineInvitation = async () => {
    writeContract({
      address: contractConfig!.address,
      abi: contractConfig!.abi,
      functionName: "declineInvitation",
    });
  };

  useEffect(() => {
    if (connectedUserAddress) refetchOwnerStatus();
    refetchThreshold();
    refetchOwners();
    refetchStatuses();
  }, [connectedUserAddress, chainId, contractConfig]);

  useEffect(() => {
    if (!!connectedUserAddress && ownerStatus == 2) {
      router.replace("/");
    }
  }, [connectedUserAddress, ownerStatus]);

  useEffect(() => {
    calculateAcceptedOwners();
  }, [owners, chainId, contractConfig]);

  return (
    <div className="h-full w-full dark:bg-(--color-bg)">
      {ownerStatus == 1 ? (
        <Invitation
          contractAddress={contractConfig?.address}
          acceptedOwners={acceptedOwners as number}
          threshold={threshold as number}
          acceptInvitation={acceptInvitation}
          declineInvitation={declineInvitation}
        />
      ) : (
        <Connect connectedUserAddress={connectedUserAddress} />
      )}
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="w-full h-fit flex flex-col gap-3 p-5 text-center border border-(--color-border) rounded-lg bg-(--color-surface) dark:bg-(--color-surface) dark:border-(--color-border)">
      <CustomConnectButton ownerStatus={0} />
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
      <CustomConnectButton ownerStatus={0} />
    </div>
  );
}

function Connect({
  connectedUserAddress,
}: {
  connectedUserAddress: Address | undefined;
}) {
  return (
    <div className="h-screen w-full flex flex-col bg-(--color-bg)">
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
  );
}

function Invitation({
  contractAddress,
  threshold,
  acceptedOwners,
  acceptInvitation,
  declineInvitation,
}: {
  contractAddress: Address | undefined;
  threshold: number;
  acceptedOwners: number;
  acceptInvitation: MouseEventHandler<HTMLButtonElement>;
  declineInvitation: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="w-full h-full flex flex-col bg-(--color-bg)">
      <div className="h-full w-full bg-(--color-surface) px-6 py-4 flex items-center justify-between border-b border-(--color-border) dark:bg-(--color-surface) dark:border-(--color-border)">
        <span className="text-base text-(--color-text) font-bold tracking-[-0.01rem] dark:text-(--color-text)">
          Cosign
        </span>
        <div className="flex gap-2 items-center">
          <CustomConnectButton ownerStatus={1} />
          <ThemeToggleButton />
        </div>
      </div>
      <div className="h-full w-full flex items-start justify-center py-12 px-6">
        <div className="h-fit w-sm flex flex-col gap-7">
          <div className="h-fit w-fit flex flex-col gap-[10px]">
            <p className="text-xs text-(--color-faint) font-semibold uppercase tracking-[0.08rem] flex items-center gap-1.5 dark:text-(--color-faint)">
              Invitation
            </p>
            <span className="text-2xl font-bold tracking-tight text-(--color-text) dark:text-(--color-text)">
              You've been invited
            </span>
            <p className="w-full h-fit text-sm/[1.6] text-(--color-sub) dark:text-(--color-sub)">
              An owner of this vault has invited your wallet as a co-signer.
              Accept to join or decline to remove yourself from the list.
            </p>
          </div>
          <div className="w-full flex flex-col items-start gap-3">
            <div className="w-full h-fit bg-(--color-card) border border-(--color-border) rounded-lg overflow-hidden flex flex-col">
              <div className="w-full p-5 border-b border-(--color-border) flex flex-col gap-4">
                <div className="w-full flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-(--color-accent-bg) text-(--color-accent)">
                    <UserSVG />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] text-(--color-faint) font-semibold uppercase tracking-[.06rem]">
                      Invited by
                    </span>
                    <span className="font-mono text-[12.5px] text-(--color-text)">
                      {contractAddress?.slice(0, 6) +
                        "…" +
                        contractAddress?.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2.5">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[12.5px] text-(--color-sub)">
                      Vault address
                    </span>
                    <span className="font-mono font-medium text-[12.5px] text-(--color-text) font-semibold">
                      {contractAddress?.slice(0, 6) +
                        "…" +
                        contractAddress?.slice(-4)}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[12.5px] text-(--color-sub)">
                      Network
                    </span>
                    <span className="font-mono font-medium text-[12.5px] text-(--color-text) font-semibold">
                      Sepolia
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[12.5px] text-(--color-sub)">
                      Current Threshold
                    </span>
                    <span className="font-mono font-medium text-[12.5px] text-(--color-accent) font-semibold">
                      {`${threshold} of ${acceptedOwners}`}
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[12.5px] text-(--color-sub)">
                      Threshold after joining
                    </span>
                    <span className="font-mono font-medium text-[12.5px] text-(--color-accent) font-semibold">
                      {`${Math.ceil(((acceptedOwners + 1) * 80.0) / 100.0)} of ${acceptedOwners + 1}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <button
                  onClick={acceptInvitation}
                  className="flex-1 p-3.5 bg-(--color-accent) hover:opacity-[.9] hover:cursor-pointer text-[#fff] text-[13.5px] font-semibold border-r border-(--color-border)"
                >
                  Accept Invitation
                </button>
                <button
                  onClick={declineInvitation}
                  className="flex-1 p-3.5 bg-(--color-card) text-(--color-sub) text-[13.5px] font-semibold hover:cursor-pointer hover:text-(--color-red)"
                >
                  Decline
                </button>
              </div>
            </div>
            <div className="flex flex-col border border-(--color-border) rounded-lg overflow-hidden">
              <div className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-[.06rem] text-(--color-faint) bg-(--color-bg) border-b border-(--color-border)">
                What happens next
              </div>
              <div className="flex items-start gap-3 py-3.5 px-4 bg-(--color-card) border-b border-(--color-border)">
                <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-(--color-bg) border border-(--color-border) text-[10.5px] font-bold text-(--color-faint)">
                  1
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-semibold">
                    You become a co-signer
                  </span>
                  <p className="text-xs text-(--color-sub)">
                    Your wallet is added to the vault and the approval threshold
                    recalculates.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5 px-4 bg-(--color-card) border-b border-(--color-border)">
                <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-(--color-bg) border border-(--color-border) text-[10.5px] font-bold text-(--color-faint)">
                  2
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-semibold">
                    Approve transactions
                  </span>
                  <p className="text-xs text-(--color-sub)">
                    You can approve or revoke approvals on pending transactions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3.5 px-4 bg-(--color-card)">
                <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-(--color-bg) border border-(--color-border) text-[10.5px] font-bold text-(--color-faint)">
                  3
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-semibold">
                    Leave anytime
                  </span>
                  <p className="text-xs text-(--color-sub)">
                    You can leave the vault as long as quorum is maintained.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
