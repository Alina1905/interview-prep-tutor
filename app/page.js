"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import VoiceButton from "./components/VoiceButton";
import ProgressChart from "./components/ProgressChart";
import HistoryPanel from "./components/HistoryPanel";
import QuestionResultCard from "./components/QuestionResultCard";
import StarChecklist from "./components/StarChecklist";
import SkillRadarChart from "./components/SkillRadarChart";
import GamificationHeader from "./components/GamificationHeader";
import BadgesModal from "./components/BadgesModal";
import ResumeJdMatcher from "./components/ResumeJdMatcher";
import InterviewerPersonaSelector, { PERSONAS } from "./components/InterviewerPersonaSelector";
import ReverseQaTrainer from "./components/ReverseQaTrainer";
import CodeSandbox from "./components/CodeSandbox";
import WebcamRecorder from "./components/WebcamRecorder";
import Logo from "./components/Logo";
import { COMPANY_PACKS } from "./data/companyPacks";
import { downloadSessionPdf } from "./lib/pdfReport";
import { analyzeSpeech } from "./lib/speechAnalytics";
import {
  getGamificationData,
  recordAnswerSubmitted,
  recordSessionFinished,
} from "./lib/gamification";

const HISTORY_KEY = "interview-drill-history";
const HISTORY_THRESHOLD = 3;

