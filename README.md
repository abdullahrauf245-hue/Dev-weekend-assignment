# StudySnap

A minimalist flashcard app with spaced repetition. No backend, no account, no nonsense — everything lives in your browser's LocalStorage and works offline.

[**Live demo →**](https://study-snap1.vercel.app/#/home)

---

## What it does

- **Dashboard** — see cards due today, total decks, and overall progress at a glance
- **Decks** — create, edit, and delete decks with color tags
- **Cards** — full CRUD inside each deck
- **Quiz mode** — SM-2 style scheduling: rate each card Again / Hard / Good / Easy, and it spaces reviews accordingly
- **Stats** — mastery rate, per-deck progress, card status breakdown
- **Dark mode** — toggle saved to LocalStorage, so it sticks
- Responsive layout with subtle animations throughout

---

## Running it

No install needed. Just open `public/index.html` in your browser.

---

## Project structure

```
public/
├── index.html
├── favicon.svg
├── css/
│   └── style.css
└── js/
    ├── api.js
    ├── app.js
    ├── config.js
    ├── utils/
    │   └── helpers.js
    └── views/
        ├── home.js
        ├── deck.js
        ├── cardForm.js
        ├── quiz.js
        └── stats.js
```

---

## Data

All stored data is handled by Supabase, including decks, cards, and user preferences. The app syncs seamlessly with the Supabase backend for persistent storage and retrieval. Theme preferences are also saved through Supabase.