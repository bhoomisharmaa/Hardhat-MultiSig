import { useEffect } from "react";
import { Abi, Address, formatEther } from "viem";
import { useWriteContract } from "wagmi";

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

export default function TransactionsSection({
  transactions,
  contractAddress,
  contractAbi,
  threshold,
  connectedUserAddress,
  setIsLoading,
}: {
  transactions: Transaction[] | undefined;
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  threshold: bigint;
  connectedUserAddress: Address | undefined;
  setIsLoading: (message: boolean) => void;
}) {
  const { writeContract, isSuccess, isPending } = useWriteContract();

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

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending]);

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
              <div className="flex flex-col gap-3 items-start xs:flex-row xs:items-center xs:justify-between pt-4">
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
                      className="w-fit text-xs font-semibold px-3 py-1.5 rounded-[5px]  border border-[#0000] text-(--color-warn) bg-(--color-warn-bg) hover:border-(--color-warn) hover:cursor-pointer"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => approveTransaction(txn[3])}
                      className="w-fit text-xs font-semibold px-3 py-1.5 rounded-[5px]  border border-[#0000] text-(--color-go) bg-(--color-go-bg) hover:border-(--color-go) hover:cursor-pointer"
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
