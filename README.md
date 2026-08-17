# Week 01: App ideas + GitHub onboarding (template)

**Mobile Systems 2026 · Week 01**  
**GitHub template:** https://github.com/claudioscheer/mobile-dev-class-2026-week-01-app-ideas

This template is markdown only. No app code required.

| Field | Value |
| --- | --- |
| **Deadline** | **2026-08-09 23:59 America/Sao_Paulo (BRT)** |
| **Your repo must be** | **Private** |
| **Invite collaborator** | **`claudioscheer`** |
| **Points** | 50 |
| **What we grade** | Last commit on `main` **≤ deadline** (commits after deadline are ignored) |

Full brief (when using the course hub): `evaluations/week-01-app-ideas/ASSIGNMENT.md`

---

## Hard rules

```text
No eligible commit on main by the deadline  →  0
Commits after the deadline                  →  ignored
Public student repo                         →  0
claudioscheer cannot access the repo        →  0 (evaluation disregarded)
Bad / missing private repo URL on form      →  0
```

You do **not** submit a commit SHA. The instructor grades the last `main` commit at or before the deadline and records that SHA when reviewing.

1. Create this as a **private** repository (Use this template → **Private**).
2. Invite **`claudioscheer`** (Settings → Collaborators) and confirm access.
3. Fill [`IDEAS.md`](./IDEAS.md) with **three** app ideas.
4. Commit and push to **`main` on your private repo**, keep CI green before the deadline.
5. Submit the course form with **private repo URL** before the deadline.

After the deadline, the public template will be **closed / set private**. Late commits on your repo still **do not count**.

---

## What you do

1. **Private** repo from this template.
2. Collaborator: **`claudioscheer`**.
3. Complete [`IDEAS.md`](./IDEAS.md).
4. Commit & push to `main` → CI green by **2026-08-09 23:59 BRT**.
5. Form: name, GitHub username, week `01`, private repo URL.

## Stack note (semester)

**React Native (Expo) + TypeScript.**  
Do **not** install or code React Native for Week 01.

## Checks

No dependencies:

```bash
node scripts/public-checks.mjs
# or: npm run check
```

CI: `node:20-alpine`, no `npm install`.

## Submit

| Field | Example |
| --- | --- |
| Name | your name |
| GitHub username | your handle |
| Week | `01` |
| Private repo URL | `https://github.com/you/your-private-week01` |
