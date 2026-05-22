// ══════════════════════════════════════════
// StudySnap — Deck View (single deck)
// ══════════════════════════════════════════

async function renderDeck(deckId) {
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Loading deck...</p></div>`;

    try {
        const [deck, cards] = await Promise.all([
            API.getDeck(deckId),
            API.getCards(deckId)
        ]);

        const now = new Date();
        const dueCount = cards.filter(c => new Date(c.next_review) <= now).length;

        container.innerHTML = `
            <a href="#/home" class="back-link"><i data-lucide="arrow-left"></i> Back to Dashboard</a>

            <div class="page-header-row">
                <div class="page-header" style="margin-bottom:0">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
                        <div style="width:14px;height:14px;border-radius:50%;background:${deck.color || '#166534'}"></div>
                        <h1>${escapeHTML(deck.name)}</h1>
                    </div>
                    <p>${escapeHTML(deck.description || 'No description')}</p>
                </div>
                <div style="display:flex;gap:10px">
                    ${cards.length > 0 ? `
                        <button class="btn btn-secondary" onclick="navigateTo('quiz/${deckId}')">
                            <i data-lucide="play"></i> Quiz${dueCount > 0 ? ` (${dueCount} due)` : ''}
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="openCardModal('${deckId}')" id="add-card-btn">
                        <i data-lucide="plus"></i> Add Card
                    </button>
                </div>
            </div>

            <div style="margin-top:24px">
                ${cards.length === 0 ? `
                    <div class="empty-state">
                        <i data-lucide="inbox"></i>
                        <h3>No cards yet</h3>
                        <p>Add your first flashcard to start studying!</p>
                        <button class="btn btn-primary" onclick="openCardModal('${deckId}')">
                            <i data-lucide="plus"></i> Add Card
                        </button>
                    </div>
                ` : `
                    <div class="card-list" id="card-list">
                        ${cards.map(card => {
                            const status = getCardStatus(card);
                            return `
                                <div class="card-item">
                                    <div class="card-item-content">
                                        <div class="card-item-front">${escapeHTML(card.front)}</div>
                                        <div class="card-item-back">${escapeHTML(card.back)}</div>
                                    </div>
                                    <span class="card-item-sr ${status.class}">${status.label}</span>
                                    <div class="card-item-actions">
                                        <button class="btn-icon" onclick="openEditCardModal('${card.id}','${deckId}')" title="Edit">
                                            <i data-lucide="pencil" style="width:16px;height:16px;color:var(--text-muted)"></i>
                                        </button>
                                        <button class="btn-icon" onclick="confirmDeleteCard('${card.id}','${deckId}')" title="Delete">
                                            <i data-lucide="trash-2" style="width:16px;height:16px;color:var(--text-muted)"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle"></i><h3>Error</h3><p>${err.message}</p></div>`;
        lucide.createIcons();
    }
}

// ── Delete Card ──
function confirmDeleteCard(cardId, deckId) {
    openModal('Delete Card', `
        <p style="color:var(--text-secondary);margin-bottom:20px">Are you sure you want to delete this card? This cannot be undone.</p>
        <div class="form-actions">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-danger" onclick="handleDeleteCard('${cardId}','${deckId}')">
                <i data-lucide="trash-2"></i> Delete
            </button>
        </div>
    `);
}

async function handleDeleteCard(cardId, deckId) {
    try {
        await API.deleteCard(cardId);
        closeModal();
        showToast('Card deleted');
        renderDeck(deckId);
    } catch (err) {
        showToast('Failed to delete card', 'error');
    }
}
