import { Suspense } from "react";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <OnboardingProvider>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </OnboardingProvider>
    </Suspense>
  );
}
