# CIVIC Hack 2026 — standing instructions

Apply on every prompt, without being asked. Skills live in `.claude/skills/`.

## Which skill, when

- **Any code** (write, fix, refactor, review, pick a dependency): follow
  `ponytail` — smallest change that fully works. Review with `ponytail-review`.
- **Any UI** (new screen, component, styling, layout): load `frontend-design`
  before writing it, then `impeccable` to critique/polish before calling it done.
- **Demo video**: use the `remotion-*` skills (start at `remotion-best-practices`).

Load the skill with the Skill tool before starting the work it covers; do not
work from memory of it.

## Hackathon rules that bind every change

- Hard stop Sat 14 Nov, 10 am ET: no code, generation or edits after that.
- Judges penalize unexplained generated code: keep code simple enough for the
  team to explain, and say in plain words what each change does.
- Every new library, dataset, borrowed snippet or AI-assisted piece gets a line
  in the README references (name, version, licence, how it was used/verified).
- Main features must really work on real data, not be mocked; state data
  limits openly.
- Users are residents and municipal staff: plain language, accessible design.

Scoring and schedule: see `README.md`. Briefs and template: `docs/briefs/`.
