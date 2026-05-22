// ══════════════════════════════════════════
// StudySnap — App Router & Initialization
// ══════════════════════════════════════════


// ── Navigation helper ──
function navigateTo(route) {
    window.location.hash = `#/${route}`;
}

// ── Route handler ──
async function handleRoute() {
    const hash = window.location.hash || '#/home';
    const path = hash.replace('#/', '');
    const segments = path.split('/');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.route === segments[0]) link.classList.add('active');
    });

    // Route to view
    switch (segments[0]) {
        case 'deck':
            if (segments[1]) await renderDeck(segments[1]);
            else navigateTo('home');
            break;
        case 'quiz':
            if (segments[1]) await renderQuiz(segments[1]);
            else navigateTo('home');
            break;
        case 'stats':
            await renderStats();
            break;
        case 'home':
        default:
            await renderHome();
            break;
    }
}

// ── Initialize App ──
document.addEventListener('DOMContentLoaded', () => {
    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Modal close handlers
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    // Keyboard: Escape closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Initial route
    handleRoute();

    // Initialize Lucide icons
    lucide.createIcons();
});
