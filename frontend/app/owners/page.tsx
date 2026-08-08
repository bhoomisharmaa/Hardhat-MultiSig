"use client";
import SideBar from "@/components/SideBar";
import { wagmiContractConfig } from "@/utils/contractConfig";
import { useToast } from "@/utils/hooks/useToast";
import { CrossSVG } from "@/utils/svgs";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { config } from "@/utils/wagmiConfig";
import { Abi, Address } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import InviteOwner from "@/utils/InviteOwner";

export default function Owners() {
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;
  const [isInviteOwner, setIsInviteOwner] = useState(false);
  const { toasts: inviteOwnerToast, showToast: showInviteOwnerToast } =
    useToast();

  const { data: ownerStatus, refetch: refetchOwnerStatus } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerStatus",
    args: [connectedUserAddress],
    chainId,
    query: { enabled: !!connectedUserAddress },
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

  useEffect(() => {
    if (!connectedUserAddress || ownerStatus != 2) {
      router.replace("/auth");
    }
  }, [connectedUserAddress]);

  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex bg-(--color-bg)">
        <SideBar />
        {isInviteOwner ? (
          <InviteOwner
            contractAddress={contractConfig?.address}
            contractAbi={contractConfig?.abi}
            showCreateTransactionToast={showInviteOwnerToast}
            setIsProposeTransaction={setIsInviteOwner}
          />
        ) : (
          <div className="h-full w-full max-w-[960px] pt-10 pb-20 px-12">
            <div className="flex flex-col gap-10">
              <OwnersHeader setIsInviteOwner={setIsInviteOwner} />
              <Ownersection
                contractAbi={contractConfig?.abi}
                contractAddress={contractConfig?.address}
                owners={owners as Address[] | undefined}
                ownersStatus={statuses?.map((s) => s.result as number)}
              />
            </div>
          </div>
        )}
        <div className="fixed bottom-5 right-5 flex flex-col gap-2">
          {inviteOwnerToast.map((toast) => (
            <div
              key={toast.id}
              className="bg-(--color-go) text-white text-sm font-semibold px-4 py-3 rounded-lg"
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OwnersHeader({
  setIsInviteOwner,
}: {
  setIsInviteOwner: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col items-start gap-1">
        <div className="text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
          co-signers
        </div>
        <h1 className="text-[28px] text-(--color-text) font-bold tracking-tight">
          Owners
        </h1>
      </div>

      <button
        onClick={() => {
          setIsInviteOwner(true);
        }}
        className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]"
      >
        Invite Owner
      </button>
    </div>
  );
}

function Ownersection({
  owners,
  ownersStatus,
  contractAddress,
  contractAbi,
}: {
  owners: Address[] | undefined;
  ownersStatus: number[] | undefined;
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
}) {
  const { writeContract, isSuccess } = useWriteContract();
  const { toasts, showToast } = useToast();

  const removeInvitedOwner = async (address: Address) => {
    writeContract({
      address: contractAddress!,
      abi: contractAbi!,
      functionName: "removeInvitedOwner",
      args: [address],
    });
  };

  useEffect(() => {
    if (isSuccess) showToast("Invitation removed");
  }, [isSuccess]);

  return (
    <div className="flex flex-col gap-3">
      <div className="block border border-(--color-border) rounded-lg overflow-hidden bg-(--color-card) font-mono text-[14px] text-(--color-text)">
        {owners?.map((owner, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-[14px] py-[18px] ${index > 0 ? "border-t border-(--color-border)" : ""}`}
          >
            <div
              className={`w-2 h-2 rounded ${ownersStatus?.[index] === 2 ? "bg-(--color-go)" : "bg-(--color-warn)"}`}
            />
            <span className="flex flex-col">
              {owner}
              <span
                className={`text-[11px] ${ownersStatus?.[index] === 2 ? "text-(--color-go)" : "text-(--color-warn)"}`}
              >
                {ownersStatus?.[index] === 2 ? "Accepted" : "Invited"}
              </span>
            </span>
            {ownersStatus?.[index] === 1 && (
              <button
                onClick={() => {
                  removeInvitedOwner(owner);
                }}
                className="w-7 h-7 rounded-[5px] border border-(--color-border) text-(--color-faint) flex items-center justify-center ml-auto hover:text-(--color-red) hover:border-(--color-red) hover:cursor-pointer"
              >
                <CrossSVG />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="fixed bottom-5 right-5 flex flex-col gap-2">
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
