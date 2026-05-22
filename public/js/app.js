// ══════════════════════════════════════════
// StudySnap — App Router & Initialization
// ══════════════════════════════════════════

const authState = {
    isAuthed: false
};

function setAuthMode(isAuthed) {
    authState.isAuthed = isAuthed;
    document.body.classList.toggle('auth-mode', !isAuthed);
}

function isSupabaseConfigured() {
    return typeof SUPABASE_URL === 'string'
        && typeof SUPABASE_ANON_KEY === 'string'
        && !SUPABASE_URL.includes('YOUR_PROJECT_ID')
        && !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
}

function getSupabaseClient() {
    return typeof db !== 'undefined' ? db : null;
}

async function renderAuth() {
    setAuthMode(false);
    const container = document.getElementById('view-container');
    const client = getSupabaseClient();

    if (!client || !isSupabaseConfigured()) {
        container.innerHTML = `
            <div class="auth-card">
                <h1>Configure Supabase</h1>
                <p>Set your Supabase URL and anon key in <strong>js/config.js</strong> to enable login.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="auth-card">
            <h1>Welcome to StudySnap</h1>
            <p>Sign in with Google to continue.</p>

            <div class="auth-actions">
                <button class="btn auth-google-btn" type="button" id="auth-google-btn">
                    <span class="google-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img" aria-label="Google">
                            <path d="M23.49 12.27c0-.86-.08-1.72-.24-2.56H12v4.85h6.46a5.53 5.53 0 0 1-2.4 3.63v3.01h3.87c2.27-2.1 3.56-5.2 3.56-8.93Z" fill="#4285F4"/>
                            <path d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.01c-1.07.73-2.45 1.16-4.08 1.16-3.13 0-5.77-2.12-6.72-4.97H1.29v3.13A12 12 0 0 0 12 24Z" fill="#34A853"/>
                            <path d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.38-2.28V6.59H1.29A12 12 0 0 0 0 12c0 1.94.47 3.78 1.29 5.41l4-3.13Z" fill="#FBBC05"/>
                            <path d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.08 15.24 0 12 0 7.3 0 3.27 2.69 1.29 6.59l4 3.13c.95-2.85 3.59-4.97 6.72-4.97Z" fill="#EA4335"/>
                        </svg>
                    </span>
                    Continue with Google
                </button>
            </div>

            <p class="auth-hint">You will be redirected to Google to sign in.</p>
        </div>
    `;

    document.getElementById('auth-google-btn').addEventListener('click', async () => {
        const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });

        if (error) showToast(error.message, 'error');
    });
}

async function initAuthGate() {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
        await renderAuth();
        return;
    }

    const { data, error } = await client.auth.getSession();
    if (error || !data.session) {
        await renderAuth();
        return;
    }

    setAuthMode(true);
    await handleRoute();
}

// ── Navigation helper ──
function navigateTo(route) {
    window.location.hash = `#/${route}`;
}

// ── Route handler ──
async function handleRoute() {
    if (!authState.isAuthed) {
        await renderAuth();
        return;
    }

    const hash = window.location.hash || '#/home';
    const path = hash.replace('#/', '');
    const segments = path.split('/');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.route === segments[0]) link.classList.add('active');
    });

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');

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

    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('open');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });

    // Keyboard: Escape closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Auth gate + initial route
    initAuthGate();

    const client = getSupabaseClient();
    if (client) {
        client.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setAuthMode(true);
                await handleRoute();
            } else {
                await renderAuth();
            }
        });
    }

    // Initialize Lucide icons
    lucide.createIcons();
});
