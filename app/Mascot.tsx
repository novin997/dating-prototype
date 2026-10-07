import type { ReactNode } from "react";

/** Otto the otter, a nod to Singapore's famous otters. Each mood changes his face, paws and prop. */
export type Mood = "wave" | "think" | "note" | "love" | "sad" | "plan" | "ask" | "party" | "lock" | "chart";

const FUR = "#a86b45";
const FUR_DARK = "#7c4a2d";
const CREAM = "#f8e6d2";
const INK = "#2b1a14";
const BLUSH = "#ff8fa3";

const HEART = "M12 21s-7-4.6-9.3-9.1C1.1 8.6 3 5 6.6 5c2.1 0 3.6 1.1 5.4 3 1.8-1.9 3.3-3 5.4-3C21 5 22.9 8.6 21.3 11.9 19 16.4 12 21 12 21z";

function Heart({ x, y, size, color = "#ff4d6d", className }: { x: number; y: number; size: number; color?: string; className?: string }) {
  const s = size / 24;
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}>
      <path d={HEART} fill={color} className={className} />
    </g>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "party" || mood === "love" || mood === "wave") {
    // Happy, closed eyes
    return (
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M43 47q5-6 10 0" />
        <path d="M67 47q5-6 10 0" />
      </g>
    );
  }
  return (
    <g>
      {mood === "sad" && (
        <g stroke={INK} strokeWidth="2" strokeLinecap="round">
          <path d="M42 41l9-4" />
          <path d="M78 41l-9-4" />
        </g>
      )}
      {mood === "think" && (
        <g stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M66 37q6-3 11 0" />
        </g>
      )}
      <circle cx="48" cy="46" r="4.6" fill={INK} />
      <circle cx="72" cy="46" r="4.6" fill={INK} />
      <circle cx="49.6" cy="44.4" r="1.6" fill="#fff" />
      <circle cx="73.6" cy="44.4" r="1.6" fill="#fff" />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "sad") return <path d="M54 68q6-5 12 0" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  if (mood === "party" || mood === "wave") {
    return (
      <g>
        <path d="M54 63q6 9 12 0z" fill={INK} />
        <path d="M57 66.5q3 2.5 6 0" fill="#ff7a8a" />
      </g>
    );
  }
  if (mood === "think" || mood === "ask") return <path d="M56 65q4 2 8 0" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  return <path d="M53 63q3.5 4 7 0q3.5 4 7 0" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

/** Paws and whatever Otto is holding. */
function Paws({ mood }: { mood: Mood }) {
  const paw = (x: number, y: number, rotate = 0) => (
    <ellipse cx={x} cy={y} rx="6.5" ry="5.5" fill={FUR_DARK} transform={`rotate(${rotate} ${x} ${y})`} />
  );
  switch (mood) {
    case "wave":
      return (
        <>
          {paw(50, 92)}
          <g className="mascot-wave">
            <path d="M80 92q10-6 14-22" stroke={FUR} strokeWidth="11" strokeLinecap="round" fill="none" />
            {paw(94, 68, -20)}
          </g>
        </>
      );
    case "think":
      return (
        <>
          {paw(50, 94)}
          <path d="M76 94q4-12-4-22" stroke={FUR} strokeWidth="10" strokeLinecap="round" fill="none" />
          {paw(71, 72, 10)}
        </>
      );
    case "note":
      return (
        <>
          <rect x="45" y="80" width="30" height="34" rx="4" fill="#fff" stroke={INK} strokeWidth="1.8" />
          <rect x="53" y="77" width="14" height="6" rx="2" fill="#8b5cf6" />
          <g stroke="#c9bfd8" strokeWidth="2" strokeLinecap="round">
            <path d="M51 92h18" />
            <path d="M51 99h18" />
            <path d="M51 106h11" />
          </g>
          {paw(44, 96)}
          {paw(76, 96)}
        </>
      );
    case "love":
      return (
        <>
          <Heart x={60} y={94} size={30} className="mascot-beat" />
          {paw(47, 96)}
          {paw(73, 96)}
        </>
      );
    case "plan":
      return (
        <>
          <path d="M42 84l12-4 12 4 12-4v26l-12 4-12-4-12 4z" fill="#fff4c2" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M54 80v26M66 84v26" stroke={INK} strokeWidth="1.2" opacity=".4" />
          <path d="M48 98q8-10 14-4t12-6" stroke="#ff4d6d" strokeWidth="1.8" strokeDasharray="3 2.5" fill="none" />
          {paw(41, 96)}
          {paw(79, 96)}
        </>
      );
    case "party":
      return (
        <>
          <path d="M42 92q-12-8-14-24" stroke={FUR} strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M78 92q12-8 14-24" stroke={FUR} strokeWidth="11" strokeLinecap="round" fill="none" />
          {paw(28, 66, 20)}
          {paw(92, 66, -20)}
        </>
      );
    case "lock":
      return (
        <>
          <path d="M52 86v-6a8 8 0 0 1 16 0v6" stroke={INK} strokeWidth="3" fill="none" />
          <rect x="47" y="85" width="26" height="22" rx="5" fill="#ffc94d" stroke={INK} strokeWidth="1.8" />
          <circle cx="60" cy="95" r="2.6" fill={INK} />
          {paw(46, 98)}
          {paw(74, 98)}
        </>
      );
    case "chart":
      return (
        <>
          <rect x="43" y="82" width="34" height="28" rx="4" fill="#fff" stroke={INK} strokeWidth="1.8" />
          <rect x="49" y="96" width="5" height="9" rx="1" fill="#8b5cf6" />
          <rect x="57.5" y="90" width="5" height="15" rx="1" fill="#ff4d6d" />
          <rect x="66" y="86" width="5" height="19" rx="1" fill="#ffb020" />
          {paw(43, 98)}
          {paw(77, 98)}
        </>
      );
    default:
      return (
        <>
          {paw(50, 94)}
          {paw(70, 94)}
        </>
      );
  }
}