const DIFFICULTIES = [
  { value: "junior", label: "Junior / Entry-level" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior / Lead" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("drill"); // "drill" | "company" | "reverse_qa" | "code" | "resume"
  const [stage, setStage] = useState("input");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("mid");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [enableWebcam, setEnableWebcam] = useState(false);
  const timerRef = useRef(null);

  // Gamification state
  const [gamificationData, setGamificationData] = useState(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [rewardNotice, setRewardNotice] = useState(null);

  // Follow-up state
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
    setGamificationData(getGamificationData());
  }, []);

  // Timer
  useEffect(() => {
    if (stage !== "practice") return;
    const hasResult = !!results[currentIndex];
    if (hasResult) {
      clearInterval(timerRef.current);
      return;
    }
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, stage, results.length]);

  function handleGamificationReward(reward) {
    if (!reward) return;
    setGamificationData(reward.data);

    if (reward.leveledUp) {
      setRewardNotice({
        message: `Level Up! Reached Level ${reward.newLevelInfo.currentLevel}: ${reward.newLevelInfo.title}`,
      });
      setTimeout(() => setRewardNotice(null), 5000);
    } else if (reward.newlyUnlocked && reward.newlyUnlocked.length > 0) {
      const badge = reward.newlyUnlocked[0];
      setRewardNotice({
        message: `Badge Unlocked: ${badge.title}`,
      });
      setTimeout(() => setRewardNotice(null), 5000);
    }
  }

  function speak(text) {
    if (!speakEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = selectedPersona.rate || 1;
    utter.pitch = selectedPersona.pitch || 1;
    window.speechSynthesis.speak(utter);
  }

  function handleSelectCompanyPack(pack) {
    setQuestions(pack.questions);
    setResults([]);
    setCurrentIndex(0);
    setAnswer("");
    setFollowUpAnswer("");
    setStage("practice");
    speak(pack.questions[0].question);
  }

  async function handleGenerateQuestions(e) {
    if (e) e.preventDefault();
    setError("");
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions.");
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned. Try adding more details to the job description.");
      }
      setQuestions(data.questions);
      setResults([]);
      setCurrentIndex(0);
      setAnswer("");
      setFollowUpAnswer("");
      setStage("practice");
      speak(data.questions[0].question);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError("Type or speak an answer before submitting.");
      return;
    }
    setError("");
    setLoadingFeedback(true);
    clearInterval(timerRef.current);
    const finalElapsed = elapsedSeconds;

    const vocalStats = analyzeSpeech(answer, finalElapsed);

    try {
      const current = questions[currentIndex];
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          question: current.question,
          answer,
          difficulty,
          questionType: current.type,
          elapsedSeconds: finalElapsed,
          targetSeconds: current.targetSeconds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate answer.");

      const entry = {
        question: current.question,
        type: current.type,
        answer,
        score: data.score,
        skills: data.skills,
        vocalStats,
        feedback: data.feedback,
        suggestion: data.suggestion,
        redFlags: data.redFlags || [],
        star: data.star || null,
        elapsedSeconds: finalElapsed,
        targetSeconds: current.targetSeconds,
        followUpQuestion: data.followUpQuestion || null,
        followUp: null,
      };
      setResults((prev) => [...prev, entry]);

      const reward = recordAnswerSubmitted(entry);
      handleGamificationReward(reward);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function handleSubmitFollowUp() {
    if (!followUpAnswer.trim()) {
      setError("Type or speak an answer to the follow-up before submitting.");
      return;
    }
    setError("");
    setLoadingFollowUp(true);
    try {
      const current = results[currentIndex];
      const res = await fetch("/api/evaluate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          question: current.question,
          answer: current.answer,
          followUpQuestion: current.followUpQuestion,
          followUpAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate follow-up.");

      setResults((prev) =>
        prev.map((r, i) =>
          i === currentIndex
            ? {
                ...r,
                followUp: {
                  question: current.followUpQuestion,
                  answer: followUpAnswer,
                  score: data.score,
                  feedback: data.feedback,
                },
              }
            : r
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFollowUp(false);
    }
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    setAnswer("");
    setFollowUpAnswer("");
    setError("");
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      speak(questions[nextIndex].question);
    } else {
      finishSession();
    }
  }

  function finishSession() {
    const avgScore =
      results.reduce((sum, r) => sum + (r.score || 0), 0) / (results.length || 1);
    const sorted = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));

    const sessionRecord = {
      date: new Date().toISOString(),
      jobDescription: jobDescription.slice(0, 200),
      difficulty,
      avgScore: Math.round(avgScore * 10) / 10,
      questionCount: results.length,
      strongest: sorted[0]?.question || null,
      weakest: sorted[sorted.length - 1]?.question || null,
      results,
    };

    const updatedHistory = [sessionRecord, ...history].slice(0, 20);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    const reward = recordSessionFinished(sessionRecord);
    handleGamificationReward(reward);
    setStage("summary");
  }

  function startOver() {
    setStage("input");
    setJobDescription("");
    setQuestions([]);
    setResults([]);
    setCurrentIndex(0);
    setAnswer("");
    setFollowUpAnswer("");
    setError("");
  }

  const currentResult = results[currentIndex];
  const liveVocalStats = analyzeSpeech(answer, elapsedSeconds);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <GamificationHeader
        gamificationData={gamificationData}
        onOpenBadges={() => setShowBadgesModal(true)}
      />

      <AnimatePresence>
        {rewardNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono flex items-center justify-between"
          >
            <span>{rewardNotice.message}</span>
            <span className="text-zinc-400 text-[10px]">Achievement Unlocked</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs Header */}
      {stage === "input" && (
        <div className="flex border-b border-zinc-800 mb-8 gap-1 overflow-x-auto">
          {[
            { id: "drill", label: "Drill Setup" },
            { id: "company", label: "Company Packs" },
            { id: "reverse_qa", label: "Reverse Q&A" },
            { id: "code", label: "Code Sandbox" },
            { id: "resume", label: "Resume Matcher" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition border-b-2 shrink-0 ${
                activeTab === tab.id
                  ? "border-zinc-200 text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {stage === "input" && activeTab === "drill" && <BrandHeader />}
      {stage !== "input" && (
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Interview Prep Drill</h1>
            <p className="text-zinc-400 text-xs mt-1">
              Active Persona: <span className="text-zinc-200 font-medium">{selectedPersona.name}</span> ({selectedPersona.title})
            </p>
          </div>
          {stage === "practice" && (
            <button
              onClick={startOver}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition border border-zinc-700"
            >
              Exit Drill
            </button>
          )}
        </header>
      )}

      {error && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* DRILL SETUP TAB */}
      {stage === "input" && activeTab === "drill" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ProgressChart history={history} />

          <div className="mb-6">
            <InterviewerPersonaSelector
              selectedPersona={selectedPersona}
              onSelectPersona={setSelectedPersona}
            />
          </div>

          <JobInputForm
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onSubmit={handleGenerateQuestions}
            loading={loadingQuestions}
          />
        </motion.div>
      )}

      {/* COMPANY PACKS TAB */}
      {stage === "input" && activeTab === "company" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <h2 className="text-base font-semibold text-zinc-100">Company Drill Packs</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Curated interview tracks tailored to specific company bars (Amazon, Google, Meta, Startups).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPANY_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">{pack.name}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {pack.company}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{pack.description}</p>
                </div>

                <button
                  onClick={() => handleSelectCompanyPack(pack)}
                  className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-xs font-semibold uppercase tracking-wider transition"
                >
                  Start {pack.company} Drill →
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* REVERSE QA TAB */}
      {stage === "input" && activeTab === "reverse_qa" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ReverseQaTrainer />
        </motion.div>
      )}

      {/* CODE SANDBOX TAB */}
      {stage === "input" && activeTab === "code" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <CodeSandbox />
        </motion.div>
      )}

      {/* RESUME MATCHER TAB */}
      {stage === "input" && activeTab === "resume" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ResumeJdMatcher
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onStartDrillWithJd={() => setActiveTab("drill")}
            onGamificationUpdate={handleGamificationReward}
          />
        </motion.div>
      )}

      {/* PRACTICE STAGE */}
      {stage === "practice" && questions.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setEnableWebcam(!enableWebcam)}
              className="text-xs font-mono text-zinc-400 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 transition"
            >
              {enableWebcam ? "Hide Webcam Feed" : "Enable Webcam Video HUD"}
            </button>
          </div>

          {enableWebcam && (
            <div className="mb-6">
              <WebcamRecorder />
            </div>
          )}

          <PracticeStage
            questions={questions}
            currentIndex={currentIndex}
            answer={answer}
            setAnswer={setAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onNext={handleNext}
            loadingFeedback={loadingFeedback}
            currentResult={currentResult}
            speakEnabled={speakEnabled}
            setSpeakEnabled={setSpeakEnabled}
            elapsedSeconds={elapsedSeconds}
            liveVocalStats={liveVocalStats}
            followUpAnswer={followUpAnswer}
            setFollowUpAnswer={setFollowUpAnswer}
            onSubmitFollowUp={handleSubmitFollowUp}
            loadingFollowUp={loadingFollowUp}
          />
        </motion.div>
      )}

      {/* SUMMARY STAGE */}
      {stage === "summary" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SessionSummary
            results={results}
            onStartOver={startOver}
            difficulty={difficulty}
            jobDescription={jobDescription}
            history={history}
          />
        </motion.div>
      )}

      {stage === "input" && history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <HistoryPanel history={history} />
        </div>
      )}

      {showBadgesModal && (
        <BadgesModal
          gamificationData={gamificationData}
          onClose={() => setShowBadgesModal(false)}
        />
      )}
    </main>
  );
}

