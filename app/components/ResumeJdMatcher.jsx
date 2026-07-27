"use client";

import { useState } from "react";
import { recordResumeMatched } from "../lib/gamification";
import { readJsonResponse } from "../lib/fetchJson";

export default function ResumeJdMatcher({ jobDescription, setJobDescription, onStartDrillWithJd, onGamificationUpdate }) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [localJd, setLocalJd] = useState(jobDescription || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchResult, setMatchResult] = useState(null);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (file.type === "application/json" || file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.onload = (event) => {
        setResumeText(event.target?.result || "");
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, " ");
          setResumeText(printable.slice(0, 5000));
        }
      };
      reader.readAsText(file);
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste or upload your resume first.");
      return;
    }
    if (!localJd.trim()) {
      setError("Please enter a job description to compare against.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/match-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: localJd,
        }),
      });

      const data = await readJsonResponse(res);

      setMatchResult(data);
      if (setJobDescription) setJobDescription(localJd);

      const reward = recordResumeMatched();
      if (onGamificationUpdate) {
        onGamificationUpdate(reward);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUseJdInDrill() {
    if (setJobDescription) setJobDescription(localJd);
    if (onStartDrillWithJd) onStartDrillWithJd();
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
        <h2 className="text-base font-semibold text-zinc-100">Resume & Job Description Matcher</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Upload your resume and target job posting to analyze compatibility, skill gaps, and strategic interview tips.
        </p>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Resume Input */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              1. Resume / CV Content
            </label>
            {fileName && (
              <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[150px]">
                {fileName}
              </span>
            )}
          </div>

          <div className="relative border border-dashed border-zinc-700/80 hover:border-zinc-500 rounded-lg p-3.5 transition bg-zinc-950/50 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-1 py-1">
              <p className="text-xs font-medium text-zinc-300">
                Click or drop resume file here
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">.txt, .pdf, .md, .docx</p>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={7}
            placeholder="Or paste resume text here..."
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
          />
        </div>

        {/* JD Input */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
            2. Target Job Description
          </label>
          <textarea
            value={localJd}
            onChange={(e) => setLocalJd(e.target.value)}
            rows={10}
            placeholder="Paste job posting or requirements here..."
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider transition"
          >
            {loading ? "Analyzing Match..." : "Analyze Match & Gaps"}
          </button>
        </div>
      </form>

      {/* Match Scorecard */}
      {matchResult && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <span className="text-2xl font-bold font-mono text-zinc-100">
                  {matchResult.matchPercentage}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  {matchResult.matchPercentage >= 80
                    ? "Strong Fit"
                    : matchResult.matchPercentage >= 60
                    ? "Moderate Match"
                    : "Alignment Needed"}
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1.5">JD Compatibility</h3>
                <p className="text-xs text-zinc-400 mt-0.5 max-w-md">{matchResult.summary}</p>
              </div>
            </div>

            <button
              onClick={handleUseJdInDrill}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              Start Drill with this JD →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Matching Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Missing Requirements / Gaps
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-800">
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Candidate Strengths
              </h4>
              <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                {matchResult.strengths?.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                Interview Strategy Tips
              </h4>
              <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                {matchResult.interviewTips?.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
