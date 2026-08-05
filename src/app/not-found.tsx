import Link from "next/link";
import { Compass } from "lucide-react";
import { StateScreen } from "@/components/system/StateScreen";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <StateScreen
        icon={Compass}
        title="This page doesn't exist."
        body="The link may be old. Your work is all on Today."
        action={
          <Link
            href="/today"
            className="inline-flex items-center justify-center rounded-lg bg-clay px-5 py-3 t-body font-semibold text-onact transition-[filter] hover:brightness-110"
          >
            Go to Today
          </Link>
        }
      />
    </div>
  );
}
