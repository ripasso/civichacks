import { AbsoluteFill, Composition, Easing, Img, Series, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import marks from "./demo-marks.json";
import script from "./script.json";

// Same palette as the site.
const C = { paper: "#F3F5F4", ink: "#1E2A33", muted: "#52616B", civic: "#2E5E4E", amber: "#C98A00", white: "#FFFFFF" };
const FONT = "Atkinson Hyperlegible, Inter, DejaVu Sans, sans-serif";
const FPS = 30;
const WPS = 2.4; // narration pace: 144 words per minute
const words = (t: string) => t.split(/\s+/).length;
const vo = (id: string) => script.find((x) => x.id === id)!.vo;
const secs = (id: string) => words(vo(id).join(" ")) / WPS + 1.2;
const at = (id: string) => marks.find((m) => m.id === id)!.t;
const f = (sec: number) => Math.round(sec * FPS);

const fadeIn = (frame: number, delay = 0) =>
  interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

// The narration sentence being spoken at `sec` seconds into a script section (time split by word count).
const sentenceAt = (lines: string[], sec: number) => {
  let t = 0.6;
  for (const l of lines) { t += words(l) / WPS; if (sec < t) return l; }
  return lines[lines.length - 1];
};

const CaptionBar: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "28px 160px 44px", background: C.ink, color: C.white, fontSize: 40, lineHeight: 1.3, minHeight: 170 }}>
      {sentenceAt(vo(id), frame / FPS)}
    </div>
  );
};

const Scene: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <AbsoluteFill style={{ background: C.paper, color: C.ink, fontFamily: FONT }}>
    <AbsoluteFill style={{ padding: "100px 160px 230px", justifyContent: "center" }}>{children}</AbsoluteFill>
    <CaptionBar id={id} />
  </AbsoluteFill>
);

const Line: React.FC<{ i?: number; size?: number; color?: string; bold?: boolean; children: React.ReactNode }> = ({ i = 0, size = 56, color = C.ink, bold, children }) => {
  const frame = useCurrentFrame();
  return <div style={{ fontSize: size, color, fontWeight: bold ? 700 : 400, lineHeight: 1.2, marginBottom: 32, maxWidth: 1600, opacity: fadeIn(frame, i * 18) }}>{children}</div>;
};

const Problem = () => (
  <Scene id="problem">
    <Line size={120} bold>Text City Hall</Line>
    <Line i={1} size={56} color={C.muted}>CIVIC Hack 2026 challenge: making municipal decisions easier to understand</Line>
  </Scene>
);

const Today = () => {
  const frame = useCurrentFrame();
  const doc = (src: string, label: string, i: number) => (
    <div style={{ opacity: fadeIn(frame, 30 + i * 25), textAlign: "center" }}>
      <Img src={staticFile(src)} style={{ height: 560, boxShadow: "0 12px 30px rgba(30,42,51,.25)", border: `1px solid ${C.muted}` }} />
      <div style={{ fontSize: 36, marginTop: 18 }}>{label}</div>
    </div>
  );
  return (
    <Scene id="today">
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ width: 560 }}>
          <Line size={64} bold>Today</Line>
          <Line i={1} size={40} color={C.muted}>Sam is an example resident. The documents are the real records for 245 Eglinton Avenue East.</Line>
        </div>
        {doc("staff-report-01.png", "Staff report, 30 pages", 0)}
        {doc("agenda-page-1.png", "Agenda item page", 1)}
      </div>
    </Scene>
  );
};

const DEMO = ["demo-replay", "demo-address", "demo-detail", "demo-alerts", "demo-final"];
const Demo = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS + at("demo-replay");
  const id = [...DEMO].reverse().find((d) => at(d) <= t) ?? DEMO[0];
  const line = sentenceAt(vo(id), t - at(id));
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, flexDirection: "row", alignItems: "center", padding: "0 140px", gap: 110 }}>
      <div style={{ width: 540, height: 960, borderRadius: 48, overflow: "hidden", border: `14px solid ${C.ink}`, flexShrink: 0 }}>
        <Video src={staticFile("demo.webm")} trimBefore={f(at("demo-replay"))} style={{ width: "100%", height: "100%" }} muted />
      </div>
      <div style={{ fontSize: 54, lineHeight: 1.3, color: C.ink, maxWidth: 980 }}>{line}</div>
    </AbsoluteFill>
  );
};

const Col: React.FC<{ title: string; items: string[]; color: string; i: number }> = ({ title, items, color, i }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ flex: 1, borderTop: `8px solid ${color}`, paddingTop: 24, opacity: fadeIn(frame, i * 25) }}>
      <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 20 }}>{title}</div>
      {items.map((x) => <div key={x} style={{ fontSize: 36, lineHeight: 1.3, marginBottom: 14 }}>{x}</div>)}
    </div>
  );
};

const Real = () => (
  <Scene id="real">
    <div style={{ display: "flex", gap: 70 }}>
      <Col i={0} color={C.ink} title="Data" items={["City of Toronto open data: council voting record (to 5 Aug 2026), address points", "City agenda item pages and staff reports", "No AI writes the replies"]} />
      <Col i={1} color={C.civic} title="Working today" items={["The full text conversation, in the browser", "Real records, every reply linked to its source", "Ward lookup: 0 wrong on 2,000 real addresses"]} />
      <Col i={2} color={C.amber} title="Not built yet" items={["A real phone number", "Live alerts (shown here as a labelled replay)", "Reading open comment periods from city pages"]} />
    </div>
  </Scene>
);

const Next = () => (
  <Scene id="next">
    <Line size={72} bold>To pilot it, a city needs</Line>
    <Line i={1}>1. A text-message number connected to this code</Line>
    <Line i={2}>2. A nightly refresh of its open data</Line>
    <Line i={3}>3. Staff to review the reply wording</Line>
    <Line i={4} size={44} color={C.muted}>Any city with open council data can adapt it.</Line>
  </Scene>
);

const End = () => (
  <Scene id="end">
    <Line size={110} bold>Text City Hall</Line>
    <Line i={1} size={64} color={C.civic} bold>ripasso.github.io/civichacks</Line>
  </Scene>
);

const DEMO_SECS = at("end") - at("demo-replay");
const SCENES: [React.FC, number][] = [
  [Problem, secs("problem")], [Today, secs("today")], [Demo, DEMO_SECS], [Real, secs("real")], [Next, secs("next")], [End, secs("end") + 3],
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
