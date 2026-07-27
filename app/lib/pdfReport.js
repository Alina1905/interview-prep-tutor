import jsPDF from "jspdf";

const MARGIN = 14;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_HEIGHT = 297;

export function downloadSessionPdf({ results, difficulty, jobDescription }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const avg =
    results.reduce((sum, r) => sum + (r.score || 0), 0) / (results.length || 1);

  function ensureSpace(lines = 1, lineHeight = 5) {
    if (y + lines * lineHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function addWrappedText(text, fontSize, color = [30, 41, 59], lineHeight = 5) {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    ensureSpace(lines.length, lineHeight);
    doc.text(lines, MARGIN, y);
    y += lines.length * lineHeight;
  }

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("Interview Prep Session Report", MARGIN, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleDateString()} · Level: ${difficulty}`, MARGIN, y);
  y += 6;

  if (jobDescription) {
    addWrappedText(
      `Role context: ${jobDescription.slice(0, 300)}${jobDescription.length > 300 ? "..." : ""}`,
      9,
      [100, 116, 139],
      4.2
    );
    y += 2;
  }

  // Overall score
  y += 4;
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(`Overall readiness score: ${avg.toFixed(1)} / 10`, MARGIN, y);
  y += 10;

  // Per-question breakdown
  results.forEach((r, i) => {
    ensureSpace(3, 6);
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;

    addWrappedText(`Q${i + 1}. ${r.question}`, 11, [30, 41, 59], 5);
    addWrappedText(
      `Type: ${r.type || "n/a"}   Score: ${r.score}/10   Time: ${
        Number.isFinite(r.elapsedSeconds) ? `${r.elapsedSeconds}s` : "n/a"
      }`,
      9,
      [100, 116, 139],
      4.5
    );
    y += 1;

    addWrappedText("Feedback:", 9, [71, 85, 105], 4.5);
    addWrappedText(r.feedback || "", 9, [30, 41, 59], 4.5);

    addWrappedText("Suggestion:", 9, [71, 85, 105], 4.5);
    addWrappedText(r.suggestion || "", 9, [30, 41, 59], 4.5);

    if (r.redFlags && r.redFlags.length > 0) {
      addWrappedText(`Red flags: ${r.redFlags.join("; ")}`, 9, [185, 28, 28], 4.5);
    }

    if (r.star) {
      const starText = `STAR — Situation/Task: ${r.star.situationTask ? "yes" : "no"}, Action: ${
        r.star.action ? "yes" : "no"
      }, Result: ${r.star.result ? "yes" : "no"}`;
      addWrappedText(starText, 9, [16, 129, 90], 4.5);
    }

    if (r.followUp) {
      addWrappedText(
        `Follow-up: ${r.followUp.question}`,
        9,
        [79, 70, 229],
        4.5
      );
      addWrappedText(
        `Follow-up answer score: ${r.followUp.score}/10 — ${r.followUp.feedback}`,
        9,
        [30, 41, 59],
        4.5
      );
    }

    y += 4;
  });

  const filenameSafeDate = new Date().toISOString().slice(0, 10);
  doc.save(`interview-session-report-${filenameSafeDate}.pdf`);
}