function BrandHeader() {
  return (
    <header className="mb-8 flex items-center gap-4">
      <Logo size={42} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Interview Prep Voice Drill
        </h1>
        <p className="text-zinc-400 text-xs mt-0.5">
          Practice interview questions out loud with speech analytics, AI voice personas, company packs, and resume match scoring.
        </p>
      </div>
    </header>
  );
}

function JobInputForm({ jobDescription, setJobDescription, difficulty, setDifficulty, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
          Target Seniority
        </label>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition ${
                difficulty === d.value
                  ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
        Job description (or target requirements)
      </label>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={7}
        placeholder="Paste full job posting or bullet points here..."
        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider transition"
      >
        {loading ? "Generating questions..." : "Generate Interview Questions"}
      </button>
    </form>
  );
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PracticeStage({
  questions,
  currentIndex,
  answer,
  setAnswer,
  onSubmitAnswer,
  onNext,
  loadingFeedback,
  currentResult,
  speakEnabled,
  setSpeakEnabled,
  elapsedSeconds,
  liveVocalStats,
  followUpAnswer,
  setFollowUpAnswer,
  onSubmitFollowUp,
  loadingFollowUp,
}) {
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const overTarget = !currentResult && elapsedSeconds > current.targetSeconds;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-300">
          Question {currentIndex + 1} of {questions.length}
          <span className="mx-2 text-zinc-700">·</span>
          <span className="uppercase tracking-wider font-mono text-zinc-400">{current.type}</span>
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={speakEnabled}
            onChange={(e) => setSpeakEnabled(e.target.checked)}
            className="accent-zinc-400 rounded"
          />
          Read questions aloud
        </label>
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <p className="text-base font-medium text-zinc-100 leading-snug">{current.question}</p>
      </div>

      {!currentResult && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 font-mono">
          <div className="flex items-center gap-2">
            <span className={overTarget ? "text-amber-400 font-semibold" : "text-zinc-300"}>
              Time: {formatTime(elapsedSeconds)}
            </span>
            <span className="text-zinc-500">/ target ~{formatTime(current.targetSeconds)}</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div>
              Cadence: <span className="text-zinc-200 font-semibold">{liveVocalStats.wpm} WPM</span>
            </div>
            <div>
              Fillers: <span className={liveVocalStats.fillerCount > 2 ? "text-amber-400" : "text-zinc-200"}>{liveVocalStats.fillerCount}</span>
            </div>
          </div>
        </div>
      )}

      {!currentResult && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <VoiceButton onTranscript={(t) => setAnswer((prev) => (prev + " " + t).trim())} />
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            placeholder="Type your answer, or use voice input..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={onSubmitAnswer}
            disabled={loadingFeedback}
            className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider transition"
          >
            {loadingFeedback ? "Analyzing Response..." : "Submit Answer for Feedback"}
          </button>
        </div>
      )}

      {currentResult && (
        <FeedbackCard
          result={currentResult}
          onNext={onNext}
          isLast={isLast}
          followUpAnswer={followUpAnswer}
          setFollowUpAnswer={setFollowUpAnswer}
          onSubmitFollowUp={onSubmitFollowUp}
          loadingFollowUp={loadingFollowUp}
        />
      )}
    </div>
  );
}

