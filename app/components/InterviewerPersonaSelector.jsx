"use client";

export const PERSONAS = [
  {
    id: "recruiter_sarah",
    name: "Recruiter Sarah",
    title: "HR Specialist",
    description: "Encouraging tone focusing on culture fit and communication.",
    rate: 0.95,
    pitch: 1.1,
  },
  {
    id: "tech_david",
    name: "Tech Lead David",
    title: "Senior Engineering Lead",
    description: "Direct tone probing technical depth, edge cases, and tradeoffs.",
    rate: 1.05,
    pitch: 0.9,
  },
  {
    id: "architect_elena",
    name: "Architect Elena",
    title: "System Architect",
    description: "Strategic tone focusing on system design and high-level decisions.",
    rate: 1.0,
    pitch: 1.0,
  },
];

export default function InterviewerPersonaSelector({ selectedPersona, onSelectPersona }) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
        Interviewer Persona
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PERSONAS.map((p) => {
          const isSelected = selectedPersona?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPersona(p)}
              className={`p-3.5 rounded-lg border transition text-left space-y-1 ${
                isSelected
                  ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">{p.name}</h4>
                <span className="text-[10px] text-zinc-400 font-mono block">{p.title}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight pt-1">{p.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
