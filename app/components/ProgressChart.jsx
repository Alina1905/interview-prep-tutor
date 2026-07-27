"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ProgressChart({ history }) {
  if (!history || history.length < 2) return null;

  // history is newest-first; chart should read oldest -> newest left to right
  const data = [...history]
    .reverse()
    .map((h, i) => ({
      index: i + 1,
      score: h.avgScore,
      label: new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-slate-300 mb-3">Your progress</h2>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#64748b"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value) => [`${value}/10`, "Readiness score"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#818cf8"
              strokeWidth={2}
              dot={{ r: 3, fill: "#818cf8" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
