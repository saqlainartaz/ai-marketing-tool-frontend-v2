/**
 * A skeleton rather than a spinner: it holds the page's real shape, so
 * content lands where the eye is already looking instead of shifting it.
 * The live region tells screen-reader users the same thing the shimmer
 * tells sighted ones.
 */
export default function Loading() {
  return (
    <div className="animate-pulse" data-testid="page-skeleton">
      <span role="status" className="sr-only">
        Loading
      </span>
      <div className="h-3 w-24 rounded bg-paper" />
      <div className="mt-3 h-8 w-52 rounded bg-paper" />
      <div className="mt-8 space-y-3">
        <div className="h-56 rounded-xl border border-line bg-card" />
        <div className="h-12 rounded-lg bg-paper" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-11 rounded-lg bg-paper" />
          <div className="h-11 rounded-lg bg-paper" />
        </div>
      </div>
    </div>
  );
}
