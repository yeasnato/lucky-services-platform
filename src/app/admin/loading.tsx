export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] p-4 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
