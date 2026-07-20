import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LockSvg } from "./svgs";

export default function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div>
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="w-full g-fit flex items-center justify-center gap-2 px-4 py-2.5 bg-(--color-accent) text-[#fff] rounded-md text-sm font-semibold hover:cursor-pointer hover:opacity-[.9] dark:bg-(--color-accent)"
              >
                <LockSvg />
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                type="button"
                className="bg-(--color-card) txt-(--color-text) border border-(--color-border) hover:border-(--color-border2) hover:cursor-pointer rounded-md text-[13px] font-semibold px-4.5 py-2"
              >
                Disconnect
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
