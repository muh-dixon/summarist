import { Suspense } from "react";
import ChoosePlanContent from "@/components/shared/ChoosePlanContent";

export default function ChoosePlanPage() {
  return (
    <Suspense fallback={<main className="choose-plan-page" />}>
      <ChoosePlanContent />
    </Suspense>
  );
}
