import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const DIFFICULTY_GUIDANCE = {
  junior: `The candidate is interviewing for a junior/entry-level role. Focus questions on
fundamentals, willingness to learn, coachability, and foundational technical concepts.
Don't expect deep architecture or leadership experience — questions should be answerable
by someone with limited professional experience (internships, school projects, bootcamps).`,
  mid: `The candidate is interviewing for a mid-level role. Expect solid hands-on experience:
questions should probe independent ownership of features/projects, debugging real problems,
and collaborating cross-functionally, but not org-wide strategy or people management.`,
  senior: `The candidate is interviewing for a senior/lead role. Questions should probe
system design depth, technical tradeoffs at scale, mentorship, ambiguous problem framing,
and ownership of outcomes beyond just code — push harder on "why" and "what would you do
differently."`,
};

function buildSystemPrompt(difficulty) {
  const guidance = DIFFICULTY_GUIDANCE[difficulty] || DIFFICULTY_GUIDANCE.mid;
  return `You are an interview coach. Given a job description, generate 5-7 realistic interview
questions a candidate would actually be asked for this role. Mix behavioral questions
(assessing soft skills, past experience) with role-specific technical/situational
questions drawn directly from the responsibilities and requirements in the JD.
Order them roughly as a real interviewer would: warm-up, then technical, then behavioral,
then closing.

${guidance}

Respond ONLY with valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "questions": [
    {
      "question": "<the interview question>",
      "type": "behavioral" | "technical",
      "targetSeconds": <integer, a realistic number of seconds a candidate should spend
        answering out loud, between 45 and 180, longer for deeper technical/behavioral
        questions and shorter for warm-up questions>
    }
  ]
}`;
}

export async function POST(req) {
  try {
    const { jobDescription, difficulty = "mid" } = await req.json();

    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a job description (or title + a few bullet points)." },
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
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(difficulty) },
          { role: "user", content: `Job description:\n\n${jobDescription}` },
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

    const questions = (parsed.questions || [])
      .filter((q) => q && q.question)
      .map((q) => ({
        question: q.question,
        type: q.type === "behavioral" ? "behavioral" : "technical",
        targetSeconds:
          Number.isFinite(q.targetSeconds) && q.targetSeconds > 0 ? q.targetSeconds : 90,
      }));

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions came back. Try adding more detail to the job description." },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
