import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="w-full">{children}</div>
    </OnboardingProvider>
  );
}
