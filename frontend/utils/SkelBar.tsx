export default function SkelBar({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-(--color-border) rounded animate-pulse ${className}`} />
  );
}
