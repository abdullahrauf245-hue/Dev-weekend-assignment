// ══════════════════════════════════════════
// StudySnap — App Router & Initialization
// ══════════════════════════════════════════


// ── Navigation helper ──
function navigateTo(route) {
    window.location.hash = `#/${route}`;
}

// ── Theme helper ──
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const iconName = theme === 'dark' ? 'sun' : 'moon';
    const iconEl = themeToggle.querySelector('i');
    if (iconEl) iconEl.setAttribute('data-lucide', iconName);
    themeToggle.setAttribute('aria-pressed', theme === 'dark');
    lucide.createIcons();
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

    // Theme toggle
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            applyTheme(isDark ? 'light' : 'dark');
        });
    }

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
