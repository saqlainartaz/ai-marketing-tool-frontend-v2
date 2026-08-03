"use client";

import { createContext, useContext } from "react";

/**
 * The verified client id, resolved server-side from the httpOnly cookie by
 * the (client) layout and passed down. Client components never see the
 * token — only the id.
 */
const ClientSessionContext = createContext<string | null>(null);

export function ClientSessionProvider({
  clientId,
  children,
}: {
  clientId: string;
  children: React.ReactNode;
}) {
  return (
    <ClientSessionContext.Provider value={clientId}>
      {children}
    </ClientSessionContext.Provider>
  );
}

export function useClientId(): string {
  const id = useContext(ClientSessionContext);
  if (!id)
    throw new Error("useClientId must be used inside ClientSessionProvider");
  return id;
}
