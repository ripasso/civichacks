import { AbsoluteFill, Composition, Easing, Img, Sequence, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import marks from "./demo-marks.json";
import script from "./script.json";
import timing from "./vo-timing.json";
import { Mood, Rough, Sam } from "./Sam";

loadFont({ family: "Patrick Hand", url: staticFile("fonts/patrick-hand.woff2") });
loadFont({ family: "Atkinson Hyperlegible", url: staticFile("fonts/atkinson-400.woff2"), weight: "400" });
loadFont({ family: "Atkinson Hyperlegible", url: staticFile("fonts/atkinson-700.woff2"), weight: "700" });

// Same palette as the site, on graph paper.
const C = { paper: "#F4F6F2", ink: "#1E2A33", muted: "#52616B", civic: "#2E5E4E", amber: "#C98A00", white: "#FFFFFF" };
const HAND = "Patrick Hand, sans-serif";
const BODY = "Atkinson Hyperlegible, sans-serif";
const FPS = 30;
const LEAD = 0.4; // seconds of quiet before each scene's narration
const vo = (id: string) => script.find((x) => x.id === id)!.vo;
const T = timing as Record<string, { duration: number; sentences: { start: number; end: number }[] }>;
const secs = (id: string) => LEAD + T[id].duration + 0.8;
const at = (id: string) => marks.find((m) => m.id === id)!.t;
const f = (sec: number) => Math.round(sec * FPS);
const said = (id: string, n: number) => f(LEAD + T[id].sentences[n].start); // frame when sentence n starts
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fadeIn = (frame: number, delay = 0) => interpolate(frame, [delay, delay + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

const sentenceAt = (id: string, sec: number) => {
  const i = T[id].sentences.findIndex((q, n) => sec < (T[id].sentences[n + 1]?.start ?? Infinity));
  return vo(id)[Math.max(0, i)];
};

const Paper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{
    background: C.paper, color: C.ink, fontFamily: BODY,
    backgroundImage: "linear-gradient(rgba(46,94,78,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(46,94,78,.07) 2px, transparent 2px)",
    backgroundSize: "56px 56px",
  }}>{children}</AbsoluteFill>
);

const CaptionBar: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "26px 160px 40px", background: C.ink, color: C.white, fontSize: 40, lineHeight: 1.3, minHeight: 160, fontFamily: BODY }}>
      {sentenceAt(id, frame / FPS - LEAD)}
    </div>
  );
};

const Scene: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <Paper>
    <AbsoluteFill style={{ padding: "90px 140px 210px" }}>{children}</AbsoluteFill>
    <CaptionBar id={id} />
    <Sequence from={f(LEAD)}><Audio src={staticFile(`vo/${id}.mp3`)} /></Sequence>
  </Paper>
);

// A stroke that draws itself on, hand-drawn style.
const Draw: React.FC<{ d: string; start: number; len?: number; color?: string; width?: number; fill?: string }> = ({ d, start, len = 20, color = C.ink, width = 6, fill = "none" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + len], [1, 0], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  return <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={p} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill={p < 0.05 ? fill : "none"} />;
};

const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at: start, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 11 } });
  return <div style={{ ...style, scale: String(s), opacity: s > 0.01 ? 1 : 0 }}>{children}</div>;
};

const Hand: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = C.ink, children, style }) => (
  <div style={{ fontFamily: HAND, fontSize: size, lineHeight: 1.05, color, ...style }}>{children}</div>
);

// Floating doodle sheet of paper with a label.
const Sheet: React.FC<{ label: string; x: number; y: number; rot: number; start: number }> = ({ label, x, y, rot, start }) => {
  const frame = useCurrentFrame();
  return (
    <Pop at={start} style={{ position: "absolute", left: x, top: y + Math.sin((frame + x) / 14) * 10, rotate: `${rot + Math.sin((frame + y) / 20) * 3}deg` }}>
      <svg width={190} height={230} viewBox="0 0 190 230" style={{ overflow: "visible" }}>
        <defs><Rough id={`sheet-${label}`} /></defs>
        <g filter={`url(#sheet-${label})`} stroke={C.ink} strokeWidth={5} strokeLinecap="round">
          <path d="M10 10 L150 10 L180 40 L180 220 L10 220 Z" fill={C.white} />
          {[70, 100, 130, 160, 190].map((yy) => <path key={yy} d={`M34 ${yy} L${150 - (yy % 3) * 12} ${yy}`} stroke="#9AA6AE" strokeWidth={4} />)}
        </g>
        <text x={95} y={48} textAnchor="middle" fontFamily={HAND} fontSize={30} fill={C.ink}>{label}</text>
      </svg>
    </Pop>
  );
};

