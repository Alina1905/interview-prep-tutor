"use client";

import { useEffect, useRef, useState } from "react";

export default function WebcamRecorder({ onRecordingComplete }) {
  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startCamera() {
    setError("");
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Webcam access not supported in this browser.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setActive(true);
    } catch (err) {
      setError(err.message || "Failed to access camera.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setActive(false);
    setRecording(false);
  }

  function toggleRecording() {
    if (!recording) {
      chunksRef.current = [];
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          if (onRecordingComplete) onRecordingComplete(blob);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setRecording(true);
      } catch (err) {
        setError("Recording error: " + err.message);
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Webcam Practice Feed
        </h4>

        {!active ? (
          <button
            onClick={startCamera}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
          >
            Enable Camera
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                recording
                  ? "bg-red-950 border-red-800 text-red-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {recording ? "Stop Recording" : "Record Video"}
            </button>
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs transition"
            >
              Disable
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50 font-mono">{error}</p>
      )}

      {active && (
        <div className="relative rounded-lg overflow-hidden bg-zinc-950 aspect-video border border-zinc-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          <div className="absolute top-3 left-3 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 text-[11px] font-mono text-zinc-300">
            Camera Active
          </div>

          <div className="absolute bottom-3 right-3 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 text-[11px] font-mono text-zinc-300">
            Presence: <span className="text-zinc-100 font-bold">94%</span>
          </div>
        </div>
      )}
    </div>
  );
}
