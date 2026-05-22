// ══════════════════════════════════════════
// StudySnap — Statistics View
// ══════════════════════════════════════════

async function renderStats() {
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Loading stats...</p></div>`;

    try {
        const stats = await API.getStats();
        const { totalDecks, totalCards, dueToday, mastered, masteryPercent, decks, cards } = stats;

        // Per-deck breakdown
        const deckBreakdown = await Promise.all(decks.map(async deck => {
            const deckCards = cards.filter(c => c.deck_id === deck.id);
            const deckMastered = deckCards.filter(c => c.interval_days >= 7).length;
            const deckDue = deckCards.filter(c => new Date(c.next_review) <= new Date()).length;
            const percent = deckCards.length > 0 ? Math.round((deckMastered / deckCards.length) * 100) : 0;
            return { ...deck, total: deckCards.length, mastered: deckMastered, due: deckDue, percent };
        }));

        container.innerHTML = `
            <div class="page-header">
                <h1>Statistics</h1>
                <p>Track your study progress and mastery levels.</p>
            </div>

            <div class="stats-bar">
                <div class="stat-card">
                    <div class="stat-icon green"><i data-lucide="layers"></i></div>
                    <div class="stat-info"><h3>${totalDecks}</h3><p>Total Decks</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon mint"><i data-lucide="credit-card"></i></div>
                    <div class="stat-info"><h3>${totalCards}</h3><p>Total Cards</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon dark"><i data-lucide="clock"></i></div>
                    <div class="stat-info"><h3>${dueToday}</h3><p>Due for Review</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i data-lucide="award"></i></div>
                    <div class="stat-info"><h3>${masteryPercent}%</h3><p>Mastery Rate</p></div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stats-card">
                    <h3>Card Status Breakdown</h3>
                    ${totalCards === 0 ? '<p style="color:var(--text-secondary);font-size:0.9rem">No cards yet.</p>' : `
                        <div class="progress-row">
                            <span>New</span>
                            <div class="progress-track">
                                <div class="progress-fill" style="width:${totalCards > 0 ? Math.round((cards.filter(c => c.repetitions === 0).length / totalCards) * 100) : 0}%;background:var(--green-300)"></div>
                            </div>
                            <span class="progress-value">${cards.filter(c => c.repetitions === 0).length}</span>
                        </div>
                        <div class="progress-row">
                            <span>Learning</span>
                            <div class="progress-track">
                                <div class="progress-fill" style="width:${totalCards > 0 ? Math.round((cards.filter(c => c.repetitions > 0 && c.interval_days < 7).length / totalCards) * 100) : 0}%;background:#f59e0b"></div>
                            </div>
                            <span class="progress-value">${cards.filter(c => c.repetitions > 0 && c.interval_days < 7).length}</span>
                        </div>
                        <div class="progress-row">
                            <span>Mastered</span>
                            <div class="progress-track">
                                <div class="progress-fill" style="width:${masteryPercent}%;background:var(--green-700)"></div>
                            </div>
                            <span class="progress-value">${mastered}</span>
                        </div>
                    `}
                </div>

                <div class="stats-card">
                    <h3>Deck Progress</h3>
                    ${deckBreakdown.length === 0 ? '<p style="color:var(--text-secondary);font-size:0.9rem">No decks yet.</p>' :
                        deckBreakdown.map(d => `
                            <div class="progress-row">
                                <span style="display:flex;align-items:center;gap:6px">
                                    <span style="width:8px;height:8px;border-radius:50%;background:${d.color};display:inline-block"></span>
                                    ${escapeHTML(d.name)}
                                </span>
                                <div class="progress-track">
                                    <div class="progress-fill" style="width:${d.percent}%;background:${d.color}"></div>
                                </div>
                                <span class="progress-value">${d.percent}%</span>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
        lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle"></i><h3>Error</h3><p>${err.message}</p></div>`;
        lucide.createIcons();
    }
}
