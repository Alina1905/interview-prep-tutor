"use client";

import { BADGES } from "../lib/gamification";

export default function BadgesModal({ gamificationData, onClose }) {
  const unlockedSet = new Set(gamificationData?.unlockedBadges || []);
  const unlockDates = gamificationData?.badgeUnlockDates || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Achievements & Badges
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Unlock performance badges as you complete drills and maintain practice consistency.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition text-sm"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const dateStr = unlockDates[badge.id]
              ? new Date(unlockDates[badge.id]).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-lg border transition flex items-start gap-3 ${
                  isUnlocked
                    ? "bg-zinc-800/80 border-zinc-700/80"
                    : "bg-zinc-950/40 border-zinc-800/60 opacity-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 font-bold ${
                    isUnlocked
                      ? "bg-zinc-700/80 text-zinc-100 border border-zinc-600/60"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-500"
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">{badge.title}</h4>
                    {isUnlocked ? (
                      <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        {dateStr || "Unlocked"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
