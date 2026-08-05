import { EntryDoor } from "@/components/entry/EntryDoor";

/**
 * The gate people land on when a session has gone. Same door as `/`, but
 * it resumes setup rather than dropping straight into the week's work.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return <EntryDoor destination="/onboarding" reason={reason} />;
}
