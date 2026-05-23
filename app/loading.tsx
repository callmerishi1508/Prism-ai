export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_50%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)] animate-pulse">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 w-1/2 rounded-full animate-[ping_1.5s_infinte]" />
        </div>
      </div>
    </div>
  );
}
