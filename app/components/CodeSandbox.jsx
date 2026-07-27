"use client";

import { useState } from "react";
import { buildApiPath, readJsonResponse } from "../lib/fetchJson";

const SAMPLE_PROBLEMS = [
  {
    title: "Reverse a Linked List",
    language: "javascript",
    problem: "Write a function `reverseList(head)` that reverses a singly linked list and returns the new head.",
    starterCode: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    let nextTemp = current.next;
    current.next = prev;
    prev = current;
    current = nextTemp;
  }
  
  return prev;
}`,
  },
  {
    title: "Two Sum Problem",
    language: "python",
    problem: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
  },
];

export default function CodeSandbox() {
  const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(SAMPLE_PROBLEMS[0].starterCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleSelectProblem(p) {
    setSelectedProblem(p);
    setLanguage(p.language);
    setCode(p.starterCode);
    setResult(null);
  }

  async function handleEvaluate() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const endpoint = buildApiPath("/api/evaluate-code");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          problemStatement: selectedProblem.problem,
        }),
      });

      const data = await readJsonResponse(res, endpoint);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="text-base font-semibold text-zinc-100">Live Code Sandbox & AI Evaluator</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Write technical code solutions, evaluate Big-O time and space complexity, and receive AI code analysis.
        </p>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SAMPLE_PROBLEMS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelectProblem(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedProblem.title === p.title
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-zinc-100">{selectedProblem.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedProblem.problem}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-md px-2 py-1 font-mono focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full font-mono text-xs rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-zinc-200 focus:outline-none focus:border-zinc-600 leading-relaxed"
        />

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider transition"
        >
          {loading ? "Analyzing Complexity..." : "Run & Evaluate Code Solution"}
        </button>
      </div>

      {result && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-zinc-100">{result.score}</span>
              <span className="text-xs text-zinc-500">/ 10 Score</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono">
                Time: {result.timeComplexity}
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono">
                Space: {result.spaceComplexity}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Correctness</h4>
            <p className="text-xs text-zinc-200 mt-1">{result.correctness}</p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Code Analysis</h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{result.feedback}</p>
          </div>

          {result.optimizations && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400">Optimizations</h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{result.optimizations}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
