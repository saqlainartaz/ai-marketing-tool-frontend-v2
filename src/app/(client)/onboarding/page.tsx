import { redirect } from "next/navigation";

export default async function OnboardingIndex({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  redirect(c ? `/onboarding/confirm?c=${encodeURIComponent(c)}` : "/onboarding/confirm");
}
