# Interview Prep Voice Drill & AI Coaching Platform

An advanced, end-to-end AI-powered interview practice platform built to turn job descriptions and resumes into realistic, interactive mock interviews with real-time vocal analytics, gamification, and technical code evaluation.

---

##  Key Features

###  1. 5-Axis Skill Radar Breakdown
- **Sub-Skill Coaching**: Evaluates every response across 5 core dimensions:
  1. **Communication**: Clarity, articulation, tone, and pacing.
  2. **Technical Depth**: Accuracy, domain correctness, and reasoning.
  3. **Structure**: STAR framework adherence (Situation, Task, Action, Result).
  4. **Specificity**: Use of concrete metrics, numbers, and real-world examples.
  5. **Problem Solving**: Critical thinking, tradeoff analysis, and edge cases.
- **Interactive Radar Chart**: Rendered with Recharts for individual question feedback, aggregate session summaries, and multi-session progress.

---

###  2. Gamification Engine (XP, Levels, Streaks & Badges)
- **Level Progression System**: Earn XP for every practice answer and session completed. Progress from *Level 1 (Rookie Interviewee)* to *Level 6 (Executive Tech Lead)*.
- **Daily Practice Streaks**: Animated day-streak counter tracking active practice consistency.
- **8 Unlockable Achievements/Badges**:
  -  **First Step** — Complete your first question
  -  **On Fire** — Maintain a 3-day practice streak
  -  **STAR Alignment** — Perfect Situation, Action, Result criteria
  -  **Bullseye** — Score a perfect 10/10 on an answer
  -  **Pacing Pro** — High score under target time
  -  **Matchmaker** — Perform a Resume + JD match analysis
  -  **Senior Contender** — Finish a Senior session with score >= 8
  -  **Veteran Drill Master** — Complete 5+ sessions
- **Milestone Celebrations**: Particle confetti animations (`canvas-confetti`) on level ups and badge unlocks.

---

###  3. Resume Upload & AI JD-Match Scoring
- **File Drag & Drop**: Supports uploading `.txt`, `.pdf`, `.md`, and `.docx` resume files or pasting plain text.
- **AI Compatibility Rating**: Analyzes resume content against target job descriptions via Groq API.
- **Match Scorecard**:
  - **Match Percentage** circular gauge (0-100%)
  - **Matching Skills** (green pills)
  - **Skill Gaps & Missing Requirements** (amber pills)
  - **Resume Strengths & Tailored Interview Tips**
- **One-Click Drill Launch**: Pre-fills target JD directly into practice drill setup.

---

###  4. Real-Time Speech Analytics & Voice Personas
- **Words Per Minute (WPM) Gauge**: Real-time pacing measurement (*Slow*, *Ideal / Confident*, or *Fast / Rushed*).
- **Filler Word Detection**: Live scanning and frequency count for verbal tics (*"um"*, *"uh"*, *"like"*, *"you know"*, *"basically"*, *"actually"*).
- **Interviewer Voice Personas**: Customizable SpeechSynthesis personas for question playback:
  -  **Recruiter Sarah**: Warm, encouraging tone
  -  **Tech Lead David**: Direct, fast-paced, challenging tone
  -  **Architect Elena**: Professional, balanced tone

---

### 5. Big Tech & Startup Company Drill Packs
Pre-curated interview tracks tailored to specific company cultures and hiring bars:
-  **Amazon**: 16 Leadership Principles (Customer Obsession, Ownership, Dive Deep, Have Backbone).
-  **Google**: System scalability, algorithmic depth, and Googleliness.
-  **Meta**: Product sense, high-concurrency scaling, and move-fast culture.
-  **High-Growth Startup**: Zero-to-one execution and ambiguity handling.

---

### 6. Reverse Q&A & Salary Negotiation Trainer
Interactive simulation scenarios for closing interviews with confidence:
- **Asking Questions to Interviewers**: Practice framing 2-3 high-impact questions when asked *"What questions do you have for us?"*.
- **Salary Expectation & Counter-Offers**: Practice anchoring compensation value and responding to salary inquiries.

---

### 7. Live Code Sandbox & AI Evaluator
- **Multi-Language Code Editor**: Supports JavaScript, Python, Java, and C++.
- **Preset & Custom Coding Challenges**: Write solutions directly in the editor.
- **AI Code Review (`/api/evaluate-code`)**: Evaluates correctness, edge cases, time complexity (Big-O), space complexity (Big-O), and optimization suggestions.

---

### 8. Webcam Video Practice & Presence Meter
- **Live Camera Feed**: Optional WebRTC webcam integration (`navigator.mediaDevices.getUserMedia`).
- **Presence & Eye Contact HUD**: Real-time camera overlay with visual presence meter to practice maintaining eye contact and posture during voice responses.

---

### 9. Modern Design & PDF Export
- **Aesthetics**: Sleek glassmorphism, dark theme defaults, ambient glow borders, and Framer Motion layout transitions.
- **Downloadable PDF Summary**: Client-side jsPDF exporter generating a clean PDF report of scores, STAR checklists, feedback, and follow-up exchanges.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router, Serverless API Routes)
- **UI & Styling**: Tailwind CSS, Framer Motion, Lucide React
- **Charts & Data Viz**: Recharts (Skill Radar Chart & Readiness Progress Line Chart)
- **AI Evaluation**: Groq API (`llama-3.3-70b-versatile`)
- **Speech & Audio**: Browser Web Speech API (`SpeechRecognition`, `SpeechSynthesis`)
- **Video & Camera**: WebRTC (`getUserMedia`)
- **Effects & PDF**: `canvas-confetti`, `jspdf`
- **State Storage**: `localStorage` (Zero database required)

---

## Local Development Setup

1. **Clone the repository & install dependencies**:
   ```bash
   git clone https://github.com/your-username/interview-prep-voice-drill.git
   cd interview-drill
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
  and enter your api key in there

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in Google Chrome or Microsoft Edge for full speech synthesis & recognition support.

---

## API Endpoint Architecture

- `POST /api/generate-questions`: Generates role-specific questions and target answer durations.
- `POST /api/evaluate-answer`: Grades candidate answer on 5 skill axes, STAR criteria, red flags, and follow-up questions.
- `POST /api/evaluate-followup`: Grades candidate follow-up response.
- `POST /api/match-jd`: Evaluates resume compatibility against job description.
- `POST /api/evaluate-code`: Evaluates technical code solutions for Big-O complexity and correctness.

---

## License

MIT License. Designed for interview practice and career coaching.
