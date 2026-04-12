/* ============================================================
   CERTIFIEDCITYWHIPS — AUTH MODULE (DATABASE-BACKED)
   Signup and login go through the Node.js API → MariaDB
   Session is stored in localStorage (who is logged in)
   but actual user accounts live in the database
   ============================================================ */

const CCW_AUTH = (function () {
    const SESSION_KEY = 'ccw_session';
    const RENTALS_KEY = 'ccw_rentals';

    async function signup(name, email, password) {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Save session locally so the browser knows who is logged in
                localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
            }

            return data;
        } catch (err) {
            console.error('Signup error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async function login(email, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Save session locally so the browser knows who is logged in
                localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
            }

            return data;
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getCurrentUser() {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    // ── Rentals (still localStorage for now) ──
    function _getRentals() {
        return JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');
    }

    function addRental(rental) {
        const rentals = _getRentals();
        rentals.push({
            ...rental,
            id: 'rnl_' + Date.now(),
            status: 'active',
            bookedAt: new Date().toISOString()
        });
        localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
    }

    function getUserRentals() {
        const user = getCurrentUser();
        if (!user) return [];
        return _getRentals().filter(r => r.userId === user.userId);
    }

    return { signup, login, logout, getCurrentUser, isLoggedIn, addRental, getUserRentals };
})();
