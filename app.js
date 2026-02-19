// ============================================
// CERTIFIEDCITYWHIPS — APP.JS
// ============================================

// ===== FLEET DATA =====
const fleet = [
  {
    id: 1, name: "Porsche 911 Turbo S", year: 2024, cat: "sports",
    price: 349, seats: 2, trans: "Auto", fuel: "Petrol",
    hp: "650 HP", accel: "2.7s 0–60", top: "205 mph",
    c1: "#cc0000", c2: "#7f0000",
    tag: "sports",
    desc: "The pinnacle of sports car engineering. Raw, unadulterated performance wrapped in iconic Porsche design.",
    feats: ["Heated Seats", "Sport Chrono", "PASM", "Bose Sound", "Night Vision", "Apple CarPlay"]
  },
  {
    id: 2, name: "Tesla Model S Plaid", year: 2024, cat: "electric",
    price: 279, seats: 5, trans: "Auto", fuel: "Electric",
    hp: "1,020 HP", accel: "1.99s 0–60", top: "200 mph",
    c1: "#111", c2: "#333",
    tag: "electric",
    desc: "The fastest production sedan ever made. Zero emissions, infinite thrills.",
    feats: ["Autopilot", "17\" Display", "Gaming", "Air Suspension", "HEPA Filter", "FSD"]
  },
  {
    id: 3, name: "Range Rover Autobiography", year: 2024, cat: "suv",
    price: 319, seats: 5, trans: "Auto", fuel: "Hybrid",
    hp: "530 HP", accel: "5.1s 0–60", top: "155 mph",
    c1: "#2c2c2c", c2: "#444",
    tag: "suv",
    desc: "The ultimate luxury SUV. Commanding presence meets extraordinary refinement.",
    feats: ["Meridian Sound", "Massage Seats", "Air Suspension", "Panoramic Roof", "4x4", "Night Vision"]
  },
  {
    id: 4, name: "Lamborghini Huracán", year: 2023, cat: "sports",
    price: 599, seats: 2, trans: "Auto", fuel: "Petrol",
    hp: "631 HP", accel: "2.9s 0–60", top: "202 mph",
    c1: "#cc0000", c2: "#990000",
    tag: "sports",
    desc: "A visceral supercar experience. Every drive is an event you'll never forget.",
    feats: ["Carbon Fiber", "Lifting System", "Alcantara Interior", "Sport Exhaust", "Rear Camera", "Launch Control"]
  },
  {
    id: 5, name: "Mercedes S-Class AMG", year: 2024, cat: "luxury",
    price: 289, seats: 5, trans: "Auto", fuel: "Petrol",
    hp: "503 HP", accel: "4.4s 0–60", top: "155 mph",
    c1: "#1a1a1a", c2: "#2c2c2c",
    tag: "luxury",
    desc: "The benchmark of automotive luxury. Effortless power meets supreme comfort.",
    feats: ["Burmester 4D", "Rear Executive Seats", "MBUX", "E-Active Body", "AR Navigation", "Massage Seats"]
  },
  {
    id: 6, name: "BMW M4 Competition", year: 2024, cat: "sports",
    price: 219, seats: 4, trans: "Auto", fuel: "Petrol",
    hp: "503 HP", accel: "3.4s 0–60", top: "180 mph",
    c1: "#333", c2: "#555",
    tag: "sports",
    desc: "The perfect blend of track performance and daily usability. Pure driving pleasure.",
    feats: ["M Sport Seats", "Harman Kardon", "M Drive Pro", "Adaptive M Suspension", "HUD", "Wireless CarPlay"]
  },
  {
    id: 7, name: "Cadillac Escalade ESV", year: 2024, cat: "suv",
    price: 249, seats: 8, trans: "Auto", fuel: "Petrol",
    hp: "420 HP", accel: "5.9s 0–60", top: "130 mph",
    c1: "#1a1a1a", c2: "#333",
    tag: "suv",
    desc: "American luxury at its finest. Commanding, spacious, and impossibly comfortable.",
    feats: ["AKG Sound", "Curved OLED", "Super Cruise", "Air Ride", "Panoramic Sunroof", "Rear Entertainment"]
  },
  {
    id: 8, name: "Audi A3 Premium", year: 2024, cat: "economy",
    price: 89, seats: 5, trans: "Auto", fuel: "Petrol",
    hp: "201 HP", accel: "6.6s 0–60", top: "130 mph",
    c1: "#555", c2: "#777",
    tag: "economy",
    desc: "Premium quality without the premium price. Smart, efficient, and refined.",
    feats: ["Virtual Cockpit", "MMI Navigation", "Wireless Charging", "LED Headlights", "Parking Assist", "Apple CarPlay"]
  },
  {
    id: 9, name: "Bentley Continental GT", year: 2024, cat: "luxury",
    price: 499, seats: 4, trans: "Auto", fuel: "Petrol",
    hp: "659 HP", accel: "3.6s 0–60", top: "207 mph",
    c1: "#2c2c2c", c2: "#1a1a1a",
    tag: "luxury",
    desc: "Handcrafted British excellence. The grand tourer that defines the genre.",
    feats: ["Naim Audio", "Rotating Display", "Handcrafted Interior", "Air Suspension", "Night Vision", "Massage Seats"]
  }
];

