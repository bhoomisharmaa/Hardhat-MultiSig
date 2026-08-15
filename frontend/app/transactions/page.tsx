"use client";
import SideBar from "@/components/SideBar";
import { wagmiContractConfig } from "@/utils/contractConfig";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWatchBlockNumber,
  useWriteContract,
} from "wagmi";
import { config } from "@/utils/wagmiConfig";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ProposeTransaction from "@/utils/ProposeTransaction";
import { useToast } from "@/utils/hooks/useToast";
import { Abi, Address, formatEther } from "viem";
import { writeContract } from "viem/actions";
import { TransactionSVG } from "@/utils/svgs";
import { useRouter } from "next/navigation";
import TransactionsSection from "@/utils/TransactionsSection";
import Loading from "@/components/Loading";
import SkelBar from "@/utils/SkelBar";

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

export default function Transaction() {
  const { address: connectedUserAddress } = useAccount();
  const router = useRouter();
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;
  const [isProposeTransaction, setIsProposeTransaction] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>();
  const {
    toasts: createTransactionToast,
    showToast: showCreateTransactionToast,
  } = useToast();

  const {
    data: ownerStatus,
    refetch: refetchOwnerStatus,
    isLoading: isLoadingOwnerStatus,
  } = useReadContract({
    ...contractConfig,
    functionName: "getOwnerStatus",
    args: [connectedUserAddress],
    chainId,
    query: { enabled: !!connectedUserAddress },
  });

  const {
    data: threshold,
    refetch: refetchThreshold,
    isLoading: isLoadingThreshold,
  } = useReadContract({
    ...contractConfig,
    functionName: "getApprovalThreshold",
    chainId,
  });

  const {
    data: transactionCount,
    refetch: refetchTransactionCount,
    isLoading: isLoadingTransactionCount,
  } = useReadContract({
    ...contractConfig,
    functionName: "getTransactionCount",
    chainId,
  });

  const {
    data: rawTransactions,
    refetch: refetchRawTransactions,
    isLoading: isLoadingRawTransactions,
  } = useReadContracts({
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

  useEffect(() => {
    const tempTransactions = rawTransactions?.map((tx) => {
      return tx.result as Transaction;
    });

    setTransactions(tempTransactions);
  }, [rawTransactions]);

  const refetchData = () => {
    refetchOwnerStatus();
    refetchRawTransactions();
    refetchThreshold();
    refetchTransactionCount();
  };

  useEffect(() => {
    refetchData();
  }, [connectedUserAddress, contractConfig, chainId]);

  useEffect(() => {
    if ((!isLoadingOwnerStatus && ownerStatus !== 2) || !connectedUserAddress) {
      router.push("/auth");
    }
  }, [connectedUserAddress, ownerStatus]);

  useWatchBlockNumber({
    onBlockNumber() {
      refetchData();
    },
  });
  if (!contractConfig || isLoadingOwnerStatus) {
    return <Loading />;
  }

  return (
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
        <div className="h-screen w-full max-w-[960px] pt-6 pb-17.5 px-4.5 ml:pt-10 ml:pb-20 ml:px-12">
          <div className="flex flex-col gap-7 ml:gap-10">
            <TransactionHeader
              setIsProposeTransaction={setIsProposeTransaction}
              transactionCount={transactionCount as bigint}
            />
            {isLoadingOwnerStatus ||
            isLoadingRawTransactions ||
            isLoadingThreshold ||
            isLoadingTransactionCount ? (
              <TransactionLoading />
            ) : transactionCount ? (
              <TransactionsSection
                connectedUserAddress={connectedUserAddress}
                contractAbi={contractConfig?.abi}
                contractAddress={contractConfig?.address}
                threshold={threshold as bigint}
                transactions={transactions}
              />
            ) : (
              <NoTransactionsSection
                setIsProposeTransaction={setIsProposeTransaction}
              />
            )}
          </div>
        </div>
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
  );
}

function TransactionHeader({
  setIsProposeTransaction,
  transactionCount,
}: {
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
  transactionCount: bigint;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row items-start sm:items-end sm:justify-between">
      <div className="flex flex-col items-start gap-1">
        <div className="text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
          Ledger
        </div>
        <h1 className="text-[22px] ml:text-[28px] text-(--color-text) font-bold tracking-tight">
          Transactions
        </h1>
      </div>
      {transactionCount ? (
        <button
          onClick={() => {
            setIsProposeTransaction(true);
          }}
          className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]"
        >
          Propose Transaction
        </button>
      ) : (
        ""
      )}
    </div>
  );
}

function NoTransactionsSection({
  setIsProposeTransaction,
}: {
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="max-w-[720px] py-10 px-6 text-center border border-(--color-border2) border-dashed rounded-lg flex flex-col items-center">
      <div className="p-2.5 border border-(--color-border) rounded-lg text-(--color-faint) mb-3">
        <TransactionSVG />
      </div>
      <span className="text-[14px] font-semibold text-(--color-text)">
        No transactions yet
      </span>
      <span className="text-[12.5px] text-(--color-sub) mb-3.5">
        Propose a transaction to get started.
      </span>
      <button
        onClick={() => {
          setIsProposeTransaction(true);
        }}
        className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]"
      >
        Propose Transaction
      </button>
    </div>
  );
}

function TransactionLoading() {
  return (
    <div className="border border-(--color-border) rounded-lg overflow-hidden bg-(--color-card) font-mono text-[14px]">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex flex-col gap-3 px-[18px] py-4 ${i > 0 ? "border-t border-(--color-border)" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <SkelBar className="w-[88px] h-[11px]" />
              <SkelBar className="w-16 h-[19px]" />
            </div>
            <SkelBar className="w-[58px] h-5 rounded" />
          </div>
          <div className="flex gap-3 items-center xs:justify-between pt-3 border-t border-(--color-border)">
            <div className="flex gap-1">
              <div className="w-[22px] h-[22px] rounded bg-(--color-bg) border border-(--color-border)" />
              <div className="w-[22px] h-[22px] rounded bg-(--color-bg) border border-(--color-border)" />
            </div>
            <SkelBar className="w-[46px] h-[11px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
