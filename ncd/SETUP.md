# NCD Workbook — Vercel + n8n + Google Sheets Setup

**Time required: ~15 minutes.**

No Google Cloud Console. No service accounts. No private keys.
Students submit → n8n catches it → row lands in your Google Sheet.

---

## How it works

```
Student clicks Submit
      ↓
Vercel (Next.js) sends JSON to your n8n webhook URL
      ↓
n8n workflow appends a row to Google Sheets
(n8n connects to Google via normal OAuth — just "Sign in with Google")
```

---

## Step 1 — Create your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it `NCD Workbook Responses` (or anything you like).
3. Leave it open — you'll link it in Step 3.

---

## Step 2 — Set up n8n

### If you don't have n8n yet:
Sign up for free at [n8n.io/cloud](https://n8n.io/cloud) — no credit card needed for the trial.

### Create the workflow:

1. In n8n, click **+ New workflow**.
2. Click **+** to add the first node → search for **Webhook** → select it.
3. In the Webhook node settings:
   - **HTTP Method:** POST
   - **Authentication:** None
   - Click **Copy Webhook URL** — save this, you'll need it in Step 4.
4. Click **+** after the Webhook node → search for **Google Sheets** → select **Append Row**.
5. In the Google Sheets node:
   - Click **Create new credential** → **Sign in with Google** → select your Google account → allow access.
   - **Spreadsheet:** click the dropdown and select your `NCD Workbook Responses` sheet.
   - **Sheet:** Sheet1
   - **Mapping Column Mode:** Map Each Column Manually
   - Add these columns (click **Add field** for each):

| Column name in your sheet | Value (from webhook data) |
|---------------------------|--------------------------|
| Timestamp | `{{ $json.timestamp }}` |
| Name | `{{ $json.name }}` |
| Company | `{{ $json.company }}` |
| Status | `{{ $json.status }}` |
| M1: Interview Q1 | `{{ $json.m1_interview1 }}` |
| M1: Interview Q2 | `{{ $json.m1_interview2 }}` |
| M1: Post-Offer Email | `{{ $json.m1_postofferEmail }}` |
| M1: Pre-Start Message | `{{ $json.m1_prestart }}` |
| M1: Takeaway | `{{ $json.m1_takeaway }}` |
| M2: Culture Observation | `{{ $json.m2_observe1 }}` |
| M2: Addressing Manager | `{{ $json.m2_observe2 }}` |
| M2: First 48hr Plan | `{{ $json.m2_observe3 }}` |
| M2: Unfamiliar Task | `{{ $json.m2_observe4 }}` |
| M2: Micro - Wrong Reaction | `{{ $json.m2_micro1 }}` |
| M2: Micro - Better Approach | `{{ $json.m2_micro2 }}` |
| M2: Proactive Update | `{{ $json.m2_micro3 }}` |
| M2: Takeaway | `{{ $json.m2_takeaway }}` |
| M3: Scenario | `{{ $json.m3_scenario }}` |
| M3: First Move | `{{ $json.m3_firstmove }}` |
| M3: Clarifying Questions | `{{ $json.m3_questions }}` |
| M3: Common Mistake | `{{ $json.m3_mistake }}` |
| M3: Phrase Bank | `{{ $json.m3_phrases }}` |
| M3: Takeaway | `{{ $json.m3_takeaway }}` |
| M4: Rewrite - Leave | `{{ $json.m4_rewrite1 }}` |
| M4: Rewrite - Overwhelmed | `{{ $json.m4_rewrite2 }}` |
| M4: Rewrite - Client | `{{ $json.m4_rewrite3 }}` |
| M4: Phrases - Vague Tasks | `{{ $json.m4_phrases1 }}` |
| M4: Phrases - Managing Up | `{{ $json.m4_phrases2 }}` |
| M4: Takeaway | `{{ $json.m4_takeaway }}` |
| Commitment 1 | `{{ $json.close_c1 }}` |
| Commitment 2 | `{{ $json.close_c2 }}` |
| Commitment 3 | `{{ $json.close_c3 }}` |

6. Click **Save** (top right), then toggle the workflow to **Active**.

> **Shortcut:** If you don't want to map all 31 columns manually, you can use the **Google Sheets → Append Row** node in "Automap" mode. n8n will create columns automatically using the field names from the JSON. You'll get columns named `m1_interview1` etc. instead of friendly names — fine for a data dump.

---

## Step 3 — Push to GitHub

1. Create a new **private** repo on [github.com](https://github.com).
2. From the `ncd-workbook` folder in your terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

---

## Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Next.js. Leave all defaults.
3. Under **Environment Variables**, add **one variable**:

   | Name | Value |
   |------|-------|
   | `N8N_WEBHOOK_URL` | The webhook URL you copied in Step 2 |

4. Click **Deploy**. Done in ~60 seconds.
5. You get a URL like `https://ncd-workbook-xyz.vercel.app`. Share with students.

---

## Step 5 — Test it end to end

1. Open your live URL.
2. Fill in a name and write something in a few fields.
3. Go to **My Commitments** tab → click **Submit My Responses**.
4. Open your Google Sheet — a new row should appear within seconds.

---

## Local development

```bash
cd ncd-workbook
npm install
cp .env.local.example .env.local
# Edit .env.local — paste your N8N_WEBHOOK_URL
npm run dev
# Open http://localhost:3000
```

---

## Troubleshooting

**Submit returns an error:**
- Check that your n8n workflow is set to **Active** (the toggle in the top-right of the workflow editor).
- Make sure `N8N_WEBHOOK_URL` in Vercel matches exactly what n8n shows (Production URL, not Test URL).

**Rows appear but columns are blank:**
- Click **Listen for test event** in the n8n Webhook node, then submit a test response. n8n will show you the exact JSON shape — use that to fix your column mappings.

**n8n free plan limits:**
- n8n Cloud free tier allows 5 active workflows and 2,500 executions/month — more than enough for a session of 30 students.
