"use client";

import { useRouter } from "next/navigation";
import { PlanScreen } from "@/components/onboarding/screens/PlanScreen";

export default function PlanPage() {
  const router = useRouter();
  return <PlanScreen onNext={() => router.push("/today")} />;
}