// ===== SVG GENERATOR =====
function makeSVG(c1, c2) {
  const uid = Math.random().toString(36).slice(2, 9);
  return `<svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg" class="cc-svg">
    <defs>
      <linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="f${uid}">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <ellipse cx="250" cy="162" rx="190" ry="10" fill="rgba(0,0,0,0.2)"/>
    <circle cx="130" cy="148" r="28" fill="#111" stroke="${c1}" stroke-width="2"/>
    <circle cx="130" cy="148" r="17" fill="#1a1a1a" stroke="${c1}" stroke-width="1.5" opacity="0.7"/>
    <circle cx="130" cy="148" r="6" fill="${c1}"/>
    <circle cx="370" cy="148" r="28" fill="#111" stroke="${c1}" stroke-width="2"/>
    <circle cx="370" cy="148" r="17" fill="#1a1a1a" stroke="${c1}" stroke-width="1.5" opacity="0.7"/>
    <circle cx="370" cy="148" r="6" fill="${c1}"/>
    <path d="M50 135 Q58 122 80 118 L140 118 L155 78 Q168 58 195 55 L305 55 Q335 55 355 72 L390 98 L430 102 Q452 104 458 116 L462 135 Z" fill="url(#g${uid})" filter="url(#f${uid})"/>
    <path d="M160 118 L172 78 Q182 62 205 59 L295 59 Q320 59 338 74 L365 98 L160 98 Z" fill="rgba(200,220,255,0.14)"/>
    <line x1="255" y1="59" x2="255" y2="98" stroke="rgba(0,0,0,0.35)" stroke-width="3"/>
    <ellipse cx="448" cy="120" rx="10" ry="6" fill="#fffde7" opacity="0.9"/>
    <ellipse cx="62" cy="126" rx="7" ry="5" fill="#cc0000" opacity="0.85"/>
  </svg>`;
}

