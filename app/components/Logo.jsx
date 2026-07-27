export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Interview Prep Voice Drill logo"
    >
      <rect width="48" height="48" rx="12" fill="#4f46e5" />
      <path
        d="M24 12a6 6 0 0 0-6 6v6a6 6 0 0 0 12 0v-6a6 6 0 0 0-6-6Z"
        fill="white"
      />
      <path
        d="M14 22v2a10 10 0 0 0 20 0v-2"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="24" y1="34" x2="24" y2="38" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="19" y1="38" x2="29" y2="38" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
