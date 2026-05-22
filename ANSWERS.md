# Answers

## 1. How to run

Open `public/index.html` directly in your browser — no install needed.

If you want a local server:

```bash
# Node
npx serve public -l 8080

# Python
python -m http.server 8080 -d public
```

Then visit `http://localhost:8080/#/home`.

---

## 2. Why vanilla JS

The assignment is a static UI with LocalStorage — no backend, no build step. Vanilla HTML/CSS/JS loads instantly, is easy to audit, and has zero setup friction. Reaching for a full SPA framework here would've added installation overhead and more surface area for bugs without solving any real problem.

---

## 3. One real edge case

**What:** quiz is started with no due cards (or no cards at all).

**Where:** `public/js/views/quiz.js`, lines 17–47.

**What happens:** the app catches this early and shows either a "Review All Cards" option or a "No cards to quiz" message — whichever fits. Without the check, the quiz view would try to render against an empty list and either blank out or throw.

---

## 4. AI usage

I used GitHub Copilot Chat (GPT-5.2-Codex,Gemini 3.1 Pro) for four things:

- **Layout** — asked for a top nav and asymmetric dashboard grid; it gave me the HTML/CSS structure and I integrated it
- **Dark/light mode** — asked for a theme toggle with tokenized CSS variables; used it as the base
- **Favicon** — asked for a minimal SVG icon; it produced the bolt mark
- **Micro-animations** — asked for subtle motion; it generated staggered entrance and hover animations

One concrete edit I made: the AI's dark theme had a blue tint I didn't like. I adjusted the palette to a neutral charcoal instead, also the colour scheme and also the ux .

---

## 5. Honest gap

No cloud sync, no AI question generation. Given another day, I'd add either a real backend sync or a local export/import flow, and wire up Gemini for topic-based card creation behind a server proxy so the API key never touches the client.