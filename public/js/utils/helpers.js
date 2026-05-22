// ══════════════════════════════════════════
// StudySnap — Utility Helpers
// ══════════════════════════════════════════

// ── Toast Notifications ──
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Modal Helpers ──
function openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.add('open');
    lucide.createIcons({ nodes: [document.getElementById('modal-body')] });
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

// ── SM-2 Spaced Repetition Algorithm ──
function calculateNextReview(card, rating) {
    // rating: 1=Again, 2=Hard, 3=Good, 4=Easy
    let easeFactor = card.ease_factor || 2.5;
    let interval = card.interval_days || 0;
    let reps = card.repetitions || 0;

    if (rating < 2) {
        // Failed — reset progress
        reps = 0;
        interval = 0;
    } else {
        reps += 1;
        if (reps === 1) interval = 1;
        else if (reps === 2) interval = 3;
        else interval = Math.round(interval * easeFactor);
    }

    // Adjust ease factor (never below 1.3)
    easeFactor = Math.max(1.3,
        easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02))
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
        ease_factor: parseFloat(easeFactor.toFixed(2)),
        interval_days: interval,
        repetitions: reps,
        next_review: nextReview.toISOString()
    };
}

// ── Get interval label for display ──
function getIntervalLabel(intervalDays) {
    if (intervalDays === 0) return 'Now';
    if (intervalDays === 1) return '1 day';
    if (intervalDays < 7) return `${intervalDays} days`;
    if (intervalDays < 30) return `${Math.round(intervalDays / 7)} wk`;
    return `${Math.round(intervalDays / 30)} mo`;
}

// ── Get card SR status ──
function getCardStatus(card) {
    if (card.repetitions === 0) return { label: 'New', class: 'new' };
    if (card.interval_days < 7) return { label: 'Learning', class: 'learning' };
    return { label: 'Mastered', class: 'mastered' };
}

// ── Format date ──
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

// ── Deck colors available for selection ──
const DECK_COLORS = [
    '#166534', '#15803d', '#0f766e', '#0e7490',
    '#1d4ed8', '#6d28d9', '#be185d', '#dc2626',
    '#ea580c', '#ca8a04', '#4f46e5', '#7c3aed'
];

// ── Escape HTML to prevent XSS ──
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
