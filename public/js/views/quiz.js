// ══════════════════════════════════════════
// StudySnap — Quiz Mode View
// ══════════════════════════════════════════

let quizState = { cards: [], current: 0, results: [], deckId: null };

async function renderQuiz(deckId) {
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Preparing quiz...</p></div>`;

    try {
        const [deck, cards] = await Promise.all([
            API.getDeck(deckId),
            API.getQuizCards(deckId)
        ]);

        if (cards.length === 0) {
            // No cards due — get all cards and offer full review
            const allCards = await API.getCards(deckId);
            if (allCards.length === 0) {
                container.innerHTML = `
                    <a href="#/deck/${deckId}" class="back-link"><i data-lucide="arrow-left"></i> Back to Deck</a>
                    <div class="empty-state">
                        <i data-lucide="inbox"></i>
                        <h3>No cards to quiz</h3>
                        <p>Add some cards first!</p>
                        <button class="btn btn-primary" onclick="navigateTo('deck/${deckId}')">Go to Deck</button>
                    </div>
                `;
                lucide.createIcons();
                return;
            }
            container.innerHTML = `
                <a href="#/deck/${deckId}" class="back-link"><i data-lucide="arrow-left"></i> Back to Deck</a>
                <div class="quiz-container">
                    <div class="quiz-complete">
                        <div class="quiz-complete-icon"><i data-lucide="check-circle"></i></div>
                        <h2>All caught up! 🎉</h2>
                        <p>No cards are due for review right now. Come back later or review all cards.</p>
                        <button class="btn btn-primary" onclick="startFullReview('${deckId}')">
                            <i data-lucide="rotate-ccw"></i> Review All Cards
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Shuffle cards
        const shuffled = cards.sort(() => Math.random() - 0.5);
        quizState = { cards: shuffled, current: 0, results: [], deckId };
        showQuizCard(deck);
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle"></i><h3>Error</h3><p>${err.message}</p></div>`;
        lucide.createIcons();
    }
}

async function startFullReview(deckId) {
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;
    const [deck, cards] = await Promise.all([
        API.getDeck(deckId),
        API.getCards(deckId)
    ]);
    const shuffled = cards.sort(() => Math.random() - 0.5);
    quizState = { cards: shuffled, current: 0, results: [], deckId };
    showQuizCard(deck);
}

function showQuizCard(deck) {
    const container = document.getElementById('view-container');
    const { cards, current } = quizState;
    const card = cards[current];
    const progress = Math.round((current / cards.length) * 100);

    container.innerHTML = `
        <a href="#/deck/${quizState.deckId}" class="back-link"><i data-lucide="arrow-left"></i> Back to ${escapeHTML(deck.name)}</a>

        <div class="quiz-container">
            <div class="quiz-progress">
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width:${progress}%"></div>
                </div>
                <p class="quiz-progress-text">Card ${current + 1} of ${cards.length}</p>
            </div>

            <div class="flashcard-wrapper" onclick="flipCard()">
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-face flashcard-front">
                        <span class="flashcard-label">Question</span>
                        <p class="flashcard-text">${escapeHTML(card.front)}</p>
                        <span class="flashcard-hint">Click to reveal answer</span>
                    </div>
                    <div class="flashcard-face flashcard-back">
                        <span class="flashcard-label">Answer</span>
                        <p class="flashcard-text">${escapeHTML(card.back)}</p>
                    </div>
                </div>
            </div>

            <div id="quiz-actions" style="display:none">
                <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">How well did you know this?</p>
                <div class="quiz-ratings">
                    <button class="rating-btn again" onclick="rateCard(1)">
                        <span class="rating-label">Again</span>
                        <span class="rating-interval">Now</span>
                    </button>
                    <button class="rating-btn hard" onclick="rateCard(2)">
                        <span class="rating-label">Hard</span>
                        <span class="rating-interval">1 day</span>
                    </button>
                    <button class="rating-btn good" onclick="rateCard(3)">
                        <span class="rating-label">Good</span>
                        <span class="rating-interval">${getIntervalLabel(calculateNextReview(card, 3).interval_days)}</span>
                    </button>
                    <button class="rating-btn easy" onclick="rateCard(4)">
                        <span class="rating-label">Easy</span>
                        <span class="rating-interval">${getIntervalLabel(calculateNextReview(card, 4).interval_days)}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    if (!flashcard.classList.contains('flipped')) {
        flashcard.classList.add('flipped');
        document.getElementById('quiz-actions').style.display = 'block';
    }
}

async function rateCard(rating) {
    const card = quizState.cards[quizState.current];
    quizState.results.push({ cardId: card.id, rating });

    try {
        await API.submitReview(card.id, rating);
    } catch (err) {
        console.error('Review submit error:', err);
    }

    quizState.current++;

    if (quizState.current >= quizState.cards.length) {
        showQuizComplete();
    } else {
        const deck = await API.getDeck(quizState.deckId);
        showQuizCard(deck);
    }
}

function showQuizComplete() {
    const { results, cards, deckId } = quizState;
    const again = results.filter(r => r.rating === 1).length;
    const hard = results.filter(r => r.rating === 2).length;
    const good = results.filter(r => r.rating === 3).length;
    const easy = results.filter(r => r.rating === 4).length;

    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-complete">
                <div class="quiz-complete-icon"><i data-lucide="trophy"></i></div>
                <h2>Quiz Complete! 🎉</h2>
                <p>You reviewed ${cards.length} card${cards.length > 1 ? 's' : ''}</p>

                <div class="quiz-summary">
                    <div class="quiz-summary-item" style="border-left:3px solid #dc2626">
                        <h4>${again}</h4><p>Again</p>
                    </div>
                    <div class="quiz-summary-item" style="border-left:3px solid #ca8a04">
                        <h4>${hard}</h4><p>Hard</p>
                    </div>
                    <div class="quiz-summary-item" style="border-left:3px solid var(--green-500)">
                        <h4>${good}</h4><p>Good</p>
                    </div>
                    <div class="quiz-summary-item" style="border-left:3px solid var(--green-800)">
                        <h4>${easy}</h4><p>Easy</p>
                    </div>
                </div>

                <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
                    <button class="btn btn-primary" onclick="navigateTo('deck/${deckId}')">
                        <i data-lucide="arrow-left"></i> Back to Deck
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('home')">
                        <i data-lucide="layout-dashboard"></i> Dashboard
                    </button>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}
