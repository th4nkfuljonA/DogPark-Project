/* ============================================================
   CERTIFIEDCITYWHIPS — AUTH MODULE
   localStorage-based authentication system
   ============================================================ */

const CCW_AUTH = (function () {
    const USERS_KEY = 'ccw_users';
    const SESSION_KEY = 'ccw_session';
    const RENTALS_KEY = 'ccw_rentals';

    function _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    }

    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function _hashPassword(password) {
        // Simple hash for demo — NOT secure for production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    function signup(name, email, password) {
        const users = _getUsers();
        const emailLower = email.toLowerCase().trim();

        if (users.find(u => u.email === emailLower)) {
            return { success: false, error: 'An account with this email already exists.' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const user = {
            id: 'usr_' + Date.now(),
            name: name.trim(),
            email: emailLower,
            passwordHash: _hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(user);
        _saveUsers(users);

        // Auto-login after signup
        const session = { userId: user.id, name: user.name, email: user.email };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true, user: session };
    }

    function login(email, password) {
        const users = _getUsers();
        const emailLower = email.toLowerCase().trim();
        const user = users.find(u => u.email === emailLower);

        if (!user) {
            return { success: false, error: 'No account found with this email.' };
        }

        if (user.passwordHash !== _hashPassword(password)) {
            return { success: false, error: 'Incorrect password. Please try again.' };
        }

        const session = { userId: user.id, name: user.name, email: user.email };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, user: session };
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

    // ── Rentals ──
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
