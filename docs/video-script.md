# Demo video narration

The narration in [`text-city-hall-demo.mp4`](text-city-hall-demo.mp4) (2:23) was generated with ElevenLabs (voice "Chris", model eleven_v3) from this script. The captions are the same text, timed to the voice. To re-record it in your own voice, read each line from the time shown.

| Starts | On screen | Narration |
|---|---|---|
| 0:00 | Title; Sam (doodle) confused, papers fly in | The CIVIC Hack challenge: making municipal decisions easier to understand. Toronto council decisions change streets every week, but the record is spread across agendas, staff reports and votes, and most residents only hear about a decision once it's made. |
| 0:17 | Sam worried; the real 30-page staff report and agenda page drop in | Take Sam, who rents on Eglinton Avenue East and works shifts. To learn what happened to the two 59-storey towers proposed on their street, Sam would need a thirty-page staff report, this agenda page, and votes from two different meetings. |
| 0:32 | Live demo, replay stamp 8 July 2026 | Here's the same thing with Text City Hall. We're replaying the city's real records as they stood on July 8th, the day after North York Community Council met. |
| 0:41 | Sam texts 245 Eglinton Ave E | Sam texts the address. No app, no account, any phone. It finds the ward in the city's own address data and lists the recent decisions there. |
| 0:50 | Sam texts 1 | Sam replies 1. On July 7th, community council passed an amendment six to nothing, but the motion to adopt the item lost, two to four. No comment period is confirmed, so it says so. It never guesses a deadline from a meeting date. Every reply links to the official record. |
| 1:08 | Sam texts WATCH; date moves to 30 July; Sam's phone buzzes | Sam texts WATCH. On July 30th, City Council votes, and Sam gets two texts: Eglinton, amended twenty-five to one, and a Millwood Road rezoning in the same ward, amended twelve to eleven. |
| 1:21 | Sam texts 1 again, Sam happy | Reply 1 again, and Sam sees the outcome: City Council adopted it, with amendments. |
| 1:28 | Simple for a city to set up: Refresh, Host, Connect icons draw on | Everything you just saw runs on City of Toronto open data and agenda pages. No AI writes the replies, and on two thousand real addresses the ward lookup was never wrong. Setting it up is simple. There's no server and no database to run. A nightly script refreshes the city's open data, the site is free to host, and a city connects a text-message number to the same reply code, so residents get exactly this conversation. It costs a few cents per conversation. |
| 1:58 | Any city can adapt it: city pins pop up | Any city that publishes council votes and addresses can adapt it by changing one data step. Council is between terms after the election, so this demo replays real records from July, clearly labelled. The goal: residents hear about decisions while they can still have a say. |
| 2:16 | End card, Sam waves | Try it at ripasso.github.io/civichacks. |

## How it meets the judging guidance

Built from the organizers' *Tips for your demo video* and the 20-point demo video rubric ("clearly explains the problem, users and value; demonstrates the core workflow and outputs; distinguishes working features from plans; audio and visuals understandable"):

- **Problem in the first 20 seconds:** the challenge, who is affected, what goes wrong.
- **Solution working by 0:35**, inside their 90-second guideline.
- **One resident, one task, start to finish:** Sam (an example resident, labelled on screen) follows the real 245 Eglinton Ave E decision.
- **What changes:** the real 30-page staff report and agenda page, then the same answer in two texts.
- **Names the data:** City of Toronto open data and agenda pages; no AI writes replies.
- **Working vs plans:** what you see runs on real records; going live is three setup steps for a city (refresh, host, connect a number). The replay is explained and labelled.
- **Path forward:** setup, cost, and how any city adapts it.
- **Facts checked against the records:** two 59-storey towers and 30 pages (staff report page 1); votes 2-4, 6-0, 25-1, 12-11 (voting record); 0 wrong of 2,000 addresses (tests).
- **Privacy:** only page 1 of each document is shown, which lists no residents' names.
