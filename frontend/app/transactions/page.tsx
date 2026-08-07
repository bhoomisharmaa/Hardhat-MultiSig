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
  const chainId = useChainId({ config });
  const contractConfig = chainId ? wagmiContractConfig(chainId) : undefined;
  const [isProposeTransaction, setIsProposeTransaction] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>();
  const {
    toasts: createTransactionToast,
    showToast: showCreateTransactionToast,
  } = useToast();

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
          <div className="h-full w-full max-w-[960px] pt-10 pb-20 px-12">
            <div className="flex flex-col gap-10">
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
    <div className="flex items-end justify-between">
      <div className="flex flex-col items-start gap-1">
        <div className="text-[11px] text-(--color-faint) uppercase tracking-[.08rem] font-semibold">
          Ledger
        </div>
        <h1 className="text-[28px] text-(--color-text) font-bold tracking-tight">
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

function TransactionsSection({
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
  const { writeContract, isSuccess } = useWriteContract();

  const approveTransaction = async (txnIndex: bigint) => {
    writeContract({
      address: contractAddress!,
      abi: contractAbi!,
      functionName: "approveTransaction",
      args: [txnIndex],
    });
  };

  const disapproveTransaction = async (txnIndex: bigint) => {
    writeContract({
      address: contractAddress!,
      abi: contractAbi!,
      functionName: "disapproveTransaction",
      args: [txnIndex],
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="block border border-(--color-border) rounded-lg bg-(--color-card) overflow-hidden">
        {transactions?.map((txn, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col px-4.5 py-4 ${index != 0 ? "border-t border-(--color-border)" : ""}`}
            >
              <div className="border-b border-(--color-border) pb-3 flex flex-col gap-3">
                <div className="flex items-start justify-between flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-(--color-sub) text-[12.5px]">
                      → {txn[1].slice(0, 6) + "…" + txn[1].slice(-4)}
                    </span>
                    <span className="text-[20px] text-(--color-text) font-bold tracking-[-.02em]">
                      {parseFloat(formatEther(txn[2])).toFixed(3)}
                      <small className="text-xs text-(--color-sub) font-normal ml-1">
                        ETH
                      </small>
                    </span>
                  </div>
                  <span
                    className={`${txn[7] ? "bg-(--color-accent-bg) text-(--color-accent)" : "bg-(--color-warn-bg) text-(--color-warn)"} text-[11.5px] font-semibold py-[3px] px-[9px] rounded-sm`}
                  >
                    {txn[7] ? "Ready" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  {txn[7] ? (
                    <div className="h-[22px] w-[22px] bg-(--color-accent) text-[#fff] text-[10px] font-bold rounded-sm flex items-center justify-center">
                      ✓
                    </div>
                  ) : (
                    <div className="h-[22px] w-[22px] bg-(--color-bg) text-(--color-faint) text-[10px] font-bold rounded-sm border border-(--color-border) flex items-center justify-center">
                      {txn[5]}
                    </div>
                  )}
                  <span className="text-xs text-(--color-sub)">
                    <span className="text-(--color-text) font-bold">
                      {txn[5] + " "}
                    </span>
                    of {`${!txn[7] ? threshold : txn[4]}`}
                  </span>
                </div>
                {!txn[7] &&
                  (txn[6].find((address) => address == connectedUserAddress) ? (
                    <button
                      onClick={() => disapproveTransaction(txn[3])}
                      className="text-xs font-semibold px-3 py-1.5 rounded-[5px]  border border-[#0000] text-(--color-warn) bg-(--color-warn-bg) hover:border-(--color-warn) hover:cursor-pointer"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => approveTransaction(txn[3])}
                      className="text-xs font-semibold px-3 py-1.5 rounded-[5px]  border border-[#0000] text-(--color-go) bg-(--color-go-bg) hover:border-(--color-go) hover:cursor-pointer"
                    >
                      Approve
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
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
