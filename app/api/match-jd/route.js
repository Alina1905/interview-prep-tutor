import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function buildMatchPrompt(resumeText, jobDescription) {
  return `You are an expert tech recruiter and hiring manager. Perform a detailed matching analysis between the candidate's resume and the target job description.

Candidate Resume:
${resumeText}

Target Job Description:
${jobDescription}

Analyze:
1. Overall compatibility match score (0-100 percentage integer).
2. Key matching skills and experience present in both resume and JD.
3. High-value missing skills or gaps from the JD that are not evident in the resume.
4. Top candidate strengths for this specific role.
5. Actionable interview recommendations (how the candidate should frame their experience to stand out for this role).

Respond ONLY with valid JSON in this exact shape:
{
  "matchPercentage": <integer 0-100>,
  "summary": "<2-3 sentence overview of candidate suitability>",
  "matchingSkills": ["<skill 1>", "<skill 2>", ...],
  "missingSkills": ["<missing requirement 1>", "<missing requirement 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "interviewTips": ["<interview tip 1>", "<interview tip 2>", ...]
}`;
}

export async function POST(req) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid resume (at least a few sentences or uploaded file content)." },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a target job description to compare against." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing GROQ_API_KEY. Add it to environment variables." },
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
            content: "You are an expert hiring manager and ATS analyst. Always output valid JSON.",
          },
          {
            role: "user",
            content: buildMatchPrompt(resumeText, jobDescription),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Groq error: ${errText}` }, { status: 502 });
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

    return NextResponse.json({
      matchPercentage: Math.min(100, Math.max(0, parsed.matchPercentage || 70)),
      summary: parsed.summary || "Good initial match.",
      matchingSkills: parsed.matchingSkills || [],
      missingSkills: parsed.missingSkills || [],
      strengths: parsed.strengths || [],
      interviewTips: parsed.interviewTips || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
