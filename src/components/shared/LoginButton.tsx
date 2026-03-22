"use client";

import type { ReactNode } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { openAuthModal } from "@/redux/features/uiSlice";
import type { AuthMode } from "@/types/auth";

type LoginButtonProps = {
  children: ReactNode;
  className?: string;
  mode?: AuthMode;
  redirectTo?: string | null;
};

export default function LoginButton({
  children,
  className,
  mode = "login",
  redirectTo = null,
}: LoginButtonProps) {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      className={className}
      onClick={() => dispatch(openAuthModal({ mode, redirectTo }))}
    >
      {children}
    </button>
  );
}
