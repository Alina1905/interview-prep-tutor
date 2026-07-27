# Interview Prep Voice Drill & AI Coaching Platform

**Live Deployment URL:** [https://interview-prep-tutor.vercel.app](https://interview-prep-tutor.vercel.app)

---

## What it does & The Problem it Solves

### The Problem
Preparing for technical and behavioral job interviews is often a lonely, passive, and stressful experience. Job seekers—especially students, career switchers, and engineers—often practice by reading lists of questions and rehearsing answers silently in their head. This fails to simulate the real-world pressure of:
- Articulating thoughts clearly under timing constraints.
- Navigating unpredictable, direct follow-up questions.
- Tracking and eliminating verbal tics/filler words.
- Matching their actual experience to target Job Descriptions (JD).

### The Solution
**Interview Prep Voice Drill** is an interactive, voice-first mock interview training ground. By combining real-time browser-native speech transcription, custom interviewer personas, vocal analytics, game mechanics, and an integrated coding sandbox, it simulates a live panel interview. It provides instant, raw, and quantitative feedback so candidates can refine their communication structure, domain correctness, and pacing before facing real recruiters.

---

## Features List

### 1. Real-Time Vocal Analytics & Speech Recognition
- **Filler Word & Tic Detector**: Automatically scans and alerts you on verbal tics like *"um"*, *"uh"*, *"like"*, *"basically"*, *"you know"*, and *"actually"*.
- **Words Per Minute (WPM) Gauge**: Real-time pace tracker classification (*Slow / Hesitant*, *Ideal / Confident*, or *Fast / Rushed*).
- **Native Speech-to-Text**: Voice transcription runs locally using the browser's Web Speech API (`SpeechRecognition`).

### 2. 5-Axis Skill Radar Chart
- **Graded Dimensions**: Every response is graded from 0 to 10 across 5 core dimensions:
  1. **Communication**: Tone, articulation, and pacing.
  2. **Technical**: Correctness, depth, and domain knowledge.
  3. **Structure**: Adherence to logical guidelines (like the STAR method).
  4. **Specificity**: Use of concrete numbers, metrics, and project names.
  5. **Problem Solving**: Navigating tradeoffs, constraints, and edge cases.
- **Visual Profiles**: Interactive Recharts radar charts display skill breakdowns per question, per session, and over time.

### 3. Gamification System (XP, Levels, Streaks & Badges)
- **Leveling**: Accumulate experience points (XP) to climb from Level 1 (*Rookie*) to Level 6 (*Executive Tech Lead*).
- **Daily Streaks**: Track consecutive active practice days.
- **Unlockable Badges**: 8 achievements (e.g., *STAR Alignment*, *Pacing Pro*, *Bullseye*, *Senior Contender*) rewarded automatically upon meeting criteria.

### 4. Resume Upload & JD-Match Analyzer
- **Compatibility Scorecard**: Compares your resume (`.pdf`, `.txt`, `.docx`) against a job description to produce an overall match percentage.
- **ATS Gap Analysis**: Identifies matching key skills, missing requirements, and provides a customized checklist of highlights and interview tips.
- **Pre-fill Practice**: Instantly pre-fill the job description into the mock interview generator.

### 5. Big Tech Company Drill Packs
- Select pre-configured interview rounds designed for:
  - **Amazon**: Focuses heavily on the 16 Leadership Principles (Customer Obsession, Ownership, Dive Deep).
  - **Google**: Focuses on algorithmic rigor, system scalability, and Googleliness.
  - **Meta**: Focuses on high-concurrency systems and move-fast culture.
  - **Startups**: Focuses on ambiguity, MVPs, and generalist speed.

### 6. Reverse Q&A & Compensation Negotiation Trainer
- Practice the critical ending phase of interviews:
  - **Reverse Q&A**: Formulating business-focused questions when asked, *"What questions do you have for us?"*.
  - **Compensation drills**: Practice anchoring compensation expectations without giving away numbers too early.

### 7. Live Code Sandbox & AI Evaluator
- Integrated code editor supporting JavaScript, Python, Java, and C++.
- Automatic AI syntax, logic, and complexity evaluation returning time & space complexity analysis (Big-O).

### 8. Webcam Practice Feed & Presence Meter
- Optional local webcam activation (`navigator.mediaDevices.getUserMedia`) to monitor your posture, expressions, and eye contact during practice.

---

## The AI Features & Prompts

The core coaching engines use the **Groq API** with the **Llama-3.3-70b-versatile** model.

### 1. Question Generator
Generates role-specific questions and target answer durations.
```text
You are an interview coach. Given a job description, generate 5-7 realistic interview
questions a candidate would actually be asked for this role. Mix behavioral questions
(assessing soft skills, past experience) with role-specific technical/situational
questions drawn directly from the responsibilities and requirements in the JD.
Order them roughly as a real interviewer would: warm-up, then technical, then behavioral,
then closing.
```

### 2. Answer Evaluator
Grades candidate answer on 5 skill axes, STAR criteria, red flags, and follow-up questions.
```text
Evaluate the answer on:
1. Relevance - does it actually answer the question and connect to the job?
2. Structure - for behavioral questions, does it follow a clear situation/action/result
   shape? For technical questions, is the reasoning clear and correct?
3. Specificity - vague generalities vs concrete examples/numbers
4. Red flags - anything that would concern a real interviewer (rambling, dodging,
   inconsistency)

Provide sub-scores (integers 0 to 10) for 5 core skill dimensions in a "skills" object:
- "communication": clarity, tone, articulation, pacing
- "technical": domain accuracy, correctness, technical reasoning
- "structure": STAR method adherence or clear logical outline
- "specificity": concrete details, metrics, real-world examples
- "problemSolving": tradeoff analysis, edge cases, critical thinking
```

---

## Tools, Services, & AI Models Used

- **AI Models**: Groq Cloud API running `llama-3.3-70b-versatile`
- **Framework**: Next.js 14 (React 18)
- **Speech Synthesis & Recognition**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Webcam Feed**: HTML5 WebRTC Media Capture API (`getUserMedia`)
- **Styling & Animation**: Tailwind CSS, Framer Motion
- **Data Visualization**: Recharts (Radar & Line Charts)
- **PDF Generation**: jsPDF
- **State & Storage**: LocalStorage

---

## How to Run the Project

1. **Clone the repository & install dependencies**:
   ```bash
   git clone https://github.com/Alina1905/interview-prep-tutor.git
   cd interview-drill
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file inside the `interview-drill/` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) using **Google Chrome** or **Microsoft Edge** for Web Speech recognition and synthesis support.
