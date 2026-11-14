# CIVIC Hack 2026

Team repo for [CIVIC Hack 2026](https://civic-hack-2026.devpost.com/) —
Future Cities Institute, University of Waterloo. 36 hours, online,
12–14 November 2026.

**Final challenge: Making municipal decisions easier to understand** — see
`docs/challenge.md`. It was one of five municipal problems, chosen by vote at the
2026 State of Canada's Cities Summit and revealed at launch (Thu 12 Nov,
6 pm ET). Build starts 7 pm ET Thursday; **all building stops Sat 14 Nov,
10 am ET**, when the Devpost submission is due.

## Submission checklist (all required, all due Sat 10 am ET)

- [ ] Link to this repo — *commits will be checked*
- [ ] Demo video, 2–3 min — over 3 min is not considered
- [ ] Municipal Readiness Report, one page (PDF in this repo is fine)
- [ ] Short description: problem, who it's for, solution, what's next

Working prototype link is welcome, not required.

## Scoring: 100 points

| Part | Points | Criteria |
|---|---|---|
| Project | 40 | problem & stakeholders 10 · quality/functionality 15 · design, clarity, feasibility 10 · impact 5 |
| Software design | 20 | requirements + UML 5 · architecture rationale & scalability 5 · can explain own code incl. AI-generated 5 · cite code/libraries/AI 5 |
| Presentation | 40 | readiness report 20 · demo video 20 |

Presentation is worth as much as the build, and the software-design block
is 20 points of documentation most hackathons don't ask for.

## Layout

- `docs/briefs/` — the five challenge briefs and the official submission
  template, downloaded from
  [fciprojects.ca](https://fciprojects.ca/hackathons/2026-civic-hack/)
- `.claude/skills/` — vendored Claude Code skills, see its README

## Key times (ET)

Thu 3 pm vote closes · Thu 6 pm launch & reveal · Thu 7 pm build starts ·
Fri 8 am / 3 pm / 6 pm checkpoints · Fri 8:30–10 am live from the Summit
(*what they say is the brief for the next 24 hours*) · Fri 10 am–4 pm
mentors on Discord · Sat 8 am final checkpoint · **Sat 10 am hard stop** ·
Sat 12 pm top five · Sat 12:30 pm 5-min pitch + 3-min Q&A

## References

Data (City of Toronto Open Data, Open Government Licence – Toronto; retrieved 13 Nov 2026 by `pipeline/build_data.py`):
- [Members of Toronto City Council – Voting Record](https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/) (2022–2026 term; last vote 5 Aug 2026) — item timelines and recorded vote results. Recorded votes only: not every decision has one.
- [Address Points (Municipal) – Toronto One Address Repository](https://open.toronto.ca/dataset/address-points-municipal-toronto-one-address-repository/) — address → ward lookup.
- City of Toronto council agenda items 2026.NY34.12, 2026.TE34.21, 2026.PH30.3 (`secure.toronto.ca/council/agenda-item.do?item=<ITEM>`), retrieved 13 Nov 2026 — saved as PDF printouts in `data/raw/` (Chrome "Save as PDF"; the site blocks automated downloads). Public council records, © City of Toronto; the pages state no licence and link to no terms of use, and they are not on the Open Data portal, so the Open Government Licence – Toronto is not confirmed to cover them.

Code: Python 3 standard library only (`csv`, `json`, `urllib`).

AI assistance: Claude Code helped write `pipeline/build_data.py`; outputs checked by the asserts in the script and by hand against the source CSVs.
- City of Toronto agenda item pages for 2026.NY34.12, 2026.TE34.21, 2026.PH30.3 (`data/raw/`) and the staff reports they link (downloaded from www.toronto.ca/legdocs) — council decision text, tracking status, ward, and staff recommendations for the "what changed" view.

Tools: `pdftotext` (Poppler, GPL) for PDF text extraction; Node.js built-in test runner for `tests/`.
- [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) typeface (Braille Institute, SIL Open Font Licence) via Google Fonts — chosen for low-vision readers.

## Run it

```bash
python3 pipeline/build_data.py   # rebuild site/data from open data + data/raw
node --test tests/*.test.js      # 8 tests, incl. 2,000 real addresses
cd site && python3 -m http.server 8000   # simulator at http://localhost:8000
```

## Demo video

`docs/text-city-hall-demo.mp4` (2:03). Made with [Remotion](https://www.remotion.dev/) 4.0.543 (Remotion License, free for individuals and small teams) from a real browser recording of the live site: `video/record-demo.cjs` records it, `video/src/Composition.tsx` adds the cards and captions. Rebuild: `cd video && npm i && node record-demo.cjs && npx remotion render Demo out/text-city-hall-demo.mp4`.
