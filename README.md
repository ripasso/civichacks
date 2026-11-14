# Text City Hall

**Toronto council decisions, by text message.** Text a street address, building name or ward number; get back the recent council decisions there, how council voted, and a link to the official record. Text WATCH to hear when council votes on something in your ward.

Built for [CIVIC Hack 2026](https://civic-hack-2026.devpost.com/) (Future Cities Institute, University of Waterloo), challenge: *Making municipal decisions easier to understand*.

| | |
|---|---|
| **Try it** | https://ripasso.github.io/civichacks/ |
| **Demo video** (2:23, narrated, captioned, animated) | [`docs/text-city-hall-demo.mp4`](docs/text-city-hall-demo.mp4) · script: [`docs/video-script.md`](docs/video-script.md) |
| **Municipal Readiness Report** (1 page) | [`docs/municipal-readiness-report.pdf`](docs/municipal-readiness-report.pdf) |
| **Requirements, UML, architecture, code walkthrough** | [`docs/design.md`](docs/design.md) |
| **Short description** | [`docs/devpost-description.md`](docs/devpost-description.md) |
| Challenge brief and notes | [`docs/challenge.md`](docs/challenge.md), [`docs/briefs/`](docs/briefs/) |

## How it works

```
City of Toronto open data ─┐
Agenda pages + reports ────┼─ pipeline/build_data.py (nightly) ─► site/data/*.json ─► reply() ─► web simulator / SMS
                           ┘
```

- **Only records, no AI in the replies.** Every reply is built from city data fields and ends with the official link.
- **Never guesses.** Address near a ward boundary → asks for the ward. Building name in two wards → asks. No comment deadline unless the official page confirms it.
- **Tested.** 10 tests run on every push, including 2,000 random real Toronto addresses: 1,989 correct, 11 asked for their ward, 0 wrong.
- **Simple for a city to run.** No server or database: a nightly script, static files (free hosting), and a text-message number pointed at the same `reply()` code.

## Run it

```bash
python3 pipeline/build_data.py          # rebuild site/data from open data + data/raw (needs pdftotext)
node --test tests/*.test.js             # 10 tests
cd site && python3 -m http.server 8000  # simulator at http://localhost:8000
```

## Repository

| Path | What |
|---|---|
| `pipeline/build_data.py` | Data pipeline (Python standard library + `pdftotext`) |
| `site/lib/reply.js` | The conversation: address/building/ward → decisions → details, WATCH, STOP, HELP |
| `site/index.html` | Web phone simulator (same `reply()` as SMS) |
| `site/data/` | Generated data: `items.json`, `streets.json`, `places.json` |
| `tests/` | Tests and the 2,000-address sample |
| `data/raw/` | Agenda item pages saved from toronto.ca (the site blocks automated downloads) |
| `video/` | Demo video source (recording, narration, composition) |
| `.github/workflows/pages.yml` | Tests, then publish `site/` on every push |
| `.claude/skills/` | Third-party Claude Code skills used as tools, not project code ([provenance](.claude/skills/README.md)) |

## References

**Data** (City of Toronto, [Open Government Licence – Toronto](https://open.toronto.ca/open-data-license/), retrieved 13 Nov 2026):
- [Members of Toronto City Council – Voting Record](https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/), 2022–2026 term (last vote 5 Aug 2026). Item timelines and vote results. Recorded votes only: not every decision has one.
- [Address Points (Municipal) – Toronto One Address Repository](https://open.toronto.ca/dataset/address-points-municipal-toronto-one-address-repository/). Address → ward, and `PLACE_NAME` for building names.
- Agenda item pages 2026.NY34.12, 2026.TE34.21, 2026.PH30.3 (saved as PDF in `data/raw/`; licence not stated on the pages) and the staff reports they link on `www.toronto.ca/legdocs`. Decision text, tracking status, ward, staff recommendations.
- Problem statistics quoted from the CIVIC Hack 2026 challenge brief (Ipsos and Municipal World; AMO).

**Software**

| Name | Version | Licence | Used for |
|---|---|---|---|
| Python | 3.13 | PSF | Pipeline (standard library only: `csv`, `json`, `urllib`, `difflib`, `subprocess`) |
| Node.js | 22.23 | MIT | Tests (built-in `node:test`), video tooling |
| Poppler `pdftotext` | 24.02 | GPL-2.0 | PDF text extraction (called as a program, not linked) |
| Playwright | 1.63 | Apache-2.0 | Screenshots and demo screen recording |
| Remotion | 4.0.543 | Remotion License (free for individuals and small teams) | Demo video |
| Patrick Hand font | – | SIL OFL 1.1 | Video headings (via `@fontsource/patrick-hand`) |
| Atkinson Hyperlegible | – | SIL OFL 1.1 | Typeface, via Google Fonts (Braille Institute, designed for low-vision readers) |
| GitHub Pages / Actions | – | GitHub terms | Hosting and CI |

No other libraries: `reply.js` and the web page have zero dependencies.

**Algorithms.** Ward lookup: per-street house-number ranges built from the address points, odd and even sides separate, refusing when ranges disagree. Recommendation diff: Python `difflib.SequenceMatcher` (pairing at ratio ≥ 0.6, then word-level opcodes).

**AI assistance.**
- **Claude Code** (Anthropic) helped write the pipeline, `reply.js`, tests, web page, documents and video tooling. Verification: the test suite, pipeline assertions, and script checks of every fact in the video and report against the records. Details and two bugs caught this way: [`docs/design.md`](docs/design.md#how-ai-assistance-was-used-and-verified).
- **ElevenLabs** (voice "Chris", model `eleven_v3`) generated the video narration from our script.
- No AI is used at runtime: residents' replies are never generated by a model.

## Timeline note

The first commit (12 Nov, 5:35 pm ET, before the 6 pm launch) contains only setup material: this README's hackathon notes, the organizers' published briefs, and the vendored Claude Code skills. All project code was written after launch; see `git log`.
