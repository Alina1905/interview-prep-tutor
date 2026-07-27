"use client";

import { useState } from "react";
import { BADGES, getLevelInfo } from "../lib/gamification";
import BadgesModal from "./BadgesModal";

export default function GamificationHeader({ gamificationData, onOpenBadges }) {
  const [showModal, setShowModal] = useState(false);

  if (!gamificationData) return null;

  const levelInfo = getLevelInfo(gamificationData.xp || 0);
  const unlockedCount = gamificationData.unlockedBadges?.length || 0;

  function handleOpen() {
    if (onOpenBadges) {
      onOpenBadges();
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <div className="mb-6 rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Level & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xl font-bold text-zinc-100">
                {levelInfo.currentLevel}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60">
                    Level {levelInfo.currentLevel}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-100">{levelInfo.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {levelInfo.isMaxLevel ? "Max Level" : `${levelInfo.xp} / ${levelInfo.nextLevelXp} XP`}
                </p>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-200">
              <span className="text-sm font-mono text-amber-400 font-bold">{gamificationData.streakDays || 1}d</span>
              <span className="text-[11px] text-zinc-400">Streak</span>
            </div>
          </div>

          {/* XP Progress Bar & Badges Trigger */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:w-44">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                <span>XP Progress</span>
                <span>{levelInfo.progressPercentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50">
                <div
                  className="h-full rounded-full bg-zinc-200 transition-all duration-300 ease-out"
                  style={{ width: `${levelInfo.progressPercentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-200 text-xs font-medium transition"
            >
              <span>Badges</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[11px]">
                {unlockedCount}/{BADGES.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <BadgesModal
          gamificationData={gamificationData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
