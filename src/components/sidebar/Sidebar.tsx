"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBookOpen,
  FiChevronLeft,
  FiHeadphones,
  FiHelpCircle,
  FiHome,
  FiLogIn,
  FiSearch,
  FiSettings,
  FiStar,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logoutCurrentUser, normalizeAuthError } from "@/lib/auth";
import {
  logoutUser,
  setAuthError,
  setAuthLoading,
} from "@/redux/features/authSlice";
import { closeMobileSidebar, openAuthModal } from "@/redux/features/uiSlice";
import {
  selectCurrentUser,
  selectMobileSidebarOpen,
} from "@/redux/selectors";

const sidebarItems = [
  { label: "For you", href: "/for-you", icon: FiHome, disabled: false },
  { label: "Library", href: "/library", icon: FiBookOpen, disabled: false },
  { label: "Highlights", href: "#", icon: FiStar, disabled: true },
  { label: "Search", href: "#", icon: FiSearch, disabled: true },
  { label: "Settings", href: "/settings", icon: FiSettings, disabled: false },
  {
    label: "Help & Support",
    href: "#",
    icon: FiHelpCircle,
    disabled: true,
  },
];

const sidebarBrandByRoute = [
  { match: "/library", label: "Library", icon: FiBookOpen },
  { match: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const mobileSidebarOpen = useAppSelector(selectMobileSidebarOpen);
  const activeBrand =
    sidebarBrandByRoute.find((item) => pathname.startsWith(item.match)) ?? {
      label: "Summarist",
      icon: FiHeadphones,
    };
  const ActiveBrandIcon = activeBrand.icon;

  const handleAuthAction = async () => {
    if (!currentUser) {
      dispatch(openAuthModal("login"));
      return;
    }

    dispatch(setAuthLoading());

    try {
      await logoutCurrentUser();
      dispatch(logoutUser());
    } catch (error) {
      dispatch(setAuthError(normalizeAuthError(error)));
    }
  };

  const handleCloseSidebar = () => {
    dispatch(closeMobileSidebar());
  };

  return (
    <aside
      className={`sidebar ${mobileSidebarOpen ? "sidebar--open" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="sidebar__brand-row">
        <div className="sidebar__brand">
          <ActiveBrandIcon />
          <span>{activeBrand.label}</span>
        </div>

        <button
          type="button"
          className="sidebar__close"
          onClick={handleCloseSidebar}
          aria-label="Close sidebar"
        >
          <FiChevronLeft />
        </button>
      </div>

      <nav className="sidebar__nav">
        {sidebarItems.map(({ label, href, icon: Icon, disabled }) => {
          const isActive = !disabled && pathname === href;

          if (disabled) {
            return (
              <button
                key={label}
                type="button"
                className="sidebar__link sidebar__link--disabled"
                aria-disabled="true"
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={`sidebar__link ${
                isActive ? "sidebar__link--active" : ""
              }`}
              onClick={handleCloseSidebar}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="sidebar__auth"
        onClick={handleAuthAction}
      >
        <FiLogIn />
        <span>{currentUser ? "Logout" : "Login"}</span>
      </button>
    </aside>
  );
}
