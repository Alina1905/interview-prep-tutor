"use client";

const FILLER_PATTERNS = [
  { word: "um", regex: /\bum\b/gi },
  { word: "uh", regex: /\buh\b/gi },
  { word: "like", regex: /\blike\b/gi },
  { word: "you know", regex: /\byou know\b/gi },
  { word: "basically", regex: /\bbasically\b/gi },
  { word: "actually", regex: /\bactually\b/gi },
  { word: "honestly", regex: /\bhonestly\b/gi },
  { word: "so...", regex: /\bso\b/gi },
  { word: "i mean", regex: /\bi mean\b/gi },
  { word: "sort of", regex: /\bsort of\b/gi },
  { word: "kind of", regex: /\bkind of\b/gi },
];

export function analyzeSpeech(text, elapsedSeconds) {
  if (!text || typeof text !== "string") {
    return {
      wordCount: 0,
      wpm: 0,
      pacingStatus: "No Speech Detected",
      pacingColor: "text-slate-400",
      fillerCount: 0,
      fillerBreakdown: [],
    };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const validSeconds = Math.max(5, elapsedSeconds || 15);
  const minutes = validSeconds / 60;
  const wpm = Math.round(wordCount / minutes);

  let pacingStatus = "Ideal / Confident";
  let pacingColor = "text-emerald-400";

  if (wpm < 100) {
    pacingStatus = "Slow / Hesitant";
    pacingColor = "text-amber-400";
  } else if (wpm > 165) {
    pacingStatus = "Fast / Rushed";
    pacingColor = "text-red-400";
  }

  let totalFillers = 0;
  const fillerBreakdown = [];

  for (const item of FILLER_PATTERNS) {
    const matches = cleanText.match(item.regex);
    if (matches && matches.length > 0) {
      totalFillers += matches.length;
      fillerBreakdown.push({ word: item.word, count: matches.length });
    }
  }

  return {
    wordCount,
    wpm,
    pacingStatus,
    pacingColor,
    fillerCount: totalFillers,
    fillerBreakdown,
  };
}
