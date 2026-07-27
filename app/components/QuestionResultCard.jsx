"use client";

import { useState } from "react";
import StarChecklist from "./StarChecklist";
import SkillRadarChart from "./SkillRadarChart";

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function QuestionResultCard({ result, index }) {
  const [showRadar, setShowRadar] = useState(false);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-100">
          {Number.isFinite(index) ? `Q${index + 1}. ` : ""}
          {result.question}
        </p>
        <span className="text-base font-bold font-mono shrink-0 text-zinc-100">{result.score}/10</span>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div>
          {result.type && <span className="uppercase tracking-wide">{result.type}</span>}
          {Number.isFinite(result.elapsedSeconds) && (
            <span> · {formatTime(result.elapsedSeconds)}</span>
          )}
        </div>

        {result.skills && (
          <button
            onClick={() => setShowRadar(!showRadar)}
            className="text-xs text-zinc-300 hover:text-white font-mono flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 transition"
          >
            {showRadar ? "Hide Radar" : "Skill Breakdown"}
          </button>
        )}
      </div>

      {result.answer && (
        <p className="text-xs text-zinc-400 italic bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
          "{result.answer}"
        </p>
      )}

      {showRadar && result.skills && (
        <div className="py-2">
          <SkillRadarChart skills={result.skills} title="Question Skill Breakdown" height={220} />
        </div>
      )}

      {result.type === "behavioral" && result.star && <StarChecklist star={result.star} />}

      {result.feedback && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-0.5">Feedback</h4>
          <p className="text-xs text-zinc-200 leading-relaxed">{result.feedback}</p>
        </div>
      )}

      {result.suggestion && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-0.5">Suggestion</h4>
          <p className="text-xs text-zinc-200 leading-relaxed">{result.suggestion}</p>
        </div>
      )}

      {result.redFlags && result.redFlags.length > 0 && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 mb-0.5">Red flags</h4>
          <ul className="list-disc list-inside text-xs text-red-300 space-y-0.5 font-mono">
            {result.redFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {result.followUp && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-300 italic">Follow-up: "{result.followUp.question}"</p>
          <p className="text-xs text-zinc-400 mt-1">
            Follow-up score: {result.followUp.score}/10 — {result.followUp.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
