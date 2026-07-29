---
name: geo-seo-optimization
description: Generative Engine Optimization (GEO) & SEO audit and optimization guidelines for OSINT Hub based on geo-seo-claude methodology.
---

# GEO & SEO Optimization Skill for OSINT Hub

This skill defines the operational standards and validation rules for optimizing OSINT Hub across both traditional search engines (Google, Bing) and AI search engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews).

## Core Principles

1. **AI Crawler Openness**: Never block generative search bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`). Maintain permissive rules in `robots.txt`.
2. **Machine-Readable Feeds (`llms.txt` & `llms-full.txt`)**:
   - `llms.txt`: High-level table of contents and directory index for LLM crawlers.
   - `llms-full.txt`: Exhaustive Markdown representation of tools, target categories, workflows, and safety checkpoints.
3. **Structured Data (JSON-LD)**:
   - Root: `WebSite` (with `SearchAction`) and `Organization` schemas.
   - Workflows: `HowTo` schema with explicit `step` arrays, tools required, and safety checkpoints.
   - Tools: `SoftwareApplication` or `DataCatalog` entries.
4. **E-E-A-T & Citability**:
   - Provide clear, direct answers for key concepts (e.g. passive OSINT, domain recon, username investigation).
   - Maintain explicit OPSEC, legal compliance, and citation guidelines on `/about`.
   - Use clean heading hierarchies (`<h1>` -> `<h2>` -> `<h3>`) and semantic HTML (`<main>`, `<article>`, `<header>`, `<footer>`).
5. **Canonical Consistency**:
   - Enforce `https://www.205044.xyz` as the canonical origin across dynamic routes, OpenGraph, sitemap, and schema URIs.

## Inspection Workflow

Run the following checks after content or route modifications:
1. Verify `apps/web/app/robots.ts` contains explicit allowances for AI crawlers.
2. Verify `sitemap.ts` includes all static and dynamic paths (`/`, `/workflows`, `/search`, `/about`, `/workflows/[id]`).
3. Run `cd apps/web && npm run build` to confirm static export compatibility (`output: "export"`).