function FeedbackCard({ result, onNext, isLast, followUpAnswer, setFollowUpAnswer, onSubmitFollowUp, loadingFollowUp }) {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono text-zinc-100">{result.score}</span>
          <span className="text-zinc-500 text-xs">/ 10</span>
        </div>

        {result.vocalStats && (
          <div className="flex items-center gap-3 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400">
            <span>{result.vocalStats.wpm} WPM</span>
            <span>·</span>
            <span className={result.vocalStats.fillerCount > 0 ? "text-amber-400" : "text-zinc-200"}>
              {result.vocalStats.fillerCount} Fillers
            </span>
          </div>
        )}
      </div>

      {result.skills && (
        <SkillRadarChart skills={result.skills} title="Skill Breakdown" height={220} />
      )}

      {result.type === "behavioral" && <StarChecklist star={result.star} />}

      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Feedback</h3>
        <p className="text-xs text-zinc-200 leading-relaxed">{result.feedback}</p>
      </div>

      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Suggestion</h3>
        <p className="text-xs text-zinc-200 leading-relaxed">{result.suggestion}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-semibold uppercase tracking-wider transition"
      >
        {isLast ? "Complete Session & View Summary" : "Next Question →"}
      </button>
    </div>
  );
}

function SessionSummary({ results, onStartOver, difficulty, jobDescription, history }) {
  const avg = results.reduce((sum, r) => sum + (r.score || 0), 0) / (results.length || 1);
  const showProgress = history.length >= HISTORY_THRESHOLD;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8 text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
          Readiness Score
        </p>
        <p className="text-5xl font-extrabold font-mono text-zinc-100">
          {avg.toFixed(1)}
          <span className="text-xl text-zinc-500">/10</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartOver}
          className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold uppercase tracking-wider transition"
        >
          Start New Practice Session
        </button>
        <button
          onClick={() => downloadSessionPdf({ results, difficulty, jobDescription })}
          className="px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold uppercase tracking-wider transition"
        >
          Download PDF Summary Report
        </button>
      </div>

      {showProgress && (
        <div className="mt-10 pt-8 border-t border-zinc-800 space-y-6">
          <ProgressChart history={history} />
          <HistoryPanel history={history} title="Session History" />
        </div>
      )}
    </div>
  );
}
