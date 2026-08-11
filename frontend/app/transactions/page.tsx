"use client";
import SideBar from "@/components/SideBar";
import { wagmiContractConfig } from "@/utils/contractConfig";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
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

  useEffect(() => {
    const tempTransactions = rawTransactions?.map((tx) => {
      return tx.result as Transaction;
    });

    setTransactions(tempTransactions);
    console.log(tempTransactions);
  }, [rawTransactions]);

  useEffect(() => {
    refetchRawTransactions();
  }, [contractConfig, chainId]);

  useEffect(() => {
    if (!connectedUserAddress || ownerStatus != 2) {
      router.replace("/auth");
    }
  }, [connectedUserAddress]);

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
            {transactionCount ? (
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
    <div className="flex flex-col gap-1 sm:flex-row items-start sm:justify-between">
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
