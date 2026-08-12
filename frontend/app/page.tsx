"use client";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useReadContracts,
  useWatchBlockNumber,
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
import TransactionsSection from "@/utils/TransactionsSection";

type Transaction = [
  Address,
  Address,
  bigint,
  bigint,
  bigint,
  number,
  Address[],
  number,
];

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
  const [transactions, setTransactions] = useState<Transaction[]>();

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

  const { data: transactionCount, refetch: refetchTransactionCount } =
    useReadContract({
      ...contractConfig,
      functionName: "getTransactionCount",
      chainId,
    });

  const { data: rawTransactions, refetch: refetchRawTransactions } =
    useReadContracts({
      contracts: Array.from(
        { length: transactionCount ? Number(transactionCount) : 0 },
        (_, i) => ({
          ...contractConfig,
          functionName: "getTransaction",
          args: [i],
        }),
      ),
      query: { enabled: !!transactionCount && !!contractConfig?.address },
    });

  const refetchData = () => {
    refetchOwnerStatus();
    refetchOwners();
    refetchStatuses();
    refetchTransactionCount();
    refetchRawTransactions();
    refetchThreshold();
  };

  useEffect(() => {
    let tempTransactions = rawTransactions?.map((tx) => {
      return tx.result as Transaction;
    });

    tempTransactions = tempTransactions?.filter(
      (txn) => !txn[6].includes(connectedUserAddress!),
    );

    setTransactions(tempTransactions);
  }, [rawTransactions, connectedUserAddress]);

  useEffect(() => {
    refetchData();
  }, [connectedUserAddress, chainId, contractConfig]);

  useEffect(() => {
    if (!connectedUserAddress || ownerStatus !== 2) {
      router.push("/auth");
    }
  }, [connectedUserAddress, ownerStatus]);

  useWatchBlockNumber({
    onBlockNumber() {
      refetchData();
    },
  });

  return (
    <div className="h-full w-full">
      <div className="h-full w-full flex flex-col ml:flex-row bg-(--color-bg)">
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
            threshold={threshold as bigint}
            transactions={transactions}
            connectedUserAddress={connectedUserAddress}
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
  transactions,
  threshold,
  connectedUserAddress,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  acceptedOwnerCount: number;
  invitedOwnerCount: number;
  owners: Address[] | undefined;
  ownersStatus: number[] | undefined;
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
  transactions: Transaction[] | undefined;
  threshold: bigint;
  connectedUserAddress: Address | undefined;
}) {
  return (
    <div className="h-full w-full max-w-[960px] pt-6 pb-17.5 px-4.5 ml:pt-10 ml:pb-20 ml:px-12">
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
        <OverviewTransaction
          connectedUserAddress={connectedUserAddress}
          contractAbi={contractAbi}
          contractAddress={contractAddress}
          threshold={threshold as bigint}
          transactions={transactions}
        />
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
    <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-end sm:justify-between">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
          <div className="h-1 w-1 rounded bg-(--color-go)" />
          Live on Sepolia
        </div>
        <h1 className="text-[22px] ml:text-[28px] text-(--color-text) font-bold tracking-tight flex flex-col items-start">
          Overview
          <small className="font-mono text-xs text-(--color-faint) font-normal tracking-normal">
            {contractAddress}
          </small>
        </h1>
      </div>
      <div className="h-fit flex gap-2">
        <button
          onClick={copyToClipboard}
          className="w-fit h-fit bg-(--color-card) text-(--color-text) border border-(--color-border) text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:border-(--color-border2)"
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
    <div className="grid max-xs:grid-rows-3 min-[480px]:grid-cols-2 ml:grid-cols-3 bg-(--color-border) gap-px border border-(--color-border) rounded-lg overflow-hidden">
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2">
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
      <div className="bg-(--color-card) p-5 flex flex-col items-start gap-2">
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

function OverviewTransaction({
  transactions,
  contractAddress,
  contractAbi,
  threshold,
  connectedUserAddress,
}: {
  transactions: Transaction[] | undefined;
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  threshold: bigint;
  connectedUserAddress: Address | undefined;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[.06em] text-(--color-faint)">
          Needs your approval — {transactions?.length}
        </span>
        <button
          onClick={() => {
            router.push("./transactions");
          }}
          className="text-xs text-(--color-accent) font-semibold hover:cursor-pointer hover:underline"
        >
          View all
        </button>
      </div>
      {transactions?.length ? (
        <TransactionsSection
          connectedUserAddress={connectedUserAddress}
          contractAbi={contractAbi}
          contractAddress={contractAddress}
          threshold={threshold as bigint}
          transactions={transactions}
        />
      ) : (
        <div className="border border-dashed border-(--color-border2) rounded-lg p-8 text-center">
          <p className="text-sm font-semibold text-(--color-text) mb-1">
            You're all caught up
          </p>
          <p className="text-xs text-(--color-sub)">
            No transactions waiting for your approval.
          </p>
        </div>
      )}
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
              {owner.slice(0, 6) + "…" + owner.slice(-4)}
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
