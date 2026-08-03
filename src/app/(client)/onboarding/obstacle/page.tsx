"use client";

import { useRouter } from "next/navigation";
import { ObstacleScreen } from "@/components/onboarding/screens/ObstacleScreen";

export default function ObstaclePage() {
  const router = useRouter();
  return (
    <ObstacleScreen
      onNext={() => router.push("/onboarding/channels")}
      onBack={() => router.push("/onboarding/goal")}
    />
  );
}
