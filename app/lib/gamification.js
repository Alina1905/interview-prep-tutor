"use client";

const GAMIFICATION_KEY = "interview-drill-gamification";

export const LEVELS = [
  { level: 1, minXp: 0, title: "Rookie Interviewee", icon: "🌱", color: "from-slate-400 to-slate-200" },
  { level: 2, minXp: 200, title: "Apprentice Communicator", icon: "⚡", color: "from-blue-400 to-cyan-300" },
  { level: 3, minXp: 500, title: "Prep Master", icon: "🔥", color: "from-amber-400 to-orange-500" },
  { level: 4, minXp: 1000, title: "Senior Contender", icon: "🛡️", color: "from-purple-400 to-indigo-400" },
  { level: 5, minXp: 1800, title: "Offer Magnet", icon: "🌟", color: "from-emerald-400 to-teal-300" },
  { level: 6, minXp: 3000, title: "Executive Tech Lead", icon: "👑", color: "from-yellow-300 to-amber-500" },
];

export const BADGES = [
  {
    id: "first_step",
    title: "First Step",
    description: "Complete your first practice question",
    icon: "🚀",
    category: "milestone",
  },
  {
    id: "hot_streak",
    title: "On Fire",
    description: "Maintain a 3-day practice streak",
    icon: "🔥",
    category: "streak",
  },
  {
    id: "star_master",
    title: "STAR Alignment",
    description: "Hit all 3 STAR criteria (Situation, Action, Result) in a behavioral answer",
    icon: "🌟",
    category: "skill",
  },
  {
    id: "bullseye",
    title: "Bullseye",
    description: "Score a perfect 10/10 on an answer",
    icon: "🎯",
    category: "performance",
  },
  {
    id: "speed_demon",
    title: "Pacing Pro",
    description: "Score 8+ while finishing within target time",
    icon: "⚡",
    category: "performance",
  },
  {
    id: "resume_matched",
    title: "Matchmaker",
    description: "Perform a Resume + Job Description match analysis",
    icon: "📄",
    category: "tool",
  },
  {
    id: "senior_slayer",
    title: "Senior Contender",
    description: "Finish a Senior difficulty session with average score 8+",
    icon: "🧠",
    category: "mastery",
  },
  {
    id: "interview_vet",
    title: "Veteran Drill Master",
    description: "Complete 5 or more full practice sessions",
    icon: "👑",
    category: "mastery",
  },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }

  const minForCurrent = current.minXp;
  const maxForCurrent = next ? next.minXp : current.minXp + 1500;
  const progressInLevel = xp - minForCurrent;
  const range = maxForCurrent - minForCurrent;
  const percentage = Math.min(100, Math.max(0, Math.round((progressInLevel / range) * 100)));

  return {
    currentLevel: current.level,
    title: current.title,
    icon: current.icon,
    color: current.color,
    xp,
    nextLevelXp: next ? next.minXp : maxForCurrent,
    progressPercentage: percentage,
    isMaxLevel: !next,
  };
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getGamificationData() {
  if (typeof window === "undefined") {
    return {
      xp: 0,
      streakDays: 1,
      lastPracticeDate: getTodayString(),
      unlockedBadges: [],
      badgeUnlockDates: {},
      sessionsCompleted: 0,
      questionsAnswered: 0,
      perfectScores: 0,
    };
  }

  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (!raw) {
      const initial = {
        xp: 0,
        streakDays: 1,
        lastPracticeDate: getTodayString(),
        unlockedBadges: [],
        badgeUnlockDates: {},
        sessionsCompleted: 0,
        questionsAnswered: 0,
        perfectScores: 0,
      };
      localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // Calculate streak maintenance
    if (parsed.lastPracticeDate !== today) {
      if (parsed.lastPracticeDate === yesterday) {
        // Streak continues, will update date on next action
      } else if (parsed.lastPracticeDate && parsed.lastPracticeDate < yesterday) {
        // Streak broken
        parsed.streakDays = 1;
      }
    }

    return parsed;
  } catch {
    return {
      xp: 0,
      streakDays: 1,
      lastPracticeDate: getTodayString(),
      unlockedBadges: [],
      badgeUnlockDates: {},
      sessionsCompleted: 0,
      questionsAnswered: 0,
      perfectScores: 0,
    };
  }
}

export function saveGamificationData(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save gamification data", err);
  }
}

