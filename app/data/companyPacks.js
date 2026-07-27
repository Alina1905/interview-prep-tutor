export const COMPANY_PACKS = [
  {
    id: "amazon",
    name: "Amazon Drill Pack",
    company: "Amazon",
    icon: "📦",
    description: "Focuses on Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Dive Deep, Have Backbone).",
    badgeColor: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300",
    questions: [
      {
        question: "Tell me about a time you had to make a decision without all the data you needed. How did you handle Customer Obsession and Bias for Action?",
        type: "behavioral",
        targetSeconds: 120,
      },
      {
        question: "Describe a project where you took total Ownership beyond your immediate responsibilities to prevent a major outage or delay.",
        type: "behavioral",
        targetSeconds: 120,
      },
      {
        question: "Give an example of a tough technical problem where you had to Dive Deep into logs, code, or metrics to find the root cause.",
        type: "behavioral",
        targetSeconds: 120,
      },
      {
        question: "Tell me about a time you disagreed with a colleague or manager's technical decision. How did you Have Backbone and Disagree and Commit?",
        type: "behavioral",
        targetSeconds: 120,
      },
    ],
  },
  {
    id: "google",
    name: "Google Drill Pack",
    company: "Google",
    icon: "🔍",
    description: "Evaluates technical depth, algorithmic rigor, system scalability, and Googleliness.",
    badgeColor: "from-blue-500/20 to-emerald-500/20 border-blue-500/40 text-blue-300",
    questions: [
      {
        question: "How would you design a globally distributed cache with sub-millisecond read latency and eventual consistency across regions?",
        type: "technical",
        targetSeconds: 150,
      },
      {
        question: "Tell me about a complex technical tradeoff you navigated where you had to balance short-term velocity against long-term architectural debt.",
        type: "behavioral",
        targetSeconds: 120,
      },
      {
        question: "Explain how you handle ambiguous technical requirements when building a brand new product from scratch.",
        type: "technical",
        targetSeconds: 120,
      },
    ],
  },
  {
    id: "meta",
    name: "Meta Drill Pack",
    company: "Meta",
    icon: "♾️",
    description: "Focuses on Product Sense, rapid execution, move fast culture, and high-concurrency scaling.",
    badgeColor: "from-indigo-500/20 to-blue-500/20 border-indigo-500/40 text-indigo-300",
    questions: [
      {
        question: "How would you design the backend infrastructure for real-time notifications for 3 billion active daily users?",
        type: "technical",
        targetSeconds: 150,
      },
      {
        question: "Describe a situation where you had to ship a feature under extremely tight deadlines. What tradeoffs did you make to Move Fast?",
        type: "behavioral",
        targetSeconds: 120,
      },
    ],
  },
  {
    id: "startup",
    name: "High-Growth Startup Pack",
    company: "Startup",
    icon: "🚀",
    description: "Tests full-stack execution, zero-to-one building, and adapting to rapid changes.",
    badgeColor: "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300",
    questions: [
      {
        question: "How do you prioritize tech debt vs new feature requests when your engineering team is small and fast-moving?",
        type: "behavioral",
        targetSeconds: 120,
      },
      {
        question: "Walk me through how you architect an MVP from scratch to handle initial user spike without overengineering.",
        type: "technical",
        targetSeconds: 120,
      },
    ],
  },
];
