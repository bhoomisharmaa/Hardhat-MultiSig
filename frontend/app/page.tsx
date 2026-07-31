"use client";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import SideBar from "../components/SideBar";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { wagmiContractConfig } from "@/utils/contractConfig";
import { config } from "@/utils/wagmiConfig";
import { CrossSVG } from "@/utils/svgs";
import { Abi, Address, formatEther } from "viem";
import { useToast } from "@/utils/hooks/useToast";
import ProposeTransaction from "@/utils/ProposeTransaction";

export default function Home() {
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;
  const {
    toasts: createTransactionToast,
    showToast: showCreateTransactionToast,
  } = useToast();
  const [isProposeTransaction, setIsProposeTransaction] = useState(false);

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
    if (connectedUserAddress) refetchOwnerStatus();
    refetchOwners();
    refetchStatuses();
  }, [connectedUserAddress, chainId, contractConfig]);

  useEffect(() => {
    if (!connectedUserAddress || ownerStatus != 2) {
      router.push("/auth");
    }
  }, [connectedUserAddress]);

  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex bg-(--color-bg)">
        <SideBar />
        {isProposeTransaction ? (
          <ProposeTransaction
            contractAddress={contractConfig?.address}
            contractAbi={contractConfig?.abi}
            showCreateTransactionToast={showCreateTransactionToast}
            setIsProposeTransaction={setIsProposeTransaction}
          />
        ) : (
          <Overview
            contractAddress={contractConfig?.address}
            contractAbi={contractConfig?.abi}
            acceptedOwnerCount={
              statuses?.filter((s) => s.result === 2).length ?? 0
            }
            invitedOwnerCount={
              statuses?.filter((s) => s.result === 1).length ?? 0
            }
            owners={owners as Address[] | undefined}
            ownersStatus={statuses?.map((s) => s.result as number)}
            setIsProposeTransaction={setIsProposeTransaction}
          />
        )}
        <div className="fixed bottom-5 right-5 flex flex-col gap-2">
          {createTransactionToast.map((toast) => (
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

function Overview({
  contractAddress,
  contractAbi,
  acceptedOwnerCount,
  invitedOwnerCount,
  owners,
  ownersStatus,
  setIsProposeTransaction,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  acceptedOwnerCount: number;
  invitedOwnerCount: number;
  owners: Address[] | undefined;
  ownersStatus: number[] | undefined;
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="h-full w-full max-w-[960px] pt-10 pb-20 px-12">
      <div className="flex flex-col gap-10">
        <OverviewHead
          contractAddress={contractAddress}
          contractAbi={contractAbi}
          setIsProposeTransaction={setIsProposeTransaction}
        />
        <OverviewCredit
          contractAddress={contractAddress}
          acceptedOwnerCount={acceptedOwnerCount}
          invitedOwnerCount={invitedOwnerCount}
        />
        <OverviewTransaction />
        <OverviewOwners
          owners={owners}
          ownersStatus={ownersStatus}
          contractAddress={contractAddress}
          contractAbi={contractAbi}
        />
      </div>
    </div>
  );
}

function OverviewHead({
  contractAddress,
  contractAbi,
  setIsProposeTransaction,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
}) {
  const { toasts, showToast } = useToast();

  async function copyToClipboard() {
    await navigator.clipboard.writeText(contractAddress as string);
    showToast("Address copied");
  }

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
            {contractAddress}
          </small>
        </h1>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={copyToClipboard}
          className="bg-(--color-card) text-(--color-text) border border-(--color-border) text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:border-(--color-border2)"
        >
          Copy Address
        </button>
        <button
          onClick={() => {
            setIsProposeTransaction(true);
          }}
          className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]"
        >
          Propose Transaction
        </button>
      </div>
      <div className="fixed bottom-5 right-5 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-(--color-go) text-white text-sm font-semibold px-4 py-3 rounded-lg"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewCredit({
  contractAddress,
  acceptedOwnerCount,
  invitedOwnerCount,
}: {
  contractAddress: Address | undefined;
  acceptedOwnerCount: number;
  invitedOwnerCount: number;
}) {
  const { data: contractBalance } = useBalance({
    address: contractAddress,
    blockTag: "latest",
  });

  const getETHinUSD = () => {
    const ethBalance = parseFloat(
      formatEther(contractBalance?.value ?? BigInt(0)),
    ).toFixed(3);

    return `≈ $${(parseFloat(ethBalance) * 1868.43).toFixed(3)}`;
  };

  return (
    <div className="grid grid-cols-3 gap-px border border-(--color-border) rounded-lg overflow-hidden">
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2 border-r border-(--color-border)">
        <span className="text-[11px] text-(--color-faint) uppercase tracking-[.06rem] font-semibold">
          balance
        </span>
        <div className="flex flex-col items-start gap-px">
          <span className="text-[26px] text-(--color-text) font-bold tracking-[-.02em]">
            {contractBalance?.value !== undefined
              ? parseFloat(formatEther(contractBalance.value)).toFixed(3)
              : "0.000"}
            <small className="text-[13px] text-(--color-sub) font-normal ml-1">
              ETH
            </small>
          </span>
          <span className="text-xs text-(--color-sub)">{getETHinUSD()}</span>
        </div>
      </div>
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2 border-r border-(--color-border)">
        <span className="text-[11px] text-(--color-faint) uppercase tracking-[.06rem] font-semibold">
          pending
        </span>
        <div className="flex flex-col items-start gap-px">
          <span className="text-[26px] text-(--color-text) font-bold tracking-[-.02em]">
            {invitedOwnerCount}
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
            {acceptedOwnerCount}
            <small className="text-[13px] text-(--color-sub) font-normal ml-1">
              / {acceptedOwnerCount + invitedOwnerCount}
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

function OverviewOwners({
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
  const router = useRouter();

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
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
          Owners
        </span>
        <button
          onClick={() => {
            router.push("./owners");
          }}
          className="text-xs text-(--color-accent) font-semibold hover:cursor-pointer hover:underline"
        >
          Manage
        </button>
      </div>
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
