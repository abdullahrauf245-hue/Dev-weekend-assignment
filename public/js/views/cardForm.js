// ══════════════════════════════════════════
// StudySnap — Card Form (Create / Edit)
// ══════════════════════════════════════════

function openCardModal(deckId) {
    openModal('Add New Card', `
        <form onsubmit="handleCreateCard(event, '${deckId}')">
            <div class="form-group">
                <label for="card-front">Front (Question)</label>
                <textarea id="card-front" placeholder="e.g. What is the powerhouse of the cell?" rows="3" required maxlength="1000"></textarea>
            </div>
            <div class="form-group">
                <label for="card-back">Back (Answer)</label>
                <textarea id="card-back" placeholder="e.g. The mitochondria" rows="3" required maxlength="1000"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i data-lucide="plus"></i> Add Card</button>
            </div>
        </form>
    `);
}

async function handleCreateCard(e, deckId) {
    e.preventDefault();
    const front = document.getElementById('card-front').value.trim();
    const back = document.getElementById('card-back').value.trim();

    if (!front || !back) return showToast('Both sides of the card are required', 'error');

    try {
        await API.createCard({ deck_id: deckId, front, back });
        closeModal();
        showToast('Card added!');
        renderDeck(deckId);
    } catch (err) {
        showToast('Failed to add card: ' + err.message, 'error');
    }
}

async function openEditCardModal(cardId, deckId) {
    try {
        const card = await API.getCard(cardId);
        openModal('Edit Card', `
            <form onsubmit="handleUpdateCard(event, '${cardId}', '${deckId}')">
                <div class="form-group">
                    <label for="card-front">Front (Question)</label>
                    <textarea id="card-front" rows="3" required maxlength="1000">${escapeHTML(card.front)}</textarea>
                </div>
                <div class="form-group">
                    <label for="card-back">Back (Answer)</label>
                    <textarea id="card-back" rows="3" required maxlength="1000">${escapeHTML(card.back)}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Save</button>
                </div>
            </form>
        `);
    } catch (err) {
        showToast('Failed to load card', 'error');
    }
}

async function handleUpdateCard(e, cardId, deckId) {
    e.preventDefault();
    const front = document.getElementById('card-front').value.trim();
    const back = document.getElementById('card-back').value.trim();

    if (!front || !back) return showToast('Both sides are required', 'error');

    try {
        await API.updateCard(cardId, { front, back });
        closeModal();
        showToast('Card updated!');
        renderDeck(deckId);
    } catch (err) {
        showToast('Failed to update card: ' + err.message, 'error');
    }
}
