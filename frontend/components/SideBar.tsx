"use client";

import { HomeSVG, PeopleSVG, SettingsSVG, TransactionSVG } from "@/utils/svgs";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggleButton from "./ThemeToggleButton";

export default function SideBar() {
  const router = useRouter();

  const navButtons = [
    { label: "Overview", path: "/", icon: <HomeSVG /> },
    { label: "Transactions", path: "/transactions", icon: <TransactionSVG /> },
    { label: "Owners", path: "/owners", icon: <PeopleSVG /> },
    { label: "Settings", path: "/settings", icon: <SettingsSVG /> },
  ];

  return (
    <div className="h-screen w-[220px] sticky top-0 overscroll-y-auto flex flex-col gap-6 items-start bg-(--color-surface) border-r border-(--color-border) px-4 py-5 dark:bg-(--color-surface) dark:border(--color-border)">
      <div className="h-fit w-full flex flex-row justify-between">
        <p className="text-base font-bold text-(--color-text) dark:text-(--color-text)">
          Cosign
        </p>
        <ThemeToggleButton />
      </div>
      <nav className="w-full h-fit flex flex-col">
        {navButtons.map((item, index) => {
          const pathName = usePathname();
          const isActive = pathName == item.path;
          return (
            <button
              className={`w-full flex flex-row gap-2.5 items-center px-2.5 py-2 rounded-md text-sm font-medium hover:cursor-pointer ${isActive ? "bg-(--color-accent-bg) text-(--color-accent) font-semibold dark:bg-(--color-accent-bg) dark:text-(--color-accent)" : "text-(--color-sub) hover:text-(--color-text) hover:bg-(--color-bg) dark:text-(--color-sub) dark:hover:text-(--color-text) dark:hover:bg-(--color-bg)"}`}
              key={index}
              onClick={() => {
                router.push(item.path);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto w-full h-fit border border-(--color-border) rounded-lg p-3 flex flex-col dark:border-(--color-border)">
        <div className="text-[11px] text-(--color-faint) font-semibold tracking-wider mb-[6px] dark:text-(--color-faint)">
          THRESHOLD
        </div>
        <div className="w-full h-fit text-xl font-bold text-(--color-accent) dark:text-(--color-accent) tracking-wide">
          1/3{" "}
          <span className="text-xs text-(--color-sub) font-normal dark:text-(--color-sub) ml-px">
            keys to execute
          </span>
        </div>
        <div className="w-full h-fit flex gap-1.5 items-center mt-2 pt-2.5 border-t border-(--color-border) border-(--color-border)">
          <div className="w-2 h-2 bg-(--color-go) rounded-[50%] dark:bg-(--color-go)" />
          <div className="font-mono text-xs text-(--color-faint) dark:text-(--color-faint)">
            0x4e21…91fa
          </div>
        </div>
      </div>
    </div>
  );
}
