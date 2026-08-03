import { AppShell } from "@/components/nav/AppShell";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
