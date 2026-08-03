"use client";

import { useRouter } from "next/navigation";
import { GoalScreen } from "@/components/onboarding/screens/GoalScreen";

export default function GoalPage() {
  const router = useRouter();
  return (
    <GoalScreen
      onNext={() => router.push("/onboarding/obstacle")}
      onBack={() => router.push("/onboarding/confirm")}
    />
  );
}
