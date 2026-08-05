import { redirect } from "next/navigation";
import { getClientId } from "@/lib/auth/session";
import { EntryDoor } from "@/components/entry/EntryDoor";

/**
 * The front door. This used to be a placeholder reading "M1A shell · not
 * the product yet", with no link into the app at all — so the root URL,
 * the only address anyone is ever given, looked broken.
 *
 * Someone already signed in skips it entirely.
 */
export default async function Home() {
  if (await getClientId()) redirect("/today");
  return <EntryDoor destination="/today" />;
}
