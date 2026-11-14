import { AbsoluteFill, Composition, Easing, Series, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import marks from "./demo-marks.json";

// Same palette as the site.
const C = { paper: "#F3F5F4", ink: "#1E2A33", muted: "#52616B", civic: "#2E5E4E", amber: "#C98A00" };
const FONT = "Atkinson Hyperlegible, Inter, DejaVu Sans, sans-serif";
const FPS = 30;
const TRIM = 2.5; // seconds of idle page before the first text
const DEMO_END = marks.find((m) => m.id === "end")!.t;

const fadeIn = (frame: number, delay = 0) =>
  interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

const Card: React.FC<{ lines: { text: string; size?: number; color?: string; weight?: number }[]; source?: string }> = ({ lines, source }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, color: C.ink, fontFamily: FONT, padding: "120px 160px", justifyContent: "center" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: l.size ?? 56, fontWeight: l.weight ?? 400, color: l.color ?? C.ink, lineHeight: 1.2, marginBottom: 36, maxWidth: 1500, opacity: fadeIn(frame, i * 20) }}>
          {l.text}
        </div>
      ))}
      {source && <div style={{ position: "absolute", left: 160, bottom: 90, fontSize: 30, color: C.muted, opacity: fadeIn(frame, 30) }}>{source}</div>}
    </AbsoluteFill>
  );
};

const CAPTIONS: Record<string, string> = {
  address: "Text any Toronto street address. It finds the ward in the city's own address data and lists the latest council decisions there.",
  detail: "Reply 1 for details: what happened at each meeting, how council voted, and the official link.",
  building: "Don't know the address? A building name works too.",
  ambiguous: "Two City Halls, in two different wards. It asks instead of guessing.",
  ward: "Or just text your ward number.",
  watch: "Text WATCH to get a text whenever council votes on something in your ward.",
  replay: "Replaying May to July 2026: the three updates a Ward 2 resident would have received.",
};

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS + TRIM;
  const current = [...marks].reverse().find((m) => CAPTIONS[m.id] && m.t <= t + 0.3) ?? marks[1];
  const since = Math.round((t - current.t) * FPS);
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT, flexDirection: "row", alignItems: "center", padding: "0 120px", gap: 100 }}>
      <div style={{ width: 540, height: 960, borderRadius: 48, overflow: "hidden", border: `14px solid ${C.ink}`, flexShrink: 0 }}>
        <Video src={staticFile("demo.webm")} trimBefore={Math.round(TRIM * FPS)} style={{ width: "100%", height: "100%" }} muted />
      </div>
      <div style={{ fontSize: 60, lineHeight: 1.25, color: C.ink, maxWidth: 1000, opacity: fadeIn(since) }}>{CAPTIONS[current.id]}</div>
    </AbsoluteFill>
  );
};

const s = (sec: number) => Math.round(sec * FPS);

export const Video_: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={s(6)}>
      <Card lines={[{ text: "Text City Hall", size: 132, weight: 700 }, { text: "Toronto council decisions, by text message.", size: 64, color: C.muted }]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(12)}>
      <Card
        lines={[{ text: "Only 20% of Canadians have ever taken part in a municipal public consultation.", size: 76, weight: 700 }, { text: "Most residents learn about a decision once it's made, or once construction starts.", size: 56, color: C.muted }]}
        source="Ipsos and Municipal World, cited in the CIVIC Hack 2026 challenge brief"
      />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(12)}>
      <Card lines={[{ text: "For people who never read a council agenda.", size: 84, weight: 700 }, { text: "Renters, newcomers, seniors, shift workers, people with limited data.", size: 56 }, { text: "Any phone that can text. No app, no account.", size: 56, color: C.civic, weight: 700 }]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(DEMO_END - TRIM)}>
      <Demo />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(18)}>
      <Card lines={[
        { text: "Built only from City of Toronto records. No AI writes the replies.", size: 64, weight: 700 },
        { text: "Tested on 2,000 real addresses: 1,989 matched the right ward, 11 near a boundary were asked for theirs, 0 were wrong.", size: 52 },
        { text: "No comment deadline is ever guessed from a meeting date.", size: 52 },
        { text: "Every reply ends with the link to the official record.", size: 52, color: C.civic, weight: 700 },
      ]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(16)}>
      <Card lines={[
        { text: "Ready to pilot", size: 84, weight: 700 },
        { text: "A city connects a text-message number to the same code and refreshes its open data each night.", size: 56 },
        { text: "Any city that publishes council votes and addresses can adapt it.", size: 56, color: C.muted },
      ]} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={s(10)}>
      <Card lines={[{ text: "Text City Hall", size: 110, weight: 700 }, { text: "Try it now: ripasso.github.io/civichacks", size: 64, color: C.civic, weight: 700 }, { text: "CIVIC Hack 2026", size: 44, color: C.muted }]} />
    </Series.Sequence>
  </Series>
);

const TOTAL = s(6 + 12 + 12 + (DEMO_END - TRIM) + 18 + 16 + 10);

export const MyComposition = () => (
  <Composition id="Demo" component={Video_} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
