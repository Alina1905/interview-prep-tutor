import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function buildPrompt({ jd, question, answer, followUpQuestion, followUpAnswer }) {
  return `You are an interviewer who just asked a sharp follow-up question digging into a
candidate's original answer. Evaluate ONLY the follow-up response.

Job description: ${jd}
Original question: ${question}
Original answer: ${answer}
Follow-up question: ${followUpQuestion}
Candidate's follow-up answer: ${followUpAnswer}

Evaluate the follow-up answer on:
1. Does it directly engage with the follow-up instead of dodging or repeating the
   original answer?
2. Does it add credible, specific detail that's consistent with the original answer —
   or does it reveal a gap, inconsistency, or that the original answer was overstated?
3. Confidence and ownership in how they handle being pushed on it.

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentences, direct and specific, noting especially if the follow-up
    exposed a gap or inconsistency versus the original answer>"
}

Be honest, not encouraging for its own sake.`;
}

export async function POST(req) {
  try {
    const { jobDescription, question, answer, followUpQuestion, followUpAnswer } = await req.json();

    if (!followUpQuestion || !followUpAnswer || followUpAnswer.trim().length < 2) {
      return NextResponse.json(
        { error: "Missing follow-up question or answer." },
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
              followUpQuestion,
              followUpAnswer,
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

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