export function recordAnswerSubmitted(result) {
  const data = getGamificationData();
  const today = getTodayString();

  // Streak update
  if (data.lastPracticeDate !== today) {
    if (data.lastPracticeDate === getYesterdayString()) {
      data.streakDays = (data.streakDays || 0) + 1;
    } else {
      data.streakDays = 1;
    }
    data.lastPracticeDate = today;
  }

  const prevLevel = getLevelInfo(data.xp).currentLevel;

  // Base XP
  let gainedXp = 40;

  // Score bonus
  if (result.score) {
    gainedXp += result.score * 8; // e.g. 8/10 => +64 XP
  }

  // STAR bonus
  const isStarMaster =
    result.star &&
    result.star.situationTask &&
    result.star.action &&
    result.star.result;
  if (isStarMaster) {
    gainedXp += 30;
  }

  // Timing bonus
  const isPacingPro =
    result.score >= 8 &&
    result.elapsedSeconds &&
    result.targetSeconds &&
    result.elapsedSeconds <= result.targetSeconds;
  if (isPacingPro) {
    gainedXp += 25;
  }

  data.xp += gainedXp;
  data.questionsAnswered = (data.questionsAnswered || 0) + 1;

  if (result.score === 10) {
    data.perfectScores = (data.perfectScores || 0) + 1;
  }

  // Badge checks
  const newlyUnlocked = [];

  function unlock(badgeId) {
    if (!data.unlockedBadges.includes(badgeId)) {
      data.unlockedBadges.push(badgeId);
      data.badgeUnlockDates[badgeId] = new Date().toISOString();
      const badgeObj = BADGES.find((b) => b.id === badgeId);
      if (badgeObj) newlyUnlocked.push(badgeObj);
    }
  }

  // Check badges
  unlock("first_step");

  if (data.streakDays >= 3) {
    unlock("hot_streak");
  }

  if (isStarMaster) {
    unlock("star_master");
  }

  if (result.score === 10) {
    unlock("bullseye");
  }

  if (isPacingPro) {
    unlock("speed_demon");
  }

  saveGamificationData(data);

  const newLevelInfo = getLevelInfo(data.xp);
  const leveledUp = newLevelInfo.currentLevel > prevLevel;

  return {
    data,
    gainedXp,
    leveledUp,
    newLevelInfo,
    newlyUnlocked,
  };
}

export function recordSessionFinished(sessionRecord) {
  const data = getGamificationData();
  const prevLevel = getLevelInfo(data.xp).currentLevel;

  let gainedXp = 100; // Completion bonus

  if (sessionRecord.avgScore >= 8) {
    gainedXp += 50;
  }

  data.xp += gainedXp;
  data.sessionsCompleted = (data.sessionsCompleted || 0) + 1;

  const newlyUnlocked = [];
  function unlock(badgeId) {
    if (!data.unlockedBadges.includes(badgeId)) {
      data.unlockedBadges.push(badgeId);
      data.badgeUnlockDates[badgeId] = new Date().toISOString();
      const badgeObj = BADGES.find((b) => b.id === badgeId);
      if (badgeObj) newlyUnlocked.push(badgeObj);
    }
  }

  if (data.sessionsCompleted >= 5) {
    unlock("interview_vet");
  }

  if (sessionRecord.difficulty === "senior" && sessionRecord.avgScore >= 8) {
    unlock("senior_slayer");
  }

  saveGamificationData(data);

  const newLevelInfo = getLevelInfo(data.xp);
  const leveledUp = newLevelInfo.currentLevel > prevLevel;

  return {
    data,
    gainedXp,
    leveledUp,
    newLevelInfo,
    newlyUnlocked,
  };
}

export function recordResumeMatched() {
  const data = getGamificationData();
  const prevLevel = getLevelInfo(data.xp).currentLevel;

  let gainedXp = 60;
  data.xp += gainedXp;

  const newlyUnlocked = [];
  if (!data.unlockedBadges.includes("resume_matched")) {
    data.unlockedBadges.push("resume_matched");
    data.badgeUnlockDates["resume_matched"] = new Date().toISOString();
    const badgeObj = BADGES.find((b) => b.id === "resume_matched");
    if (badgeObj) newlyUnlocked.push(badgeObj);
  }

  saveGamificationData(data);

  const newLevelInfo = getLevelInfo(data.xp);
  const leveledUp = newLevelInfo.currentLevel > prevLevel;

  return {
    data,
    gainedXp,
    leveledUp,
    newLevelInfo,
    newlyUnlocked,
  };
}
