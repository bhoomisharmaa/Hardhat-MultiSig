import contractAddress from "./constants/contractAddresses.json";
import abi from "./constants/abi.json";
import type { Abi, Address } from "viem";

export const wagmiContractConfig = (chainId: number) => {
  return {
    address: contractAddress[
      chainId.toString() as keyof typeof contractAddress
    ] as Address,
    abi: abi as Abi,
  };
};
