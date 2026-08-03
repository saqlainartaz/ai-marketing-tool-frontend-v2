import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight lg:text-5xl">
        Your marketing, prepared for you.
      </h1>
      <p className="text-sm text-ink-2">
        We know your business, we draft in your voice, and nothing goes out
        without your yes.
      </p>
      <ThemeSwitcher />
      <p className="text-xs text-ink-3">M1A shell · not the product yet</p>
    </main>
  );
}
