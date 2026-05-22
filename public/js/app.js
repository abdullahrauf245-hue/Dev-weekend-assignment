// ══════════════════════════════════════════
// StudySnap — App Router & Initialization
// ══════════════════════════════════════════

const authState = {
    isAuthed: false,
    pendingEmail: ''
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
            <p>Enter your email to receive a one-time code.</p>

            <form id="auth-email-form">
                <input id="auth-email" type="email" placeholder="you@example.com" required>
                <button class="btn btn-primary" type="submit">Send OTP</button>
            </form>

            <form id="auth-code-form" style="margin-top:12px;display:none">
                <input id="auth-code" type="text" placeholder="Enter 6-digit code" required>
                <div class="auth-actions">
                    <button class="btn btn-primary" type="submit">Verify</button>
                    <button class="btn btn-secondary" type="button" id="auth-resend">Resend</button>
                </div>
            </form>

            <p class="auth-hint" id="auth-hint">We will send a short-lived code to your inbox.</p>
        </div>
    `;

    const hintEl = document.getElementById('auth-hint');
    const codeForm = document.getElementById('auth-code-form');

    document.getElementById('auth-email-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        if (!email) return showToast('Enter a valid email', 'error');
        authState.pendingEmail = email;

        const { error } = await client.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true }
        });

        if (error) return showToast(error.message, 'error');
        showToast('OTP sent to your email');
        hintEl.textContent = `Code sent to ${email}. Check your inbox.`;
        codeForm.style.display = 'block';
    });

    document.getElementById('auth-code-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('auth-code').value.trim();
        if (!code) return showToast('Enter the code', 'error');

        const { error } = await client.auth.verifyOtp({
            email: authState.pendingEmail,
            token: code,
            type: 'email'
        });

        if (error) return showToast(error.message, 'error');
        showToast('Signed in successfully');
        setAuthMode(true);
        await handleRoute();
    });

    document.getElementById('auth-resend').addEventListener('click', async () => {
        if (!authState.pendingEmail) return showToast('Enter your email first', 'error');
        const { error } = await client.auth.signInWithOtp({
            email: authState.pendingEmail,
            options: { shouldCreateUser: true }
        });
        if (error) return showToast(error.message, 'error');
        showToast('OTP resent');
        hintEl.textContent = `Code resent to ${authState.pendingEmail}.`;
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
