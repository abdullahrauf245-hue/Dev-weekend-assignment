// ══════════════════════════════════════════
// StudySnap — LocalStorage API Layer
// ══════════════════════════════════════════

// Initialize LocalStorage if empty
if (!localStorage.getItem('studysnap_decks')) {
    localStorage.setItem('studysnap_decks', JSON.stringify([]));
}
if (!localStorage.getItem('studysnap_cards')) {
    localStorage.setItem('studysnap_cards', JSON.stringify([]));
}

const API = {
    // ── Helpers ──
    _getDecks() { return JSON.parse(localStorage.getItem('studysnap_decks')); },
    _getCards() { return JSON.parse(localStorage.getItem('studysnap_cards')); },
    _saveDecks(data) { localStorage.setItem('studysnap_decks', JSON.stringify(data)); },
    _saveCards(data) { localStorage.setItem('studysnap_cards', JSON.stringify(data)); },
    _generateId() { return Math.random().toString(36).substr(2, 9); },

    // ── Decks ──
    async getDecks() {
        return this._getDecks().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async getDeck(id) {
        const deck = this._getDecks().find(d => d.id === id);
        if (!deck) throw new Error('Deck not found');
        return deck;
    },

    async createDeck(deck) {
        const decks = this._getDecks();
        const newDeck = {
            ...deck,
            id: this._generateId(),
            created_at: new Date().toISOString()
        };
        decks.push(newDeck);
        this._saveDecks(decks);
        return newDeck;
    },

    async updateDeck(id, updates) {
        const decks = this._getDecks();
        const index = decks.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Deck not found');
        decks[index] = { ...decks[index], ...updates };
        this._saveDecks(decks);
        return decks[index];
    },

    async deleteDeck(id) {
        // Delete deck
        let decks = this._getDecks();
        decks = decks.filter(d => d.id !== id);
        this._saveDecks(decks);
        
        // Cascade delete cards
        let cards = this._getCards();
        cards = cards.filter(c => c.deck_id !== id);
        this._saveCards(cards);
    },

    // ── Cards ──
    async getCards(deckId) {
        return this._getCards()
            .filter(c => c.deck_id === deckId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async getCard(id) {
        const card = this._getCards().find(c => c.id === id);
        if (!card) throw new Error('Card not found');
        return card;
    },

    async createCard(card) {
        const cards = this._getCards();
        const newCard = {
            ...card,
            id: this._generateId(),
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            next_review: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        cards.push(newCard);
        this._saveCards(cards);
        return newCard;
    },

    async updateCard(id, updates) {
        const cards = this._getCards();
        const index = cards.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Card not found');
        cards[index] = { ...cards[index], ...updates };
        this._saveCards(cards);
        return cards[index];
    },

    async deleteCard(id) {
        let cards = this._getCards();
        cards = cards.filter(c => c.id !== id);
        this._saveCards(cards);
    },

    // ── Quiz ──
    async getQuizCards(deckId) {
        const now = new Date();
        return this._getCards()
            .filter(c => c.deck_id === deckId && new Date(c.next_review) <= now)
            .sort((a, b) => new Date(a.next_review) - new Date(b.next_review));
    },

    async submitReview(cardId, rating) {
        const card = await this.getCard(cardId);
        const updates = calculateNextReview(card, rating);
        return await this.updateCard(cardId, updates);
    },

    // ── Stats ──
    async getStats() {
        const decks = this._getDecks();
        const cards = this._getCards();
        const now = new Date();

        const dueCards = cards.filter(c => new Date(c.next_review) <= now);
        const masteredCards = cards.filter(c => c.interval_days >= 7);

        return {
            totalDecks: decks.length,
            totalCards: cards.length,
            dueToday: dueCards.length,
            mastered: masteredCards.length,
            masteryPercent: cards.length > 0 
                ? Math.round((masteredCards.length / cards.length) * 100) : 0,
            decks,
            cards
        };
    },

    async getDeckCardCount(deckId) {
        return this._getCards().filter(c => c.deck_id === deckId).length;
    },

    async getDeckDueCount(deckId) {
        const now = new Date();
        return this._getCards().filter(c => c.deck_id === deckId && new Date(c.next_review) <= now).length;
    }
};
