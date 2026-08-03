import { redirect } from "next/navigation";
import { getClientId } from "@/lib/auth/session";
import { ClientSessionProvider } from "@/components/auth/ClientSession";

/**
 * The client-app gate: every route in this group requires a verified
 * magic-link session. No session → /login. Client components receive only
 * the verified clientId, never the token.
 */
export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = await getClientId();
  if (!clientId) redirect("/login");
  return (
    <ClientSessionProvider clientId={clientId}>
      {children}
    </ClientSessionProvider>
  );
}
