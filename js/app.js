// ============================================
// CERTIFIEDCITYWHIPS — APP.JS
// Uses CARS_DB from cars-db.js
// ============================================

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
  if (!grid) return;

  // Only show available rental cars on the homepage fleet grid
  const rentalCars = getAvailableRentalCars();
  const list = filter === 'all' ? rentalCars : rentalCars.filter(c => c.category === filter);

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);grid-column:1/-1;padding:40px;">No vehicles found in this category.</p>';
    return;
  }

  grid.innerHTML = list.map((car, i) => `
    <div class="car-card reveal" data-id="${car.id}" style="transition-delay:${i * 0.06}s">
      <div class="cc-img" style="background:linear-gradient(135deg,${car.c1}22,${car.c2}11)">
        ${car.imageUrl ? `<img src="${car.imageUrl}" alt="${car.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none">${makeSVG(car.c1, car.c2)}</div>` : makeSVG(car.c1, car.c2)}
        <span class="cc-tag">${car.tag}</span>
      </div>
      <div class="cc-body">
        <div class="cc-top">
          <div>
            <div class="cc-name">${car.year} ${car.name}</div>
            <div class="cc-year">${car.className} · ${car.locationName}</div>
          </div>
          <div class="cc-price">
            <div class="cc-amt">$${car.price}</div>
            <div class="cc-per">/day</div>
          </div>
        </div>
        <div class="cc-specs">
          <span class="cc-spec">${car.seats} Seats</span>
          <span class="cc-spec">${car.transmission}</span>
          <span class="cc-spec">${car.fuel}</span>
          <span class="cc-spec">${car.mileageType === 'unlimited' ? 'Unlimited Mi' : 'Limited Mi'}</span>
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

// ===== RENDER SALE VEHICLES =====
function renderSaleVehicles(filter = 'all') {
  const grid = document.getElementById('saleGrid');
  if (!grid) return;

  const saleCars = getAvailableSaleCars();
  const list = filter === 'all' ? saleCars : saleCars.filter(c => c.category === filter);

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);grid-column:1/-1;padding:40px;">No vehicles for sale in this category.</p>';
    return;
  }

  grid.innerHTML = list.map((car, i) => `
    <div class="car-card reveal" data-id="${car.id}" style="transition-delay:${i * 0.06}s">
      <div class="cc-img" style="background:linear-gradient(135deg,${car.c1}22,${car.c2}11)">
        ${car.imageUrl ? `<img src="${car.imageUrl}" alt="${car.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none">${makeSVG(car.c1, car.c2)}</div>` : makeSVG(car.c1, car.c2)}
        <span class="cc-tag" style="background:rgba(46,204,113,0.85)">FOR SALE</span>
      </div>
      <div class="cc-body">
        <div class="cc-top">
          <div>
            <div class="cc-name">${car.year} ${car.name}</div>
            <div class="cc-year">${car.className} · ${car.mileage.toLocaleString()} mi · ${car.locationName}</div>
          </div>
          <div class="cc-price">
            <div class="cc-amt">$${car.price.toLocaleString()}</div>
            <div class="cc-per"></div>
          </div>
        </div>
        <div class="cc-specs">
          <span class="cc-spec">${car.seats} Seats</span>
          <span class="cc-spec">${car.transmission}</span>
          <span class="cc-spec">${car.fuel}</span>
          <span class="cc-spec">${car.color}</span>
        </div>
        <div class="cc-actions">
          <button class="cc-book" onclick="addSaleToCart(${car.id})">Buy Now</button>
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
const fleetFilters = document.getElementById('fleetFilters');
if (fleetFilters) {
  fleetFilters.addEventListener('click', e => {
    const btn = e.target.closest('.ff');
    if (!btn) return;
    document.querySelectorAll('.ff').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderFleet(btn.dataset.f);
  });
}

// ===== MODAL =====
async function openModal(id) {
  const car = await getCarById(id);
  if (!car) return;

  const isForSale = car.listingType === 'sale';
  const priceDisplay = isForSale ? `$${car.price.toLocaleString()}` : `$${car.price}<span>/day</span>`;
  const actionBtn = isForSale
    ? `<button class="cta-primary w-full" onclick="addSaleToCart(${car.id}); closeModal()">Buy Now — $${car.price.toLocaleString()} →</button>`
    : `<button class="cta-primary w-full" onclick="bookCar(${car.id}); closeModal()">Reserve — $${car.price}/day →</button>`;

  document.getElementById('modalBody').innerHTML = `
    <span class="m-tag">${isForSale ? 'FOR SALE' : car.tag}</span>
    <div class="m-name">${car.year} ${car.name}</div>
    <div class="m-price">${priceDisplay}</div>
    <p class="m-desc">${car.description}</p>
    <div class="m-specs">
      <div class="m-spec"><div class="m-spec-l">Class</div><div class="m-spec-v">${car.className}</div></div>
      <div class="m-spec"><div class="m-spec-l">Fuel</div><div class="m-spec-v">${car.fuel}</div></div>
      <div class="m-spec"><div class="m-spec-l">Seats</div><div class="m-spec-v">${car.seats} Passengers</div></div>
      <div class="m-spec"><div class="m-spec-l">Location</div><div class="m-spec-v">${car.locationName}</div></div>
      ${isForSale ? `<div class="m-spec"><div class="m-spec-l">Mileage</div><div class="m-spec-v">${car.mileage.toLocaleString()} mi</div></div>` : `<div class="m-spec"><div class="m-spec-l">Mileage</div><div class="m-spec-v">${car.mileageType === 'unlimited' ? 'Unlimited' : 'Limited'}</div></div>`}
      <div class="m-spec"><div class="m-spec-l">Color</div><div class="m-spec-v">${car.color}</div></div>
    </div>
    <div class="m-feats">
      <div class="m-feats-label">Features</div>
      <div class="m-tags">${car.features.map(f => `<span class="m-feat-tag">${f}</span>`).join('')}</div>
    </div>
    ${actionBtn}
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
async function bookCar(id) {
  const car = await getCarById(id);
  if (!car) return;
  toast(`${car.year} ${car.name} selected — complete your booking above.`);
  document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
}

// ===== ADD SALE TO CART =====
async function addSaleToCart(id) {
  const car = await getCarById(id);
  if (!car || car.listingType !== 'sale') return;
  const added = CCW_CART.addVehicleSaleToCart(car);
  if (added) {
    toast(`${car.year} ${car.name} added to cart!`);
  } else {
    toast(`${car.year} ${car.name} is already in your cart.`);
  }
}

// ===== TOAST =====
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ===== BOOK FORM =====
const bookForm = document.getElementById('bookForm');
if (bookForm) {
  bookForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('bookSubmit');
    const loc = document.getElementById('location').value;
    const pd = document.getElementById('pdate').value;
    const rd = document.getElementById('rdate').value;
    if (!loc || !pd || !rd) { toast('Please fill in all fields.'); return; }
    if (new Date(rd) <= new Date(pd)) { toast('Return date must be after pick-up date.'); return; }
    btn.textContent = 'Searching...';
    btn.disabled = true;

    // Filter fleet by location if selected
    const locationName = document.getElementById('location').options[document.getElementById('location').selectedIndex].text;
    setTimeout(() => {
      btn.textContent = 'Search Whips →';
      btn.disabled = false;
      const available = getAvailableRentalCars();
      const filtered = loc === '' ? available : available.filter(c => c.locationId === parseInt(loc));
      document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' });
      toast(`${filtered.length} whips available at ${locationName}!`);
    }, 1200);
  });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
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
}

// ===== HAMBURGER =====
const burger = document.getElementById('burger');
if (burger) {
  burger.addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}

// ===== DARK / LIGHT TOGGLE =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

if (themeBtn && themeIcon) {
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
}

// ===== DEFAULT DATES =====
function setDates() {
  const today = new Date();
  const tom = new Date(today); tom.setDate(today.getDate() + 1);
  const nw = new Date(today); nw.setDate(today.getDate() + 7);
  const fmt = d => d.toISOString().split('T')[0];
  const pdate = document.getElementById('pdate');
  const rdate = document.getElementById('rdate');
  if (pdate && rdate) {
    pdate.value = fmt(tom);
    rdate.value = fmt(nw);
    pdate.min = fmt(today);
    rdate.min = fmt(tom);
  }
}

// ===== SCROLL REVEAL =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function observe() {
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  setDates();
  observe();
  document.querySelectorAll('.proc-step, .perk-item, .review-card, .c-block').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });

  // Wait for API data to populate before rendering vehicle grids
  await new Promise(r => setTimeout(r, 400));
  renderFleet();
  renderSaleVehicles();
});
