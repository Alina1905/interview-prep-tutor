"use client";

export default function StarChecklist({ star }) {
  if (!star) return null;
  const items = [
    { key: "situationTask", label: "Situation / Task" },
    { key: "action", label: "Action" },
    { key: "result", label: "Result" },
  ];
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">STAR structure</h3>
      <div className="flex gap-2 flex-wrap">
        {items.map((item) => {
          const covered = !!star[item.key];
          return (
            <span
              key={item.key}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border
                ${covered
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-500"}`}
            >
              {covered ? "✓" : "—"} {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
