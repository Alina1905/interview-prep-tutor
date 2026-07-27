"use client";

import { useEffect, useRef, useState } from "react";

// Wraps the browser's native SpeechRecognition API.
// Chrome/Edge support it; Safari/Firefox mostly don't, so we detect and fall back gracefully.
export default function VoiceButton({ onTranscript }) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <span className="text-xs text-slate-500 italic">
        Voice input isn't supported in this browser — try Chrome or Edge, or just type your answer.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition
        ${listening
          ? "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse"
          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30"}`}
    >
      <span className={`w-2 h-2 rounded-full ${listening ? "bg-red-400" : "bg-indigo-400"}`} />
      {listening ? "Stop recording" : "Speak your answer"}
    </button>
  );
}
