// fleet-page.js — Shared JS for CCW fleet sub-pages

// Theme
const html = document.documentElement;
const saved = localStorage.getItem('ccw-theme') || 'light';
html.setAttribute('data-theme', saved);
document.getElementById('themeIcon').textContent = saved === 'dark' ? '☀️' : '🌙';
document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = html.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('ccw-theme', next);
});

// Burger
document.getElementById('burger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
});

// Toast
function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

// Book
function bookVehicle(name, price) {
    showToast(`${name} selected — $${price}/day. Complete your booking!`);
    setTimeout(() => { window.location.href = 'index.html#book'; }, 1500);
}

// Info
function showInfo(name) {
    showToast(`More details on ${name} coming soon!`);
}

// Scroll reveal
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
    });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
