export default function TechnicianLoading() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] p-4 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg border border-[#D8DADC] bg-white" />
        ))}
      </div>
    </div>
  );
}
