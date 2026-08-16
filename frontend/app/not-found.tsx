"use client";
import { ExclamationSVG } from "@/utils/svgs";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="h-screen w-screen bg-(--color-bg) flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-2 border border-(--color-border) rounded-lg text-(--color-faint)">
          <ExclamationSVG />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">Page not found</span>
          <span className="text-[13.5px] text-(--color-sub)">
            The page you're looking for doesn't exist or has been moved.
          </span>
        </div>
        <button
          onClick={() => {
            router.push("/");
          }}
          className="bg-(--color-accent) text-[#fff] text-[13px] font-semibold px-4 py-2 rounded-md hover:cursor-pointer hover:opacity-[.9]"
        >
          Go to overview
        </button>
      </div>
    </div>
  );
}
