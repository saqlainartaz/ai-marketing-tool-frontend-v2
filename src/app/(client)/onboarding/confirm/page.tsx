"use client";

import { useRouter } from "next/navigation";
import { ConfirmScreen } from "@/components/onboarding/screens/ConfirmScreen";

export default function ConfirmPage() {
  const router = useRouter();
  return <ConfirmScreen onNext={() => router.push("/onboarding/goal")} />;
}
