# OSINT Hub

An OSINT learning and resource navigation site for people who do not know
which public sources to use. Enter everyday keywords, choose a research goal,
and find suitable websites with practical first steps and coverage notes.

The site recommends resources. It does not search for actual records about
an entered person or company, or produce investigative conclusions.

## Product experience

- **Find resources**: company, person, username, website, image, email, IP,
  location, document, blockchain, phone, news, video and academic keywords, in English and Chinese.
- **Learn OSINT**: short verification lessons and a company research example.
- **Resource directory**: browse tools with pricing and difficulty filters.
- **Further reading**: existing investigation playbooks remain available.

## Local development

```bash
cd apps/web
npm install
npm run dev
```

Open <http://localhost:3000>. The search database is generated automatically
before development and production builds.

```bash
npm run typecheck
npm run test:search
npm run build
```

The production build exports a static website to `apps/web/out/`.

## Static search architecture

Meilisearch inspired the separation of documents, searchable fields,
keyword aliases, filtering and ranking. No Meilisearch service, server,
API key or remote search request is required.

```text
Resource records + input capabilities + keyword intents + goals + usage guides
                         |
                Build-time generation
                         |
          Resource database + search index JSON
                         |
           Local browser matching and ranking
                         |
           Resource suggestions + first steps
```

Search supports Chinese aliases, English word boundaries, exact tool names,
basic tool-name typo tolerance, input-type detection, research goals,
coverage regions, free access and beginner-friendly website filters.

Names alone do not establish a research type. Users can choose the subject
explicitly. Region filters use annotated resource coverage; global coverage
is not a guarantee that a specific entity is indexed.

## Maintaining the database

The supported workflow is to curate the local source files, then run
`npm run search:build` in `apps/web`. No upstream scraping or AI enrichment
is required to run, build or maintain the website:

| Source | Purpose |
| --- | --- |
| `apps/web/data/tools.json` | Tool records and existing review metadata |
| `apps/web/data/search/capabilities.json` | Accepted inputs, outputs, roles, goals and coverage (editorial mappings) |
| `apps/web/data/search/intents.json` | Subject aliases, hints and lessons |
| `apps/web/data/search/goals.json` | Research goals and keyword aliases |
| `apps/web/data/search/guides.json` | Recommendations, steps and coverage |
| `apps/web/data/search/tasks.json` | Practical questions, source paths and teaching examples |

Generated files live in `apps/web/data/generated/`. Do not edit them directly.
The generator validates IDs, references, URLs and bilingual guide content.
It excludes dead, inactive and rejected resources. Subject searches cover
all matching target types, including resources without usage guides. Reviewed
or documented guides improve ranking; they do not limit the result set.
The directory also labels records awaiting review.

The browser engine and generator share normalization rules. Search tests
cover aliases, ranking, goal and region filters, unknown input, coverage
of supported intents, and resource eligibility.

See [the optimization notes](docs/product-optimization.md) for the decisions
and current coverage limits.

## Stack and deployment

Next.js App Router with static export, React and Tailwind CSS. Deploy the
`apps/web` project to Vercel, or serve its `out/` directory on a static host.
Set `NEXT_PUBLIC_SITE_URL` to the site's canonical URL when building.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Keyword-first starting point |
| `/search?q=company` | Resource recommendations and guidance |
| `/learn` | Beginner education |
| `/directory` | Full available resource directory |
| `/workflows` | Further reading: detailed playbooks |
| `/workflows/[id]` | Individual playbook |
| `/about` | Project purpose, attribution and responsible use |

English and Traditional Chinese UI are supported. Simplified Chinese search
aliases are also accepted. Detailed playbooks are available in English and Traditional Chinese.

## Sources and responsible use

The tool collection builds on
[Awesome OSINT For Everything](https://github.com/Astrosp/Awesome-OSINT-For-Everything).
Source and review metadata remain available in resource details.

Use lawfully accessible public information, respect privacy and source terms,
and compare independent sources before drawing conclusions. Resources marked
with usage cautions retain their existing guidance.

Historical import scripts, snapshots and Python tests are archived under
`archive/legacy-import/`. The old GitHub sync workflow has been removed from
the active workflows directory. Maintain `apps/web/data` directly; local
validation and index generation are the supported workflow.

## Learning and research notes

The learning page contains six short principles and four interactive judgement
exercises, linked to existing bilingual workflows. The query builder generates
Google-specific phrase, domain and PDF queries; a query is sent to Google only
when the user opens the external search link.

The research note saves its draft in browser localStorage and exports Markdown.
It records the question, source URLs, access time, observations, limits,
conclusion and next step. It has no server storage or cross-device sync.

Search distinguishes direct inputs, tools needing another clue, analysis and
research preparation. Unknown region coverage remains visible with a label.
Capability metadata describes editorial input/output mappings; it does not
represent a live availability audit. Official documentation references and
check dates are stored separately in usage guides.

## Practical task paths

`/tasks` connects ten everyday questions to starting sources, alternatives,
no-result strategies, four research steps and the local research note.
Company, public professional-profile and image examples contain explicitly
fictional evidence-comparison exercises; the news example teaches source
independence. Step completion is session progress, not automatic verification.
Task references live in `apps/web/data/search/tasks.json`; each referenced
resource must exist in the generated eligible catalogue.

## Local validation and maintenance report

`npm run search:build` also validates task source references, translations,
exercise answers, supported inputs and documentation dates before writing
generated files. Every eligible resource must have capability metadata.
It writes `apps/web/data/generated/maintenance-report.json` with resources
missing usage guides, unknown region coverage and pending reviews. This is
a local maintenance queue, not a live link or availability check.

Exact resource names take priority even when a subject is selected. Optional
filters can restrict results to directly supported inputs or annotated region
coverage; unknown coverage remains visible by default. Fact-checking sources
use editorial region focus, not a restriction on where users can access them.
