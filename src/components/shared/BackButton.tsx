"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

type BackButtonProps = {
  label?: string;
  fallbackHref?: string;
  className?: string;
  useHistory?: boolean;
};

export default function BackButton({
  label = "Back",
  fallbackHref = "/for-you",
  className = "",
  useHistory = true,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (useHistory && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      onClick={handleBack}
    >
      <FiArrowLeft />
      <span>{label}</span>
    </button>
  );
}
