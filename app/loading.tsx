export default function Loading() {
  return (
    <div className="page py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton mt-4 h-10 w-2/3 max-w-xl rounded-lg" />
      <div className="skeleton mt-3 h-4 w-1/2 max-w-md rounded" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="rounded-2xl border border-ink-900/5 bg-white p-3">
            <div className="skeleton aspect-[4/3] rounded-xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-2 h-3 w-full rounded" />
            <div className="skeleton mt-1.5 h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
