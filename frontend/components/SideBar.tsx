"use client";

import {
  HomeSVG,
  PeopleSVG,
  SandwhichSVG,
  SettingsSVG,
  TransactionSVG,
} from "@/utils/svgs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggleButton from "./ThemeToggleButton";

const navButtons = [
  { label: "Overview", path: "/", icon: <HomeSVG /> },
  { label: "Transactions", path: "/transactions", icon: <TransactionSVG /> },
  { label: "Owners", path: "/owners", icon: <PeopleSVG /> },
  { label: "Settings", path: "/settings", icon: <SettingsSVG /> },
];

function NavItems({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <nav className="w-full flex flex-col gap-px">
      {navButtons.map((item) => {
        const isActive = pathName === item.path;
        return (
          <button
            key={item.path}
            onClick={() => {
              router.push(item.path);
              onNavigate();
            }}
            className={`w-full flex flex-row gap-2.5 items-center px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors hover:cursor-pointer
              ${
                isActive
                  ? "bg-(--color-accent-bg) text-(--color-accent) font-semibold"
                  : "text-(--color-sub) hover:text-(--color-text) hover:bg-(--color-bg)"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function SideBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="ml:hidden flex items-center justify-between px-4 py-3 bg-(--color-surface) border-b border-(--color-border) sticky top-0 z-20">
        <p className="text-[15px] font-bold text-(--color-text)">Cosign</p>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-[34px] h-[34px] flex items-center justify-center border border-(--color-border) rounded-md text-(--color-sub) hover:border-(--color-border2)"
            aria-label="Open menu"
          >
            <SandwhichSVG />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/35 z-30 ml:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-40 w-[220px]
          bg-(--color-surface) border-r border-(--color-border)
          px-4 py-5 flex flex-col gap-6
          transition-transform duration-200 ease-in-out
          ml:sticky ml:top-0 ml:h-screen ml:translate-x-0 ml:z-auto ml:flex-shrink-0
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="w-full flex flex-row justify-between items-center">
          <p className="text-[15px] font-bold text-(--color-text)">Cosign</p>
          <ThemeToggleButton />
        </div>

        <NavItems onNavigate={() => setDrawerOpen(false)} />
      </aside>
    </>
  );
}
