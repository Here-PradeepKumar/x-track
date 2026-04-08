const ITEMS = [
  "OBSTACLE COURSE RACING",
  "NFC BIB SCANNING",
  "REAL-TIME SPLIT TIMES",
  "LIVE LEADERBOARD",
  "VOLUNTEER COORDINATION",
  "CSV BULK IMPORT",
  "FIREBASE FIRESTORE",
  "ATHLETE TRACKING",
];

export default function Marquee() {
  return (
    <div className="bg-lime overflow-hidden py-3.5 border-y border-lime-dim select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 mx-5 text-[11px] font-body font-black text-ink tracking-[0.2em] uppercase"
          >
            {item}
            <span className="w-1 h-1 rounded-full bg-ink/40 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
