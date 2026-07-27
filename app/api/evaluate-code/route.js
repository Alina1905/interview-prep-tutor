import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(req) {
  try {
    const { code, language = "javascript", problemStatement = "Write a function to reverse a linked list or solve target problem" } = await req.json();

    if (!code || code.trim().length < 5) {
      return NextResponse.json(
        { error: "Please write code before submitting for evaluation." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server missing GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const prompt = `You are a Principal Software Engineer conducting a technical coding interview.

Problem Statement: ${problemStatement}
Programming Language: ${language}

Candidate's Code Solution:
\`\`\`${language}
${code}
\`\`\`

Evaluate the code solution on:
1. Correctness & Edge cases
2. Time Complexity (Big O)
3. Space Complexity (Big O)
4. Code Style & Readability
5. Potential Optimizations

Respond ONLY with valid JSON in this shape:
{
  "score": <integer 0-10>,
  "correctness": "<1-2 sentences on correctness>",
  "timeComplexity": "<Big O time complexity e.g. O(N)>",
  "spaceComplexity": "<Big O space complexity e.g. O(1)>",
  "feedback": "<detailed feedback on structure and syntax>",
  "optimizations": "<actionable optimization tips or alternative approaches>"
}`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a senior tech interviewer evaluating code. Respond ONLY with valid JSON." },
          { role: "user", content: prompt },
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

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