/** Little extras floating around Otto's head. */
function Extras({ mood }: { mood: Mood }) {
  switch (mood) {
    case "think":
      return (
        <g className="mascot-float" fill="#8b5cf6">
          <circle cx="98" cy="30" r="2.5" />
          <circle cx="104" cy="20" r="3.5" />
          <text x="102" y="13" fontSize="16" fontWeight="800" fontFamily="system-ui, sans-serif">
            ?
          </text>
        </g>
      );
    case "ask":
      return (
        <text className="mascot-float" x="94" y="26" fontSize="22" fontWeight="800" fill="#8b5cf6" fontFamily="system-ui, sans-serif">
          ?
        </text>
      );
    case "love":
      return (
        <g className="mascot-float">
          <Heart x={100} y={24} size={14} />
          <Heart x={18} y={34} size={10} color="#ff8fa3" />
        </g>
      );
    case "sad":
      return <path d="M80 52q-3 6 0 8q3-2 0-8z" fill="#7cc4ff" />;
    case "plan":
      return (
        <g className="mascot-float">
          <path d="M101 10a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8z" fill="#ff4d6d" />
          <circle cx="101" cy="18" r="3" fill="#fff" />
        </g>
      );
    case "party":
      return (
        <g className="mascot-float">
          <rect x="14" y="20" width="6" height="3" rx="1" fill="#ffb020" transform="rotate(30 17 21)" />
          <rect x="100" y="14" width="6" height="3" rx="1" fill="#8b5cf6" transform="rotate(-25 103 15)" />
          <circle cx="22" cy="44" r="2.5" fill="#ff4d6d" />
          <circle cx="104" cy="40" r="2.5" fill="#22c55e" />
          <path d="M60 2l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#ffc94d" />
        </g>
      );
    case "wave":
      return (
        <g className="mascot-float" stroke="#ffb020" strokeWidth="2.4" strokeLinecap="round">
          <path d="M106 52l6-3" />
          <path d="M106 60h7" />
          <path d="M104 44l4-5" />
        </g>
      );
    default:
      return null;
  }
}

export function Mascot({ mood, size = 96 }: { mood: Mood; size?: number }) {
  return (
    <svg className="mascot" viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <ellipse cx="60" cy="117" rx="30" ry="3" fill={INK} opacity=".12" />
      {/* Tail */}
      <path d="M82 108q24 6 30-14q-12 7-28 3z" fill={FUR_DARK} />
      {/* Body */}
      <ellipse cx="60" cy="98" rx="28" ry="20" fill={FUR} />
      <ellipse cx="60" cy="101" rx="18" ry="14" fill={CREAM} />
      {/* Head */}
      <circle cx="29" cy="36" r="6" fill={FUR} />
      <circle cx="91" cy="36" r="6" fill={FUR} />
      <circle cx="29" cy="36" r="3" fill={FUR_DARK} />
      <circle cx="91" cy="36" r="3" fill={FUR_DARK} />
      <ellipse cx="60" cy="51" rx="34" ry="29" fill={FUR} />
      <ellipse cx="60" cy="62" rx="24" ry="15" fill={CREAM} />
      <ellipse cx="39" cy="57" rx="5.5" ry="3.2" fill={BLUSH} opacity=".65" />
      <ellipse cx="81" cy="57" rx="5.5" ry="3.2" fill={BLUSH} opacity=".65" />
      <Eyes mood={mood} />
      <ellipse cx="60" cy="56.5" rx="5.5" ry="3.8" fill={INK} />
      <path d="M60 60v3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <Mouth mood={mood} />
      <g stroke={FUR_DARK} strokeWidth="1.2" strokeLinecap="round" opacity=".55">
        <path d="M44 61l-12-2M44 65l-11 2" />
        <path d="M76 61l12-2M76 65l11 2" />
      </g>
      <Paws mood={mood} />
      <Extras mood={mood} />
    </svg>
  );
}

/** Otto with a speech bubble, shown at the top of every screen. */
export function Buddy({ mood, children }: { mood: Mood; children: ReactNode }) {
  return (
    <div className="buddy">
      <div className="buddy-otter">
        <Mascot mood={mood} />
      </div>
      <p className="bubble">{children}</p>
    </div>
  );
}
