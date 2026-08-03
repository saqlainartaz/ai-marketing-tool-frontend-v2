"use client";

import { useRouter } from "next/navigation";
import { NeverScreen } from "@/components/onboarding/screens/NeverScreen";

export default function NeverPage() {
  const router = useRouter();
  return (
    <NeverScreen
      onNext={() => router.push("/onboarding/plan")}
      onBack={() => router.push("/onboarding/channels")}
    />
  );
}
