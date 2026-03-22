"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import AuthModal from "@/components/shared/AuthModal";
import SearchBar from "@/components/shared/SearchBar";
import Sidebar from "@/components/sidebar/Sidebar";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { toggleMobileSidebar } from "@/redux/features/uiSlice";

type AppShellProps = {
  children: ReactNode;
};

const HIDE_APP_CHROME_ROUTES = ["/", "/choose-plan"];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const showAppChrome = !HIDE_APP_CHROME_ROUTES.includes(pathname);

  if (!showAppChrome) {
    return (
      <>
        {children}
        <AuthModal />
      </>
    );
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar />

        <div className="app-shell__main">
          <header className="app-shell__header">
            <button
              type="button"
              className="app-shell__menu-btn"
              onClick={() => dispatch(toggleMobileSidebar())}
              aria-label="Toggle navigation menu"
            >
              <FiMenu />
            </button>
            <SearchBar />
          </header>

          <div className="app-shell__content">{children}</div>
        </div>
      </div>

      <AuthModal />
    </>
  );
}
