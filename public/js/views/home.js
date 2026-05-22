// ══════════════════════════════════════════
// StudySnap — Home / Dashboard View
// ══════════════════════════════════════════

async function renderHome() {
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Loading decks...</p></div>`;

    try {
        const stats = await API.getStats();
        const decks = stats.decks;

        // Get card counts for each deck
        const deckData = await Promise.all(decks.map(async (deck) => {
            const [cardCount, dueCount] = await Promise.all([
                API.getDeckCardCount(deck.id),
                API.getDeckDueCount(deck.id)
            ]);
            return { ...deck, cardCount, dueCount };
        }));

        container.innerHTML = `
            <div class="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Keep up the great studying.</p>
            </div>

            <div class="dashboard-grid">
                <div class="dash-card dash-focus">
                    <div class="dash-content">
                        <span class="dash-label">Due for Review</span>
                        <h2 class="dash-number hero-number">${stats.dueToday}</h2>
                    </div>
                </div>
                <div class="dash-card dash-secondary">
                    <div class="dash-content">
                        <span class="dash-label">Total Cards</span>
                        <h2 class="dash-number">${stats.totalCards}</h2>
                    </div>
                </div>
                <div class="dash-card dash-tertiary">
                    <div class="dash-content">
                        <span class="dash-label">Total Decks</span>
                        <h2 class="dash-number">${stats.totalDecks}</h2>
                    </div>
                </div>
            </div>

            <div class="page-header-row" style="margin-bottom:20px">
                <h2 style="font-size:1.2rem;font-weight:600">Your Decks</h2>
            </div>

            <div class="deck-grid" id="deck-grid">
                <div class="deck-card new-deck-card" onclick="openDeckModal()" id="new-deck-btn">
                    <i data-lucide="plus"></i>
                    <span>Create New Deck</span>
                </div>
                ${deckData.map(deck => `
                    <div class="deck-card" onclick="navigateTo('deck/${deck.id}')" style="cursor:pointer">
                        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${deck.color || '#166534'};border-radius:16px 16px 0 0"></div>
                        <div class="deck-card-header">
                            <span class="deck-card-title">${escapeHTML(deck.name)}</span>
                            <div class="deck-card-actions">
                                <button class="btn-icon" onclick="event.stopPropagation();openEditDeckModal('${deck.id}')" title="Edit">
                                    <i data-lucide="pencil" style="width:16px;height:16px;color:var(--text-muted)"></i>
                                </button>
                                <button class="btn-icon" onclick="event.stopPropagation();confirmDeleteDeck('${deck.id}')" title="Delete">
                                    <i data-lucide="trash-2" style="width:16px;height:16px;color:var(--text-muted)"></i>
                                </button>
                            </div>
                        </div>
                        <p class="deck-card-desc">${escapeHTML(deck.description || 'No description')}</p>
                        <div class="deck-card-footer">
                            <span class="deck-card-count">
                                <i data-lucide="credit-card"></i> ${deck.cardCount} cards
                            </span>
                            ${deck.dueCount > 0 ? `<span class="deck-card-due">${deck.dueCount} due</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        lucide.createIcons();
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle"></i><h3>Connection Error</h3><p>${err.message}</p></div>`;
        lucide.createIcons();
    }
}

// ── Open Create Deck Modal ──
function openDeckModal() {
    const colorsHTML = DECK_COLORS.map((c, i) =>
        `<div class="color-option ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}" onclick="selectColor(this)"></div>`
    ).join('');

    openModal('Create New Deck', `
        <form id="deck-form" onsubmit="handleCreateDeck(event)">
            <div class="form-group">
                <label for="deck-name">Deck Name</label>
                <input type="text" id="deck-name" placeholder="e.g. Biology Chapter 5" required maxlength="100">
            </div>
            <div class="form-group">
                <label for="deck-desc">Description (optional)</label>
                <textarea id="deck-desc" placeholder="What's this deck about?" rows="2" maxlength="300"></textarea>
            </div>
            <div class="form-group">
                <label>Color</label>
                <div class="color-options">${colorsHTML}</div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i data-lucide="plus"></i> Create Deck</button>
            </div>
        </form>
    `);
}

function selectColor(el) {
    document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

async function handleCreateDeck(e) {
    e.preventDefault();
    const name = document.getElementById('deck-name').value.trim();
    const description = document.getElementById('deck-desc').value.trim();
    const color = document.querySelector('.color-option.selected')?.dataset.color || '#166534';

    if (!name) return showToast('Please enter a deck name', 'error');

    try {
        await API.createDeck({ name, description, color });
        closeModal();
        showToast('Deck created successfully!');
        renderHome();
    } catch (err) {
        showToast('Failed to create deck: ' + err.message, 'error');
    }
}

// ── Edit Deck Modal ──
async function openEditDeckModal(deckId) {
    try {
        const deck = await API.getDeck(deckId);
        const colorsHTML = DECK_COLORS.map(c =>
            `<div class="color-option ${c === deck.color ? 'selected' : ''}" data-color="${c}" style="background:${c}" onclick="selectColor(this)"></div>`
        ).join('');

        openModal('Edit Deck', `
            <form onsubmit="handleUpdateDeck(event, '${deckId}')">
                <div class="form-group">
                    <label for="deck-name">Deck Name</label>
                    <input type="text" id="deck-name" value="${escapeHTML(deck.name)}" required maxlength="100">
                </div>
                <div class="form-group">
                    <label for="deck-desc">Description</label>
                    <textarea id="deck-desc" rows="2" maxlength="300">${escapeHTML(deck.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-options">${colorsHTML}</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Save Changes</button>
                </div>
            </form>
        `);
    } catch (err) {
        showToast('Failed to load deck', 'error');
    }
}

async function handleUpdateDeck(e, deckId) {
    e.preventDefault();
    const name = document.getElementById('deck-name').value.trim();
    const description = document.getElementById('deck-desc').value.trim();
    const color = document.querySelector('.color-option.selected')?.dataset.color || '#166534';

    if (!name) return showToast('Please enter a deck name', 'error');

    try {
        await API.updateDeck(deckId, { name, description, color });
        closeModal();
        showToast('Deck updated!');
        renderHome();
    } catch (err) {
        showToast('Failed to update deck: ' + err.message, 'error');
    }
}

// ── Delete Deck ──
async function confirmDeleteDeck(deckId) {
    try {
        const deck = await API.getDeck(deckId);
        const deckName = escapeHTML(deck.name);
        openModal('Delete Deck', `
            <p style="color:var(--text-secondary);margin-bottom:20px">
                Are you sure you want to delete <strong>"${deckName}"</strong>? 
                This will also delete all cards in this deck. This action cannot be undone.
            </p>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-danger" onclick="handleDeleteDeck('${deckId}')">
                    <i data-lucide="trash-2"></i> Delete Deck
                </button>
            </div>
        `);
        lucide.createIcons();
    } catch (err) {
        showToast('Failed to load deck', 'error');
    }
}

async function handleDeleteDeck(deckId) {
    try {
        await API.deleteDeck(deckId);
        closeModal();
        showToast('Deck deleted');
        renderHome();
    } catch (err) {
        showToast('Failed to delete deck: ' + err.message, 'error');
    }
}