// ===== RENDER FLEET =====
function renderFleet(filter = 'all') {
  const grid = document.getElementById('fleetGrid');
  const list = filter === 'all' ? fleet : fleet.filter(c => c.cat === filter);

  grid.innerHTML = list.map((car, i) => `
    <div class="car-card reveal" data-id="${car.id}" style="transition-delay:${i * 0.06}s">
      <div class="cc-img" style="background:linear-gradient(135deg,${car.c1}22,${car.c2}11)">
        ${makeSVG(car.c1, car.c2)}
        <span class="cc-tag">${car.tag}</span>
      </div>
      <div class="cc-body">
        <div class="cc-top">
          <div>
            <div class="cc-name">${car.name}</div>
            <div class="cc-year">${car.year}</div>
          </div>
          <div class="cc-price">
            <div class="cc-amt">$${car.price}</div>
            <div class="cc-per">/day</div>
          </div>
        </div>
        <div class="cc-specs">
          <span class="cc-spec">👤 ${car.seats}</span>
          <span class="cc-spec">⚙️ ${car.trans}</span>
          <span class="cc-spec">⛽ ${car.fuel}</span>
          <span class="cc-spec">🏎 ${car.hp}</span>
        </div>
        <div class="cc-actions">
          <button class="cc-book" onclick="bookCar(${car.id})">Book Now</button>
          <button class="cc-detail" onclick="openModal(${car.id})">Details</button>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(() => {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('vis'));
  }, 60);
}

// ===== FILTER =====
document.getElementById('fleetFilters').addEventListener('click', e => {
  const btn = e.target.closest('.ff');
  if (!btn) return;
  document.querySelectorAll('.ff').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFleet(btn.dataset.f);
});

// ===== MODAL =====
function openModal(id) {
  const car = fleet.find(c => c.id === id);
  if (!car) return;
  document.getElementById('modalBody').innerHTML = `
    <span class="m-tag">${car.tag}</span>
    <div class="m-name">${car.name}</div>
    <div class="m-price">$${car.price}<span>/day</span></div>
    <p class="m-desc">${car.desc}</p>
    <div class="m-specs">
      <div class="m-spec"><div class="m-spec-l">Power</div><div class="m-spec-v">${car.hp}</div></div>
      <div class="m-spec"><div class="m-spec-l">0–60 mph</div><div class="m-spec-v">${car.accel}</div></div>
      <div class="m-spec"><div class="m-spec-l">Top Speed</div><div class="m-spec-v">${car.top}</div></div>
      <div class="m-spec"><div class="m-spec-l">Seats</div><div class="m-spec-v">${car.seats} Passengers</div></div>
    </div>
    <div class="m-feats">
      <div class="m-feats-label">Included Features</div>
      <div class="m-tags">${car.feats.map(f => `<span class="m-feat-tag">${f}</span>`).join('')}</div>
    </div>
    <button class="cta-primary w-full" onclick="bookCar(${car.id}); closeModal()">Reserve — $${car.price}/day →</button>
  `;
  document.getElementById('modalBg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalX').addEventListener('click', closeModal);
document.getElementById('modalBg').addEventListener('click', e => {
  if (e.target === document.getElementById('modalBg')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== BOOK =====
function bookCar(id) {
  const car = fleet.find(c => c.id === id);
  if (!car) return;
  toast(`${car.name} added — complete your booking above.`);
  document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
}

// ===== TOAST =====
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ===== BOOK FORM =====
document.getElementById('bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('bookSubmit');
  const city = document.getElementById('city').value;
  const pd = document.getElementById('pdate').value;
  const rd = document.getElementById('rdate').value;
  if (!city || !pd || !rd) { toast('Please fill in all fields.'); return; }
  if (new Date(rd) <= new Date(pd)) { toast('Return date must be after pick-up date.'); return; }
  btn.textContent = 'Searching...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Search Whips →';
    btn.disabled = false;
    document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' });
    toast(`${fleet.length} whips available in ${city}!`);
  }, 1200);
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('cSubmit');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send It →';
    btn.disabled = false;
    e.target.reset();
    toast("Message sent! We'll hit you back within 24 hours.");
  }, 1200);
});

// ===== HAMBURGER =====
document.getElementById('burger').addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('open');
});

// ===== DARK / LIGHT TOGGLE =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

const saved = localStorage.getItem('ccw-theme') || 'dark';
html.setAttribute('data-theme', saved);
themeIcon.textContent = saved === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('ccw-theme', next);
});

// ===== DEFAULT DATES =====
function setDates() {
  const today = new Date();
  const tom = new Date(today); tom.setDate(today.getDate() + 1);
  const nw = new Date(today); nw.setDate(today.getDate() + 7);
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('pdate').value = fmt(tom);
  document.getElementById('rdate').value = fmt(nw);
  document.getElementById('pdate').min = fmt(today);
  document.getElementById('rdate').min = fmt(tom);
}

// ===== SCROLL REVEAL =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function observe() {
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderFleet();
  setDates();
  observe();
  document.querySelectorAll('.proc-step, .perk-item, .review-card, .c-block').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
});
