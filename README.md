# OSINT Hub

A scenario-based index of public-source intelligence tools for research,
verification, and defensive intelligence workflows.

**51 tools · 8 guided workflows · 11 investigation categories · English + 繁中**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, `output: "export"`) |
| Styling | Tailwind CSS v4 |
| Search | Fuse.js (client-side fuzzy) |
| Data | Static JSON — `apps/web/data/` |
| Deployment | Vercel (static export) |

---

## Local Development

```bash
# 1. Install dependencies
cd apps/web
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:3000
```

---

## Build & Static Export

```bash
cd apps/web

# Type-check + lint
npm run lint

# Production build (outputs to apps/web/out/)
npm run build
```

The `out/` directory is a fully self-contained static site — no server required.
Serve it locally for a quick smoke test:

```bash
npx serve out
```

---

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Set **Root Directory** to `apps/web`.
4. Vercel auto-detects Next.js — no extra configuration needed.
5. (Optional) Add the environment variable:

   | Key | Example value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |

   This variable is used for sitemap and robots.txt generation.
   If omitted, it defaults to `https://osint-hub.vercel.app`.

---

## Data

| File | Description |
|---|---|
| `apps/web/data/tools.json` | 51 curated OSINT tools with bilingual descriptions |
| `apps/web/data/workflows.en.json` | 8 guided investigation workflows (English) |

### Add a new tool

Append a record to `tools.json` following the existing schema:

```json
{
  "id": "unique-slug",
  "name": "Tool Name",
  "url": "https://tool.example.com",
  "description_en": "One-paragraph English description.",
  "description_zh_tw": "繁體中文說明。",
  "use_cases": ["Use case 1", "Use case 2"],
  "tags": ["tag1", "tag2"],
  "pricing": "free",
  "difficulty": "beginner",
  "target_types": ["domain", "ip"],
  "platforms": ["web"],
  "ethical_flag": false,
  "ethics_note": null,
  "source_section": "Section Name",
  "source_permalink": "https://source.url",
  "review": { "status": "ai_candidate", "reviewed_by": null, "reviewed_at": null, "notes": null },
  "is_dead_link": false,
  "is_active": true
}
```

### Add a new workflow

Append a record to `workflows.en.json` — see existing entries for the full schema.

---

## Data Quality Report

```bash
python scripts/quality_report.py
# Add --json flag for machine-readable output
python scripts/quality_report.py --json
```

---

## ETL & Enrichment Scripts

| Script | Purpose |
|---|---|
| `scripts/run_etl.py` | Harvest raw tool records from the source list |
| `scripts/enrich_tools.py` | Enrich records with LLM-generated descriptions |
| `scripts/quality_report.py` | Data quality metrics and coverage report |

---

## Routes

| Route | Description |
|---|---|
| `/` | Investigation Index — category drill-down |
| `/workflows` | All guided investigation workflows |
| `/workflows/[id]` | Workflow detail page |
| `/search?q=...` | Cross-entity search (tools, workflows, categories) |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Auto-generated robots file |

---

## i18n

The UI supports **English** (default) and **Traditional Chinese (繁體中文)**.
The language toggle is in the navigation bar and persists via `localStorage`.

- Tool descriptions prefer `description_en` in English mode and `description_zh_tw`
  in Chinese mode, with automatic fallback.
- Workflow content is English-only for now; Chinese workflow content can be added
  by creating `apps/web/data/workflows.zh-TW.json` and extending `lib/workflows.ts`.

---

## Ethics Policy

OSINT Hub is built for **lawful, authorized, public-source research only**.

All tools marked with a ⚠ Caution badge require explicit legal mandate or
authorization before use. Workflows follow a passive-first methodology with
safety checkpoints at every sensitive step.

Do not use this index to facilitate unauthorized access, stalking, harassment,
or any activity that violates local law or platform terms of service.
