import { Abi, Address, formatEther, isAddress, parseEther } from "viem";
import {
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function ProposeTransaction({
  contractAddress,
  contractAbi,
  showCreateTransactionToast,
  setIsProposeTransaction,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  showCreateTransactionToast: (message: string) => void;
  setIsProposeTransaction: Dispatch<SetStateAction<boolean>>;
}) {
  const [recipient, setRecipient] = useState<Address>();
  const [amount, setAmount] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");

  const {
    writeContract,
    data: txHash,
    isPending,
    isSuccess: writeContractIsSuccess,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: contractBalance } = useBalance({
    address: contractAddress,
    blockTag: "latest",
  });

  const getContractBalanceInETH = () => {
    return parseFloat(formatEther(contractBalance?.value ?? BigInt(0))).toFixed(
      3,
    );
  };

  const validate = () => {
    let valid = true;

    if (!isAddress(recipient as string)) {
      setRecipientError("Enter a valid Ethereum address.");
      valid = false;
    } else {
      setRecipientError("");
    }

    if (!amount || parseFloat(amount) <= 0) {
      setAmountError("Enter an amoutn greater than zero.");
      valid = false;
    } else if (parseFloat(amount) > parseFloat(getContractBalanceInETH())) {
      setAmountError("Amount exceeds vault balance.");
      valid = false;
    } else {
      setAmountError("");
    }

    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    writeContract({
      address: contractAddress!,
      abi: contractAbi!,
      functionName: "createTransaction",
      args: [parseEther(amount), recipient],
    });
  };

  useEffect(() => {
    if (writeContractIsSuccess) {
      showCreateTransactionToast("Transaction proposed");
      setIsProposeTransaction(false);
    }
  }, [writeContractIsSuccess]);

  return (
    <div className="h-screen w-full max-w-[960px] pt-10 pb-20 px-12">
      <div className="h-full w-full flex flex-col items-start gap-9">
        <div className="flex flex-col items-start gap-2">
          <span className="text-[11px] text-(--color-faint) uppercase tracking-[.08em] font-semibold">
            new
          </span>
          <span className="text-[28px] font-bold tracking-[-.02em] text-(--color-text)">
            Propose Transaction
          </span>
        </div>
        <div className="w-full bg-(--color-card) border border-(--color-border) rounded-lg p-6 max-w-[420px] flex flex-col items-start gap-5">
          <p className="text-[13px] text-(--color-sub)">
            Your approval is counted automatically. Needs{" "}
            <span className="text-(--color-accent) font-bold">1 of 3</span>{" "}
            approvals to execute.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full flex flex-col gap-4 items-start"
          >
            <div className="w-full flex flex-col items-start gap-1.5">
              <label
                className="text-[11.5px] font-semibold text-(--color-sub)"
                htmlFor="recipient"
              >
                Recipient
              </label>
              <input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value as Address)}
                disabled={isConfirming || isPending}
                className={`w-full bg-(--color-bg) border border-(--color-border) rounded-md px-3 py-2.5 text-(--color-text) font-mono text-[12.5px] ${recipientError ? "outline-2 outline-(--color-red) outline-offset-2 border-(--color-red)" : "focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2 focus-visible:border-(--color-accent)"} autofill:bg-(--color-bg) autofill:text-(--color-text)`}
              />
              {recipientError && (
                <p className="text-[12px] font-medium text-(--color-red)">
                  {recipientError}
                </p>
              )}
            </div>
            <div className="w-full flex flex-col items-start gap-1.5">
              <label
                className="text-[11.5px] font-semibold text-(--color-sub)"
                htmlFor="amount"
              >
                Amount (ETH)
              </label>
              <input
                id="amount"
                type="text"
                placeholder="0.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isConfirming || isPending}
                className={`w-full bg-(--color-bg) border border-(--color-border) rounded-md px-3 py-2.5 text-(--color-text) font-mono text-[12.5px] ${amountError ? "outline-2 outline-(--color-red) outline-offset-2 border-(--color-red)" : "focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2 focus-visible:border-(--color-accent)"} autofill:bg-(--color-bg) autofill:text-(--color-text)`}
              />
              {amountError && (
                <p className="text-[12px] font-medium text-(--color-red)">
                  {amountError}
                </p>
              )}
              <span className="text-xs text-(--color-faint)">
                Available: {getContractBalanceInETH()} ETH
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isConfirming || isPending}
              className="w-full bg-(--color-accent) text-[13px] text-[#fff] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9] disabled:cursor-not-allowed"
            >
              {isPending
                ? "Waiting for wallet..."
                : isConfirming
                  ? "Confirming..."
                  : isSuccess
                    ? "Proposed!"
                    : "Propose"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
