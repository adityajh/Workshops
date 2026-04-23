# Navigate. Communicate. Deliver.

**A 90-minute professional communication workshop for Let's Enterprise Year 1 students about to start their first apprenticeship.**

---

## What this workshop covers

| Module | Topic | Duration |
|--------|-------|----------|
| M1 | The Last Mile — interview questions + post-offer communication | 20 min |
| M2 | Day 1 in a Foreign Land — navigating a new professional environment | 20 min |
| M3 | When the Task is "Figure It Out" — handling vague briefs | 20 min |
| M4 | Managing Up Professionally — requests, leave, expectations | 20 min |
| Close | Commitments + debrief | 10 min |

Works for both students who are locked into a company and those still applying — all 4 modules are relevant to both groups.

---

## Contents

```
ncd/
├── README.md          — this file
├── SETUP.md           — how to deploy the web app + configure n8n
├── web/               — interactive student workbook (Next.js, deploy to Vercel)
└── assets/            — offline session materials
    ├── Facilitator Guide — Navigate Communicate Deliver.docx
    ├── Student Workbook — Navigate Communicate Deliver.docx
    └── Session Slides — Navigate Communicate Deliver.pptx
```

## Deploying

The interactive workbook at `web/` is a Next.js app that collects student responses and sends them to Google Sheets via an n8n webhook.

**Quick start:**
1. Deploy `web/` to Vercel (set Root Directory → `ncd/web`)
2. Set up the n8n workflow (see `SETUP.md` → Step 2)
3. Add `N8N_WEBHOOK_URL` as a Vercel environment variable

Full instructions: [`SETUP.md`](./SETUP.md)
