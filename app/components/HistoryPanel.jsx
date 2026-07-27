"use client";

import { useState } from "react";
import QuestionResultCard from "./QuestionResultCard";

export default function HistoryPanel({ history, title = "Past sessions" }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!history || history.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-300 mb-3">{title}</h2>
      <div className="space-y-2">
        {history.map((h, i) => {
          const isOpen = openIndex === i;
          const hasDetail = Array.isArray(h.results) && h.results.length > 0;
          return (
            <div key={i} className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-sm px-4 py-3 text-left hover:bg-slate-800/40 transition"
              >
                <div>
                  <p className="text-slate-200">{h.jobDescription || "Untitled session"}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(h.date).toLocaleDateString()} · {h.questionCount} questions
                    {h.difficulty && ` · ${h.difficulty}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-indigo-400">{h.avgScore}/10</span>
                  {hasDetail && (
                    <span className="text-slate-500 text-xs">{isOpen ? "hide" : "view details"}</span>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-3">
                  {hasDetail ? (
                    h.results.map((r, ri) => <QuestionResultCard key={ri} result={r} index={ri} />)
                  ) : (
                    <p className="text-xs text-slate-500">
                      Full question-by-question detail wasn't saved for this session.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
