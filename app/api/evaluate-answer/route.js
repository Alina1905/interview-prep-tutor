import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const DIFFICULTY_EXPECTATION = {
  junior: `The candidate is interviewing for a junior/entry-level role. Grade generously on
depth of experience, but hold the line on communication clarity and basic reasoning.
Don't penalize for lacking years of professional experience.`,
  mid: `The candidate is interviewing for a mid-level role. Expect independent ownership,
concrete examples from real projects, and solid technical reasoning. Vague or purely
theoretical answers should lose points.`,
  senior: `The candidate is interviewing for a senior/lead role. Hold a high bar: expect
tradeoff analysis, ownership of outcomes (not just tasks), awareness of second-order
effects, and evidence of influencing others. Generic or surface-level answers should
score noticeably lower than for a junior candidate.`,
};

function buildPrompt({ jd, question, answer, difficulty, questionType, elapsedSeconds, targetSeconds }) {
  const expectation = DIFFICULTY_EXPECTATION[difficulty] || DIFFICULTY_EXPECTATION.mid;
  const timingNote =
    Number.isFinite(elapsedSeconds) && Number.isFinite(targetSeconds)
      ? `The candidate took about ${elapsedSeconds} seconds to answer; a well-paced answer
for this question is roughly ${targetSeconds} seconds. Note in your feedback (briefly)
if they were rambling/too slow or too rushed/thin, but don't over-penalize small differences.`
      : "";

  const starNote =
    questionType === "behavioral"
      ? `This is a behavioral question. Additionally assess whether the answer follows a
STAR structure. Include a "star" object with three booleans:
- "situationTask": did they establish the situation/context and what needed to be done?
- "action": did they clearly describe the specific actions THEY took?
- "result": did they state a concrete outcome/result (ideally with a measurable impact)?`
      : `This is a technical/situational question, not behavioral. Set "star" to null.`;

  return `You are a strict but fair interview coach reviewing a candidate's spoken/typed answer
to an interview question, for the specific job described below.

${expectation}

Job description: ${jd}
Question asked: ${question}
Candidate's answer: ${answer}
${timingNote}

Evaluate the answer on:
1. Relevance - does it actually answer the question and connect to the job?
2. Structure - for behavioral questions, does it follow a clear situation/action/result
   shape? For technical questions, is the reasoning clear and correct?
3. Specificity - vague generalities vs concrete examples/numbers
4. Red flags - anything that would concern a real interviewer (rambling, dodging,
   inconsistency)

${starNote}

Provide sub-scores (integers 0 to 10) for 5 core skill dimensions in a "skills" object:
- "communication": clarity, tone, articulation, pacing
- "technical": domain accuracy, correctness, technical reasoning
- "structure": STAR method adherence or clear logical outline
- "specificity": concrete details, metrics, real-world examples
- "problemSolving": tradeoff analysis, edge cases, critical thinking

Also come up with ONE incisive follow-up question a sharp interviewer would ask right
after hearing this answer — the kind that digs into the vaguest, weakest, or most
unsubstantiated part of what they said (e.g. "why did you choose X over Y", "what would
you have done if that hadn't worked", "how did you measure that impact"). It should be
answerable in a sentence or two, not a whole new topic.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "score": <integer 0-10>,
  "skills": {
    "communication": <integer 0-10>,
    "technical": <integer 0-10>,
    "structure": <integer 0-10>,
    "specificity": <integer 0-10>,
    "problemSolving": <integer 0-10>
  },
  "feedback": "<2-3 sentences of direct, specific feedback>",
  "suggestion": "<one concrete suggestion for how to improve this exact answer>",
  "redFlags": ["<short red flag>", "..."],
  "star": {"situationTask": <bool>, "action": <bool>, "result": <bool>} or null,
  "followUpQuestion": "<the one incisive follow-up question described above>"
}

Be honest, not encouraging for its own sake - the candidate needs real signal, not comfort.
If there are no red flags, return an empty array for redFlags.`;
}

export async function POST(req) {
  try {
    const {
      jobDescription,
      question,
      answer,
      difficulty = "mid",
      questionType = "technical",
      elapsedSeconds,
      targetSeconds,
    } = await req.json();

    if (!question || !answer || answer.trim().length < 3) {
      return NextResponse.json(
        { error: "Missing question or answer." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing GROQ_API_KEY. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a strict but fair interview coach. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: buildPrompt({
              jd: jobDescription || "(not provided)",
              question,
              answer,
              difficulty,
              questionType,
              elapsedSeconds,
              targetSeconds,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // Ensure fallback skills if LLM returns incomplete skills object
    const overallScore = typeof parsed.score === "number" ? parsed.score : 6;
    if (!parsed.skills || typeof parsed.skills !== "object") {
      parsed.skills = {
        communication: overallScore,
        technical: overallScore,
        structure: overallScore,
        specificity: Math.max(0, overallScore - 1),
        problemSolving: overallScore,
      };
    } else {
      parsed.skills = {
        communication: Number.isFinite(parsed.skills.communication) ? parsed.skills.communication : overallScore,
        technical: Number.isFinite(parsed.skills.technical) ? parsed.skills.technical : overallScore,
        structure: Number.isFinite(parsed.skills.structure) ? parsed.skills.structure : overallScore,
        specificity: Number.isFinite(parsed.skills.specificity) ? parsed.skills.specificity : overallScore,
        problemSolving: Number.isFinite(parsed.skills.problemSolving) ? parsed.skills.problemSolving : overallScore,
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
