import { AbsoluteFill, Composition, Easing, Img, Sequence, Series, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import marks from "./demo-marks.json";
import script from "./script.json";
import timing from "./vo-timing.json";

// Same palette as the site.
const C = { paper: "#F3F5F4", ink: "#1E2A33", muted: "#52616B", civic: "#2E5E4E", amber: "#C98A00", white: "#FFFFFF" };
const FONT = "Atkinson Hyperlegible, Inter, DejaVu Sans, sans-serif";
const FPS = 30;
const LEAD = 0.4; // seconds of quiet before each scene's narration
const vo = (id: string) => script.find((x) => x.id === id)!.vo;
const T = timing as Record<string, { duration: number; sentences: { start: number; end: number }[] }>;
const secs = (id: string) => LEAD + T[id].duration + 0.8;
const at = (id: string) => marks.find((m) => m.id === id)!.t;
const f = (sec: number) => Math.round(sec * FPS);

const fadeIn = (frame: number, delay = 0) =>
  interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

// The narration sentence being spoken `sec` seconds after a section's voice starts (ElevenLabs timings).
const sentenceAt = (id: string, sec: number) => {
  const i = T[id].sentences.findIndex((q, n) => sec < (T[id].sentences[n + 1]?.start ?? Infinity));
  return vo(id)[Math.max(0, i)];
};

const CaptionBar: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "28px 160px 44px", background: C.ink, color: C.white, fontSize: 40, lineHeight: 1.3, minHeight: 170 }}>
      {sentenceAt(id, frame / FPS - LEAD)}
    </div>
  );
};

const Scene: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <AbsoluteFill style={{ background: C.paper, color: C.ink, fontFamily: FONT }}>
    <AbsoluteFill style={{ padding: "100px 160px 230px", justifyContent: "center" }}>{children}</AbsoluteFill>
    <CaptionBar id={id} />
    <Sequence from={f(LEAD)}><Audio src={staticFile(`vo/${id}.mp3`)} /></Sequence>
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
  const line = sentenceAt(id, t - at(id));
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, flexDirection: "row", alignItems: "center", padding: "0 140px", gap: 110 }}>
      <div style={{ width: 540, height: 960, borderRadius: 48, overflow: "hidden", border: `14px solid ${C.ink}`, flexShrink: 0 }}>
        <Video src={staticFile("demo.webm")} trimBefore={f(at("demo-replay"))} style={{ width: "100%", height: "100%" }} muted />
      </div>
      <div style={{ fontSize: 54, lineHeight: 1.3, color: C.ink, maxWidth: 980 }}>{line}</div>
      {DEMO.map((d) => (
        <Sequence key={d} from={f(at(d) - at("demo-replay"))}><Audio src={staticFile(`vo/${d}.mp3`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Step: React.FC<{ n: number; title: string; body: string }> = ({ n, title, body }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ flex: 1, borderTop: `8px solid ${C.civic}`, paddingTop: 24, opacity: fadeIn(frame, f(T.setup.sentences[2].start + LEAD) + n * 20) }}>
      <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 14 }}>{n}. {title}</div>
      <div style={{ fontSize: 34, lineHeight: 1.3, color: C.muted }}>{body}</div>
    </div>
  );
};

const Setup = () => (
  <Scene id="setup">
    <Line size={72} bold>Simple for a city to set up</Line>
    <Line i={1} size={40} color={C.muted}>City of Toronto open data and agenda pages. No AI writes the replies. Ward lookup never wrong on 2,000 real addresses.</Line>
    <div style={{ display: "flex", gap: 60, marginTop: 24 }}>
      <Step n={1} title="Refresh" body="A nightly script pulls the city's open data" />
      <Step n={2} title="Host" body="Static files, free to host. No server, no database" />
      <Step n={3} title="Connect" body="A text-message number points at the same reply code" />
    </div>
  </Scene>
);

const Next = () => (
  <Scene id="next">
    <Line size={72} bold>Any city can adapt it</Line>
    <Line i={1}>Change one data step: council votes and addresses</Line>
    <Line i={2} size={44} color={C.muted}>Demo: real Toronto records from July 2026, replayed and labelled, because council is between terms</Line>
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
