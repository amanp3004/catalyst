# Founder OS — Automated Daily Edition

A self-updating website that runs the Atlas editorial workflow every morning:
pulls startup news, curates it with Claude, and publishes a new edition —
with logos, hyperlinks, and icons — automatically.

## How it works

```
GitHub Actions (cron, every morning)
        │
        ▼
generate_edition.py
  ├─ pulls stories from TechCrunch / YourStory / Inc42 / Entrackr / Hacker News
  ├─ sends them to Gemini (free tier) with the Atlas manifesto as the system prompt
  └─ writes data/latest.json + data/YYYY-MM-DD.json
        │
        ▼
index.html (static site)
  └─ fetches data/latest.json on page load and renders it
        │
        ▼
GitHub Pages (auto-deployed by the same workflow)
```

No server to maintain. No database. No cost. Everything lives in this one repo.

## Cost: $0

This uses **Google's Gemini API free tier** — no credit card required, no
expiration. `gemini-2.5-flash` gives far more free daily requests than this
job needs (it makes exactly one call a day). GitHub Actions and GitHub Pages
are also free for this workload. You can run this indefinitely without
paying anything.

## Deploy it (about 10 minutes)

1. **Create a GitHub repo** and push all these files to it (`main` branch).

2. **Get a free Gemini API key** at
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — sign
   in with any Google account, click "Create API key." No credit card, no
   billing setup.

3. **Add it as a repo secret:**
   Repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GEMINI_API_KEY`
   - Value: your key

4. **Enable GitHub Pages:**
   Repo → Settings → Pages → Source: **GitHub Actions**

5. **Run it once manually** to confirm it works:
   Repo → Actions → "Generate Daily Founder OS Edition" → Run workflow

   Check the Actions log for errors, then visit the Pages URL GitHub gives you
   (shown in Settings → Pages, and in the workflow's deploy step).

6. **Done.** From now on it runs automatically every day at 02:00 UTC
   (7:30 AM IST). Change the `cron:` line in
   `.github/workflows/daily-edition.yml` to shift the time — cron times are
   always in UTC.

## Customizing

- **Sources:** edit `RSS_SOURCES` in `generate_edition.py` to add/remove feeds.
- **Editorial voice:** edit the `MANIFESTO` string in `generate_edition.py`
  — this *is* the Atlas Editorial Manifesto, verbatim as the system prompt.
- **Model:** set the `FOUNDEROS_MODEL` repo variable if you want a different
  Claude model than the default.
- **Design:** all styling lives in `<style>` in `index.html` — it's a single
  static file, easy to restyle.
- **Archive page:** `data/index.json` accumulates every past date; a
  "past editions" page can be built by reading that list and fetching
  `data/{date}.json` for each.

## Costs

- **GitHub Actions:** free for public repos (2,000 free minutes/month on
  private repos). This job runs in under a minute a day.
- **GitHub Pages:** free.
- **Gemini API:** free tier, no card, no expiration — one call a day is well
  inside the daily quota.

## If you outgrow the free tier

Free-tier requests may be used by Google to improve their products, and
quotas are shared per-project (not per-key). For a one-call-a-day newsletter
this is a non-issue, but if you ever scale this up: Groq and OpenRouter also
offer free tiers with different open-source models, or you can add billing
to the same Google Cloud project for higher limits and no data sharing.

## Local testing

```bash
pip install -r requirements.txt
GEMINI_API_KEY=AIza... python generate_edition.py
python -m http.server 8000   # then open localhost:8000
```
