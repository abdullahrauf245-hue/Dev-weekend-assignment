// ══════════════════════════════════════════
// StudySnap — Supabase API Layer
// ══════════════════════════════════════════

const API = {

    // ── Decks ──
    async getDecks() {
        const { data, error } = await db
            .from('decks')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getDeck(id) {
        const { data, error } = await db
            .from('decks')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createDeck(deck) {
        const { data, error } = await db
            .from('decks')
            .insert([deck])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateDeck(id, updates) {
        const { data, error } = await db
            .from('decks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteDeck(id) {
        const { error } = await db
            .from('decks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // ── Cards ──
    async getCards(deckId) {
        const { data, error } = await db
            .from('cards')
            .select('*')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getCard(id) {
        const { data, error } = await db
            .from('cards')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createCard(card) {
        const { data, error } = await db
            .from('cards')
            .insert([card])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateCard(id, updates) {
        const { data, error } = await db
            .from('cards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteCard(id) {
        const { error } = await db
            .from('cards')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // ── Quiz: get cards due for review ──
    async getQuizCards(deckId) {
        const now = new Date().toISOString();
        const { data, error } = await db
            .from('cards')
            .select('*')
            .eq('deck_id', deckId)
            .lte('next_review', now)
            .order('next_review', { ascending: true });
        if (error) throw error;
        return data;
    },

    // ── Submit review result (SM-2 update) ──
    async submitReview(cardId, rating) {
        const card = await this.getCard(cardId);
        const updates = calculateNextReview(card, rating);
        return await this.updateCard(cardId, updates);
    },

    // ── Aggregate stats ──
    async getStats() {
        const [decksRes, cardsRes] = await Promise.all([
            db.from('decks').select('*'),
            db.from('cards').select('*')
        ]);
        if (decksRes.error) throw decksRes.error;
        if (cardsRes.error) throw cardsRes.error;

        const decks = decksRes.data;
        const cards = cardsRes.data;
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

    // ── Get card count per deck ──
    async getDeckCardCount(deckId) {
        const { count, error } = await db
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .eq('deck_id', deckId);
        if (error) throw error;
        return count;
    },

    // ── Get due count for a deck ──
    async getDeckDueCount(deckId) {
        const now = new Date().toISOString();
        const { count, error } = await db
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .eq('deck_id', deckId)
            .lte('next_review', now);
        if (error) throw error;
        return count;
    }
};
