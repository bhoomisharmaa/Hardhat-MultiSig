export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-px items-center">
        <div className="size-7 animate-spin rounded-full border-3 border-(--color-border) border-t-(--color-accent) mb-2" />
        <span className="text-xl font-bold">Loading Vault</span>
        <span className="text-[13.5px] text-(--color-sub)">
          Fetching data from the contract, hang on a moment.
        </span>
      </div>
    </div>
  );
}
