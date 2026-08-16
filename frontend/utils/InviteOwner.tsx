import { Abi, Address, isAddress } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function InviteOwner({
  contractAddress,
  contractAbi,
  showInviteOwnerToast,
  setIsInviteOwner,
  owners,
  setIsLoading,
}: {
  contractAddress: Address | undefined;
  contractAbi: Abi | undefined;
  showInviteOwnerToast: (message: string) => void;
  setIsInviteOwner: Dispatch<SetStateAction<boolean>>;
  owners: Address[] | undefined;
  setIsLoading: (message: boolean) => void;
}) {
  const [address, setAddress] = useState<Address>();
  const [addressError, setAddressError] = useState("");

  const {
    writeContract,
    data: txHash,
    isPending,
    isSuccess: writeContractIsSuccess,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const validate = () => {
    let valid = true;
    console.log(owners);

    if (!isAddress(address as string)) {
      setAddressError("Enter a valid Ethereum address.");
      valid = false;
    } else if (owners?.find((add) => add === address)) {
      valid = false;
      setAddressError("Owner already invited");
    } else {
      setAddressError("");
    }

    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    writeContract({
      address: contractAddress!,
      abi: contractAbi!,
      functionName: "inviteOwner",
      args: [address],
    });
  };

  useEffect(() => {
    setIsLoading(isPending);
  }, [isPending]);

  useEffect(() => {
    if (writeContractIsSuccess) {
      showInviteOwnerToast("Owner Invited");
      setIsInviteOwner(false);
    }
  }, [writeContractIsSuccess]);

  return (
    <div className="h-screen w-full max-w-[960px] pt-6 pb-17.5 px-4.5 ml:pt-10 ml:pb-20 ml:px-12 flex justify-center">
      <div className="h-full w-fit flex flex-col items-start gap-6 ml:gap-9">
        <div className="flex flex-col items-start gap-2">
          <span className="text-[11px] text-(--color-faint) uppercase tracking-[.08em] font-semibold">
            new owner
          </span>
          <span className="text-[22px] ml:text-[28px] font-bold tracking-[-.02em] text-(--color-text)">
            Invite owner
          </span>
        </div>
        <div className="w-full bg-(--color-card) border border-(--color-border) rounded-lg p-6 max-w-[420px] flex flex-col items-start gap-5">
          <p className="text-[13px] text-(--color-sub)">
            They must call{" "}
            <span className="text-(--color-accent) font-bold">
              acceptInvitation()
            </span>{" "}
            before they can sign. The approval threshold updates automatically
            when they join.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full flex flex-col gap-4 items-start"
          >
            <div className="w-full flex flex-col items-start gap-1.5">
              <label
                className="text-[11.5px] font-semibold text-(--color-sub)"
                htmlFor="address"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value as Address)}
                disabled={isConfirming || isPending}
                className={`w-full bg-(--color-bg) border border-(--color-border) rounded-md px-3 py-2.5 text-(--color-text) font-mono text-[12.5px] ${addressError ? "outline-2 outline-(--color-red) outline-offset-2 border-(--color-red)" : "focus-visible:outline-2 focus-visible:outline-(--color-accent) focus-visible:outline-offset-2 focus-visible:border-(--color-accent)"} autofill:bg-(--color-bg) autofill:text-(--color-text)`}
              />

              {addressError && (
                <p className="text-[12px] font-medium text-(--color-red)">
                  {addressError}
                </p>
              )}
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
                    ? "Invitation Sent!"
                    : "Send Invitation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
