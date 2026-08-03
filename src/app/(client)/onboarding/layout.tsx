import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="mx-auto w-full max-w-md">{children}</div>
    </OnboardingProvider>
  );
}
