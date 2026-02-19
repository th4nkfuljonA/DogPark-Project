/* ============================================================
   CERTIFIEDCITYWHIPS — ccw-new.js
   Interactions, animations, form handling
   ============================================================ */

(function () {
    'use strict';

    // ── NAV SCROLL EFFECT ──────────────────────────────────────
    const nav = document.getElementById('nav');
    const scrollThreshold = 60;

    function onScroll() {
        if (window.scrollY > scrollThreshold) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load

    // ── BURGER MENU ────────────────────────────────────────────
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            burger.setAttribute('aria-expanded', isOpen);
        });

        // Close on nav link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    // ── REVEAL ON SCROLL ───────────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let delay = 0;
                siblings.forEach((sib, idx) => {
                    if (sib === entry.target) delay = idx * 80;
                });
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));

    // ── TOAST ──────────────────────────────────────────────────
    const toast = document.getElementById('toast');
    let toastTimer = null;

    function showToast(msg, duration = 3000) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // ── BOOK FORM ──────────────────────────────────────────────
    const bookForm = document.getElementById('bookForm');

    if (bookForm) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        const pdateEl = document.getElementById('pdate');
        const rdateEl = document.getElementById('rdate');

        if (pdateEl) {
            pdateEl.min = today;
            pdateEl.addEventListener('change', () => {
                if (rdateEl) {
                    rdateEl.min = pdateEl.value;
                    if (rdateEl.value && rdateEl.value < pdateEl.value) {
                        rdateEl.value = pdateEl.value;
                    }
                }
            });
        }

        bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = document.getElementById('city')?.value;
            const pdate = pdateEl?.value;
            const rdate = rdateEl?.value;

            if (!city) { showToast('⚠️ Please select a city'); return; }
            if (!pdate) { showToast('⚠️ Please select a pick-up date'); return; }
            if (!rdate) { showToast('⚠️ Please select a return date'); return; }
            if (rdate < pdate) { showToast('⚠️ Return date must be after pick-up'); return; }

            const btn = document.getElementById('bookSubmit');
            if (btn) {
                btn.textContent = 'Searching...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
            }

            setTimeout(() => {
                showToast(`✅ Found available whips in ${city}!`);
                if (btn) {
                    btn.textContent = 'Search →';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }, 1200);
        });
    }

    // ── CONTACT FORM ───────────────────────────────────────────
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cname')?.value.trim();
            const email = document.getElementById('cemail')?.value.trim();
            const msg = document.getElementById('cmsg')?.value.trim();

            if (!name) { showToast('⚠️ Please enter your name'); return; }
            if (!email || !email.includes('@')) { showToast('⚠️ Please enter a valid email'); return; }
            if (!msg) { showToast('⚠️ Please enter a message'); return; }

            const btn = document.getElementById('cSubmit');
            if (btn) {
                btn.textContent = 'Sending...';
                btn.disabled = true;
                btn.style.opacity = '0.7';
            }

            setTimeout(() => {
                showToast('✅ Message sent! We\'ll be in touch soon.');
                contactForm.reset();
                if (btn) {
                    btn.textContent = 'Send Message →';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            }, 1400);
        });
    }

    // ── SMOOTH ANCHOR SCROLL ───────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = nav ? nav.offsetHeight : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── PARALLAX HERO ORBS ─────────────────────────────────────
    const orbs = document.querySelectorAll('.hero-orb');

    if (orbs.length) {
        window.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            orbs.forEach((orb, i) => {
                const factor = (i + 1) * 12;
                orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
            });
        }, { passive: true });
    }

    // ── HERO CAR SUBTLE PARALLAX ───────────────────────────────
    const heroCar = document.querySelector('.hero-car-stage');
    if (heroCar) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroHeight = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
            if (scrolled < heroHeight) {
                const progress = scrolled / heroHeight;
                heroCar.style.transform = `translateX(-50%) translateY(${progress * 40}px)`;
                heroCar.style.opacity = 1 - progress * 0.6;
            }
        }, { passive: true });
    }

    // ── FLEET CARD TILT ────────────────────────────────────────
    document.querySelectorAll('.fleet-cat-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease';
            setTimeout(() => { card.style.transition = ''; }, 400);
        });
    });

    // ── COUNTER ANIMATION ──────────────────────────────────────
    function animateCounter(el, target, suffix = '') {
        const duration = 1500;
        const start = performance.now();
        const isFloat = target % 1 !== 0;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = isFloat
                ? (eased * target).toFixed(1)
                : Math.floor(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    // Trigger counters when stats pill is visible
    const statsPill = document.querySelector('.hero-stats-pill');
    if (statsPill) {
        const statNums = statsPill.querySelectorAll('.hsp-num');
        const targets = [500, 50000, 4.9, 7];
        const suffixes = ['+', 'K+', '★', ''];
        let animated = false;

        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !animated) {
                animated = true;
                statNums.forEach((el, i) => {
                    const val = i === 1 ? 50 : targets[i];
                    animateCounter(el, val, suffixes[i]);
                });
            }
        }, { threshold: 0.5 });

        statsObserver.observe(statsPill);
    }

})();
