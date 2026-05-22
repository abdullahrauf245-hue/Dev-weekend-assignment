# StudySnap

A clean, minimalist flashcard dashboard with spaced repetition, built in vanilla HTML/CSS/JS. Data lives in LocalStorage, so it runs offline with no backend.

## Features
- Dashboard summary (due today, total cards, total decks)
- Deck CRUD (create/edit/delete) with color tags
- Card CRUD inside decks
- Quiz mode with SM-2 style scheduling (Again/Hard/Good/Easy)
- Statistics page (mastery rate, deck progress, card status)
- Light/Dark theme toggle (saved in LocalStorage)
- Responsive layout and subtle UI animations

## Live demo
https://study-snap1.vercel.app/#/home

## How to run
Option A (no install):
1. Open `public/index.html` in your browser.



## Project structure
```
public/
  index.html
  favicon.svg
  css/
    style.css
  js/
    api.js
    app.js
    config.js
    utils/
      helpers.js
    views/
      home.js
      deck.js
      cardForm.js
      quiz.js
      stats.js
```

## Data storage
- Uses LocalStorage keys: `studysnap_decks`, `studysnap_cards`, and `theme`.
- Clearing browser storage will reset all data.

## Notes
- Supabase config exists in `public/js/config.js` but is not used.
-
