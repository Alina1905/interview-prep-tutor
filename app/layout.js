import "./globals.css";

export const metadata = {
  title: "Interview Prep Voice Drill",
  description: "Paste a job description, get tailored interview questions, practice by voice or text, get real feedback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