const Problem = () => {
  const s2 = said("problem", 1);
  return (
    <Scene id="problem">
      <div style={{ position: "absolute", left: 140, top: 210, width: 900 }}>
        <Pop at={4}><Hand size={156}>Text City Hall</Hand></Pop>
        <svg width={700} height={40} style={{ overflow: "visible", marginTop: -6 }}><Draw d="M6 20 Q180 4 340 18 T690 14" start={18} color={C.amber} width={10} /></svg>
        <div style={{ fontSize: 46, color: C.muted, marginTop: 20, opacity: fadeIn(useCurrentFrame(), 26), lineHeight: 1.25 }}>
          CIVIC Hack 2026: making municipal decisions easier to understand
        </div>
      </div>
      <div style={{ position: "absolute", right: 240, top: 140 }}><Sam mood="confused" size={560} enterAt={s2 - 6} /></div>
      <Sheet label="Agenda" x={1150} y={120} rot={-14} start={s2 + 10} />
      <Sheet label="Report" x={1600} y={180} rot={12} start={s2 + 30} />
      <Sheet label="Votes" x={1180} y={500} rot={8} start={s2 + 50} />
    </Scene>
  );
};

const Today = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s2 = said("today", 1);
  const doc = (src: string, label: string, i: number) => {
    const drop = spring({ frame: frame - s2 - i * 18, fps, config: { damping: 13 } });
    return (
      <div style={{ textAlign: "center", translate: `0 ${(1 - drop) * -500}px`, rotate: `${(i ? 4 : -5) * drop}deg`, opacity: drop > 0.01 ? 1 : 0 }}>
        <Img src={staticFile(src)} style={{ height: 600, boxShadow: "0 14px 30px rgba(30,42,51,.22)", border: `2px solid ${C.ink}` }} />
        <Hand size={44} style={{ marginTop: 14 }}>{label}</Hand>
      </div>
    );
  };
  return (
    <Scene id="today">
      <div style={{ display: "flex", alignItems: "center", gap: 70, height: "100%" }}>
        <div style={{ width: 430, textAlign: "center" }}>
          <Sam mood="worried" size={460} />
          <Hand size={58} style={{ marginTop: 6 }}>Sam, today</Hand>
          <div style={{ fontSize: 28, color: C.muted, marginTop: 8, opacity: fadeIn(frame, 20) }}>Example resident. Real records for 245 Eglinton Ave E.</div>
        </div>
        {doc("staff-report-01.png", "30-page staff report", 0)}
        {doc("agenda-page-1.png", "agenda item page", 1)}
      </div>
    </Scene>
  );
};

const DEMO = ["demo-replay", "demo-address", "demo-detail", "demo-alerts", "demo-final"];
const MOOD: Record<string, Mood> = { "demo-replay": "neutral", "demo-address": "thinking", "demo-detail": "thinking", "demo-alerts": "surprised", "demo-final": "happy" };
const Demo = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS + at("demo-replay");
  const id = [...DEMO].reverse().find((d) => at(d) <= t) ?? DEMO[0];
  const alertsFrame = f(at("demo-alerts") - at("demo-replay") + T["demo-alerts"].sentences[1].start + 2.5);
  const stamp = frame < alertsFrame ? "8 July 2026" : "30 July 2026";
  return (
    <Paper>
      <div style={{ position: "absolute", left: 140, top: 60, width: 540, height: 960, borderRadius: 48, overflow: "hidden", border: `14px solid ${C.ink}`, background: C.white }}>
        <Video src={staticFile("demo.webm")} trimBefore={f(at("demo-replay"))} style={{ width: "100%", height: "100%" }} muted />
      </div>
      <Pop at={20} style={{ position: "absolute", left: 800, top: 70, rotate: "-4deg", border: `5px solid ${C.amber}`, borderRadius: 14, padding: "6px 22px" }}>
        <Hand size={46} color={C.amber}>Replay: records as of {stamp}</Hand>
      </Pop>
      <div style={{ position: "absolute", left: 800, top: 200, width: 640, fontSize: 50, lineHeight: 1.3 }}>{sentenceAt(id, t - at(id))}</div>
      <div style={{ position: "absolute", right: 90, bottom: 40 }}>
        <Sam mood={MOOD[id]} size={460} buzzAt={[alertsFrame, alertsFrame + 20]} />
      </div>
      {DEMO.map((d) => (
        <Sequence key={d} from={f(at(d) - at("demo-replay"))}><Audio src={staticFile(`vo/${d}.mp3`)} /></Sequence>
      ))}
    </Paper>
  );
};

const ICONS = [
  // moon and stars: nightly refresh
  "M70 20 A50 50 0 1 0 120 90 A40 40 0 0 1 70 20 Z M130 30 l0 18 M121 39 l18 0 M150 70 l0 12 M144 76 l12 0",
  // cloud: free static hosting
  "M40 110 Q10 110 14 82 Q16 58 44 60 Q50 26 86 30 Q118 32 122 62 Q152 60 150 88 Q148 110 120 110 Z M82 96 L82 64 M68 78 L82 64 L96 78",
  // phone with signal: connect a number
  "M50 20 L104 20 Q114 20 114 30 L114 126 Q114 136 104 136 L50 136 Q40 136 40 126 L40 30 Q40 20 50 20 Z M70 120 L84 120 M128 50 Q140 64 128 78 M140 38 Q160 64 140 90",
];
const STEPS = [["Refresh", "A nightly script pulls the city's open data"], ["Host", "Static files, free to host. No server, no database"], ["Connect", "A text-message number points at the same reply code"]];

