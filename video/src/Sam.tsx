import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Sam, the example resident, as a hand-drawn doodle. All motion is driven by the frame.
export type Mood = "neutral" | "confused" | "worried" | "thinking" | "surprised" | "happy";
const INK = "#1E2A33";

// "Boiling line" look: the sketch filter's noise seed changes every 4 frames.
export const Rough: React.FC<{ id: string; scale?: number }> = ({ id, scale = 2.5 }) => {
  const frame = useCurrentFrame();
  return (
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={Math.floor(frame / 4) % 5} />
      <feDisplacementMap in="SourceGraphic" scale={scale} />
    </filter>
  );
};

const mouths: Record<Mood, string> = {
  neutral: "M128 122 Q150 130 172 122",
  confused: "M128 128 Q140 120 150 128 T172 126",
  worried: "M130 132 Q150 120 170 132",
  thinking: "M138 126 L166 122",
  surprised: "M150 118 m-9 0 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0",
  happy: "M122 116 Q150 146 178 116 Z",
};

export const Sam: React.FC<{ mood?: Mood; size?: number; wave?: boolean; buzzAt?: number[]; enterAt?: number }> = ({
  mood = "neutral", size = 420, wave = false, buzzAt = [], enterAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - enterAt, fps, config: { damping: 12 } });
  const bob = Math.sin(frame / 9) * 4;
  const blink = frame % 96 > 90 ? 0.1 : 1;
  const buzz = buzzAt.some((b) => frame >= b && frame < b + 18) ? Math.sin(frame * 2.2) * 6 : 0;
  const waveAngle = wave ? Math.sin(frame / 5) * 22 - 10 : 0;
  const brows = mood === "worried" || mood === "confused" ? "M118 82 L140 88 M182 82 L160 88" : "M118 86 L140 84 M160 84 L182 86";
  return (
    <svg viewBox="0 0 300 440" width={size * 0.68} height={size} style={{ overflow: "visible", scale: String(enter), translate: `0 ${bob}px` }}>
      <defs><Rough id="sam-rough" /></defs>
      <g filter="url(#sam-rough)" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
        {/* legs */}
        <path d="M122 330 L114 410 L92 414 M178 330 L186 410 L208 414" fill="none" />
        {/* hoodie */}
        <path d="M86 330 Q78 220 120 196 L180 196 Q222 220 214 330 Z" fill="#2E5E4E" />
        <path d="M130 196 Q150 222 170 196" fill="none" stroke="#F3F5F4" strokeWidth={4} />
        {/* waving arm (left) */}
        <g style={{ transformOrigin: "98px 222px", rotate: `${waveAngle}deg` }}>
          <path d={wave ? "M98 222 Q64 180 60 128" : "M98 222 Q70 270 92 312"} fill="none" />
          <circle cx={wave ? 60 : 92} cy={wave ? 120 : 316} r={11} fill="#E7C3A0" />
        </g>
        {/* arm holding the phone (right) */}
        <path d="M204 224 Q238 262 196 288" fill="none" />
        <g style={{ translate: `${buzz}px 0`, rotate: `${buzz}deg`, transformOrigin: "186px 270px" }}>
          <rect x={164} y={236} width={44} height={72} rx={8} fill="#FFFFFF" />
          <rect x={172} y={248} width={28} height={34} rx={3} fill={buzz ? "#C98A00" : "#CCD5D2"} strokeWidth={3} />
        </g>
        {buzz !== 0 && <path d="M222 238 l14 -8 M224 258 l18 0 M222 278 l14 8" fill="none" stroke="#C98A00" />}
        {/* head */}
        <circle cx={150} cy={110} r={66} fill="#E7C3A0" />
        <path d="M86 98 Q92 40 150 42 Q212 40 216 100 Q196 70 166 76 Q140 60 118 80 Q100 78 86 98 Z" fill={INK} />
        <path d={brows} fill="none" strokeWidth={5} />
        <ellipse cx={128} cy={104} rx={6} ry={8 * blink} fill={INK} />
        <ellipse cx={172} cy={104} rx={6} ry={8 * blink} fill={INK} />
        <path d={mouths[mood]} fill={mood === "happy" ? "#FFFFFF" : "none"} strokeWidth={5} />
      </g>
      {mood === "confused" && (
        <text x={226} y={60} fontFamily="Patrick Hand" fontSize={70} fill="#C98A00" style={{ rotate: `${Math.sin(frame / 7) * 8}deg`, transformOrigin: "240px 40px" }}>?</text>
      )}
      {mood === "thinking" && (
        <g fill="none" stroke={INK} strokeWidth={4}>
          {[0, 1, 2].map((i) => <circle key={i} cx={230 + i * 18} cy={52 - i * 16} r={5 + i * 3} opacity={interpolate((frame + i * 8) % 30, [0, 15, 30], [0.3, 1, 0.3])} />)}
        </g>
      )}
    </svg>
  );
};
