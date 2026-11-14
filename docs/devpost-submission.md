# Devpost submission: copy and paste

Deadline: **Saturday 14 November, 10:00 am ET**. Late submissions are not considered.

## 1. YouTube (about 5 minutes, then processing time)

1. Go to studio.youtube.com, then **Create → Upload videos**, and choose `docs/text-city-hall-demo.mp4`.
2. **Title:** `Text City Hall – CIVIC Hack 2026 demo`
3. **Description:**
   ```
   Text a Toronto address, get what city council decided there. Built for CIVIC Hack 2026 (Future Cities Institute, University of Waterloo), challenge: Making municipal decisions easier to understand.
   Try it: https://ripasso.github.io/civichacks/
   Code: https://github.com/ripasso/civichacks
   ```
4. **Audience:** "No, it's not made for kids".
5. **Subtitles:** add language English, then **Upload file → With timing**, and choose `docs/text-city-hall-demo.en.srt`.
6. **Visibility: Unlisted.** Save, and copy the link.
7. Open the link in a **private window, signed out**, and play it.

## 2. Devpost (civic-hack-2026.devpost.com → Enter a submission / My projects)

**Project name**
```
Text City Hall
```

**Elevator pitch / tagline**
```
Text a Toronto address, get what city council decided there: how each body voted and the official link. No app, any phone.
```

**About the project** (paste into the story box; Devpost uses Markdown)
```
## The problem
Council decisions change streets every week, but the record is spread across agendas, 30-page staff reports and votes, in planning language. Most residents only hear about a decision once it's made, and renters, newcomers, seniors and shift workers are the least likely to take part.

## Who it's for
Residents who never read a council agenda, on any phone, with no app or account. The clerk's or communications office runs it; councillors' offices share it.

## What it does
Text a street address, a building name ("CN Tower") or a ward number. The reply lists the ward's recent council decisions; reply with a number for how each body voted and the link to the official record. Text WATCH to get a text whenever council votes on something in your ward.

## How it stays accurate
Everything comes from City of Toronto open data (council voting record, address points) and agenda pages. No AI writes the replies. It never guesses: an address near a ward boundary is asked for its ward, and no comment deadline is shown unless the official page confirms it. Tested on 2,000 real addresses: 1,989 correct, 11 asked for their ward, 0 wrong.

## Simple for a city to set up
No server and no database. A nightly script refreshes the open data, the page is free static hosting, and a text-message number connects to the same reply code. A few cents per conversation. Any city that publishes council votes and addresses can adapt it by changing one data step.

## How I built it
Python (standard library) pipeline over the city's CSVs and agenda PDFs; one dependency-free JavaScript module for the whole conversation, shared by the web simulator and the SMS channel; 10 automated tests on every push; GitHub Pages. Requirements, UML and architecture: docs/design.md in the repo.

## What's next
A one-ward pilot on development applications, promoted on the statutory notice signs; then confirmed comment periods from the city's item pages, and French and other languages.

Council is between terms after the October 2026 election, so the demo replays real July 2026 records, clearly labelled.
```

**Built with** (tags)
```
python, javascript, node.js, github-pages, toronto-open-data, poppler, remotion, elevenlabs, claude-code
```

**"Try it out" links**
```
https://ripasso.github.io/civichacks/
https://github.com/ripasso/civichacks
```

**Video demo link:** your YouTube link from step 1.

**Image gallery** (optional, recommended): take screenshots of the live site after texting "245 Eglinton Ave E", or of frames from the video.

## 3. Required submission items (hackathon questions)

| Item | What to give |
|---|---|
| Code repository | `https://github.com/ripasso/civichacks` |
| Working prototype (optional) | `https://ripasso.github.io/civichacks/` |
| Demo video | Your YouTube link |
| Municipal Readiness Report (1 page) | `https://github.com/ripasso/civichacks/blob/krishna/eager-rubin-is48e3/docs/municipal-readiness-report.pdf` (or upload `docs/municipal-readiness-report.pdf`) |
| Short description | The "About the project" text above, or `docs/devpost-description.md` |
| Team | Krishna Nigam (solo), University of Waterloo, Computer Science |

## 4. Before you press Submit
- [ ] The video link plays in a signed-out private window
- [ ] The prototype link opens and replies to "245 Eglinton Ave E"
- [ ] The report link opens the PDF
- [ ] Submitted before 10:00 am ET, and the project page shows "Submitted"