const Setup = () => {
  const s3 = said("setup", 2);
  return (
    <Scene id="setup">
      <Pop at={6}><Hand size={96}>Simple for a city to set up</Hand></Pop>
      <div style={{ fontSize: 34, color: C.muted, marginTop: 14, width: 1250, opacity: fadeIn(useCurrentFrame(), 20) }}>
        City of Toronto open data and agenda pages. No AI writes the replies. Ward lookup never wrong on 2,000 real addresses.
      </div>
      <div style={{ display: "flex", gap: 60, marginTop: 50, width: 1300 }}>
        {STEPS.map(([title, body], i) => (
          <div key={title} style={{ flex: 1, opacity: fadeIn(useCurrentFrame(), s3 + i * 24) }}>
            <svg width={170} height={150} viewBox="0 0 170 150" style={{ overflow: "visible" }}>
              <defs><Rough id={`icon-${i}`} /></defs>
              <g filter={`url(#icon-${i})`}><Draw d={ICONS[i]} start={s3 + i * 24} len={28} color={C.civic} width={7} /></g>
            </svg>
            <Hand size={54}>{i + 1}. {title}</Hand>
            <div style={{ fontSize: 32, color: C.muted, lineHeight: 1.3, marginTop: 6 }}>{body}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 190 }}><Sam mood="happy" size={400} enterAt={s3 + 80} /></div>
    </Scene>
  );
};

const CITIES: [string, number, number][] = [["Vancouver", 60, 330], ["Calgary", 300, 260], ["Winnipeg", 560, 300], ["Waterloo", 800, 230], ["Toronto", 990, 290], ["Ottawa", 1180, 220], ["Montréal", 1370, 270], ["Halifax", 1560, 210]];
const Next = () => {
  const frame = useCurrentFrame();
  return (
    <Scene id="next">
      <Pop at={6}><Hand size={96}>Any city can adapt it</Hand></Pop>
      <div style={{ fontSize: 38, marginTop: 10, opacity: fadeIn(frame, 16) }}>Change one data step: where its council votes and addresses come from.</div>
      <svg width={1700} height={520} style={{ position: "absolute", left: 110, top: 270, overflow: "visible" }}>
        <defs><Rough id="land" scale={3} /></defs>
        <g filter="url(#land)"><Draw d="M0 430 Q200 380 420 420 T860 400 T1300 420 T1700 390" start={20} len={40} color={C.civic} width={6} /></g>
        {CITIES.map(([name, x, y], i) => {
          const s = spring({ frame: frame - 40 - i * 7, fps: FPS, config: { damping: 9 } });
          return (
            <g key={name} style={{ translate: `${x}px ${y}px` }} opacity={s > 0.01 ? 1 : 0}>
              <g style={{ scale: String(s), transformOrigin: "0px 60px" }}>
                <path d="M0 60 C-30 20 -28 -10 0 -10 C28 -10 30 20 0 60 Z" fill={name === "Toronto" ? C.amber : C.civic} stroke={C.ink} strokeWidth={4} />
                <circle cy={10} r={9} fill={C.paper} />
              </g>
              <text y={-26} textAnchor="middle" fontFamily={HAND} fontSize={36} fill={C.ink} opacity={s}>{name}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 140, bottom: 200, fontSize: 30, color: C.muted, opacity: fadeIn(frame, said("next", 1)) }}>
        Demo: real Toronto records from July 2026, replayed and labelled, because council is between terms.
      </div>
    </Scene>
  );
};

const End = () => {
  const frame = useCurrentFrame();
  const swipe = interpolate(frame, [24, 44], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  return (
    <Scene id="end">
      <div style={{ position: "absolute", left: 160, top: 250 }}>
        <Pop at={4}><Hand size={160}>Text City Hall</Hand></Pop>
        <div style={{ position: "relative", display: "inline-block", marginTop: 26 }}>
          <div style={{ position: "absolute", left: -10, right: -10, top: 18, bottom: 4, background: "rgba(201,138,0,.32)", scale: `${swipe} 1`, transformOrigin: "left", rotate: "-1deg" }} />
          <Hand size={76} color={C.civic} style={{ position: "relative" }}>ripasso.github.io/civichacks</Hand>
        </div>
      </div>
      <div style={{ position: "absolute", right: 200, top: 90 }}><Sam mood="happy" size={600} wave /></div>
    </Scene>
  );
};

const DEMO_SECS = at("end") - at("demo-replay");
const SCENES: [React.FC, number][] = [
  [Problem, secs("problem")], [Today, secs("today")], [Demo, DEMO_SECS], [Setup, secs("setup")], [Next, secs("next")], [End, secs("end") + 2],
];

const Main: React.FC = () => (
  <Series>
    {SCENES.map(([S, s], i) => (
      <Series.Sequence key={i} durationInFrames={f(s)}><S /></Series.Sequence>
    ))}
  </Series>
);

export const MyComposition = () => (
  <Composition id="Demo" component={Main} durationInFrames={SCENES.reduce((a, [, s]) => a + f(s), 0)} fps={FPS} width={1920} height={1080} />
);
