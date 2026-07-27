"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

export default function SkillRadarChart({ skills, title = "Skill Breakdown", height = 240 }) {
  if (!skills) return null;

  const data = [
    { subject: "Communication", score: skills.communication ?? 7, fullMark: 10 },
    { subject: "Technical", score: skills.technical ?? 7, fullMark: 10 },
    { subject: "Structure", score: skills.structure ?? 7, fullMark: 10 },
    { subject: "Specificity", score: skills.specificity ?? 7, fullMark: 10 },
    { subject: "Problem Solving", score: skills.problemSolving ?? 7, fullMark: 10 },
  ];

  return (
    <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-4">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {title}
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">Scale: 0–10</span>
        </div>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#3f3f46" tick={{ fontSize: 9, fill: "#71717a" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#fafafa",
              }}
              formatter={(val) => [`${val} / 10`, "Score"]}
            />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#d4d4d8"
              fill="#e4e4e7"
              fillOpacity={0.18}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
