# Text City Hall

**Toronto council decisions, by text message.**

## The problem
Council decisions change streets every week, but the record is spread across agendas, 30-page staff reports and votes, in planning language. Most residents only hear about a decision once it's made, and renters, newcomers, seniors and shift workers are the least likely to take part.

## Who it's for
Residents who never read a council agenda, on any phone, with no app or account. The clerk's or communications office runs it; councillors' offices share it.

## Our solution
Text a street address, a building name ("CN Tower") or a ward number. The reply lists the ward's recent council decisions; reply with a number for how each body voted and the link to the official record. Text WATCH to get a text whenever council votes on something in your ward.

Everything comes from City of Toronto open data and agenda pages. No AI writes the replies. It never guesses: an address near a ward boundary is asked for its ward, and no comment deadline is shown unless the official page confirms it. Tested on 2,000 real addresses: 0 wrong wards.

Simple for a city to set up: no server and no database. A nightly script refreshes the open data, the page is free static hosting, and a text-message number connects to the same reply code.

**Try it:** https://ripasso.github.io/civichacks/
(Council is between terms after the October 2026 election, so the demo replays real July 2026 records, clearly labelled.)

## What's next
Pilot in one ward on development applications, promoted on the statutory notice signs. Then confirmed comment periods from the city's item pages, and French and other languages.

## Built with
Python, Node.js, Poppler, City of Toronto Open Data, GitHub Pages, Remotion, ElevenLabs, Claude Code.
