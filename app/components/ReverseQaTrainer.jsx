"use client";

import { useState } from "react";
import VoiceButton from "./VoiceButton";
import { readJsonResponse } from "../lib/fetchJson";

const SCENARIOS = [
  {
    id: "interviewer_qa",
    title: "Questions for the Interviewer",
    prompt: "The interviewer says: 'We have about 5 minutes left. What questions do you have for me about the team, tech stack, or engineering culture?'",
    placeholder: "Draft or speak 2-3 thoughtful questions that demonstrate business context and engineering curiosity...",
  },
  {
    id: "salary_negotiation",
    title: "Salary Expectations & Counter-Offer",
    prompt: "The recruiter asks: 'What are your target compensation expectations for this role? We want to make sure we're aligned before advancing.'",
    placeholder: "Practice anchoring your value without giving away a rigid low number too early...",
  },
];

export default function ReverseQaTrainer() {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleEvaluate() {
    if (!answer.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: "Senior Software Engineer / Product Practice",
          question: selectedScenario.prompt,
          answer,
          difficulty: "senior",
          questionType: "technical",
        }),
      });
      const data = await readJsonResponse(res);
      setFeedback(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="text-base font-semibold text-zinc-100">Reverse Q&A & Compensation Trainer</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Practice asking strategic questions and answering salary inquiries with confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedScenario(s);
              setAnswer("");
              setFeedback(null);
            }}
            className={`p-3.5 rounded-lg border text-left transition space-y-1 ${
              selectedScenario.id === s.id
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-semibold text-zinc-200">{s.title}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Simulation Prompt
        </div>
        <p className="text-sm font-medium text-zinc-200 italic">"{selectedScenario.prompt}"</p>

        <div className="space-y-3">
          <VoiceButton onTranscript={(t) => setAnswer((prev) => (prev + " " + t).trim())} />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder={selectedScenario.placeholder}
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={handleEvaluate}
            disabled={loading || !answer.trim()}
            className="px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider transition"
          >
            {loading ? "Evaluating Pitch..." : "Evaluate Pitch & Strategy"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 animate-fadeIn">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">{feedback.score}</span>
            <span className="text-xs text-zinc-500">/ 10 Score</span>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Feedback</h4>
            <p className="text-xs text-zinc-200 mt-1">{feedback.feedback}</p>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Recommendation</h4>
            <p className="text-xs text-zinc-200 mt-1">{feedback.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
