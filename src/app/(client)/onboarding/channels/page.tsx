"use client";

import { useRouter } from "next/navigation";
import { ChannelsScreen } from "@/components/onboarding/screens/ChannelsScreen";

export default function ChannelsPage() {
  const router = useRouter();
  return (
    <ChannelsScreen
      onNext={() => router.push("/onboarding/never")}
      onBack={() => router.push("/onboarding/obstacle")}
    />
  );
}
