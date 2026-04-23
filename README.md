# Workshops — Let's Enterprise

A monorepo of interactive student workshops. Each folder is one self-contained workshop with its own web app, offline materials, and setup guide.

## Workshops

| Folder | Workshop | Status |
|--------|----------|--------|
| [`ncd/`](./ncd/) | Navigate. Communicate. Deliver. — Professional Communication for Year 1 Apprenticeships | ✅ Live |

---

## How this repo is structured

```
workshops/
└── <workshop-slug>/
    ├── README.md          — What the workshop is, who it's for
    ├── SETUP.md           — How to deploy the web app
    ├── web/               — Next.js app (deploy to Vercel)
    │   ├── pages/
    │   ├── styles/
    │   ├── package.json
    │   └── .env.local.example
    └── assets/            — Offline materials (DOCX, PPTX)
```

## Deploying a workshop to Vercel

Each workshop's `web/` folder is its own deployable Next.js app. When connecting to Vercel, set the **Root Directory** to `<workshop-slug>/web/` in Vercel's project settings.

See each workshop's `SETUP.md` for environment variable requirements.
