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

// ===== RENDER FLEET FILTERS =====
function renderFleetFilters() {
  const fleetFilters = document.getElementById('fleetFilters');
  if (!fleetFilters) return;
  
  let html = `<button class="ff active" data-f="all" data-i18n="fleet.filter.all">All</button>`;
  VEHICLE_CLASSES.forEach(cls => {
    html += `<button class="ff" data-f="${cls.name}">${cls.name}</button>`;
  });
  fleetFilters.innerHTML = html;
  // Re-apply translations for the "All" button
  if (window.CCW_I18N) CCW_I18N.applyTranslations();
}

// ===== RENDER FLEET =====
function renderFleet(filter = 'all') {
  const grid = document.getElementById('fleetGrid');
  if (!grid) return;

  // Only show available rental cars on the homepage fleet grid
  const rentalCars = getAvailableRentalCars();
  const list = filter === 'all' ? rentalCars : rentalCars.filter(c => c.className === filter);

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);grid-column:1/-1;padding:40px;">No vehicles found in this category.</p>';
    return;
  }

  grid.innerHTML = list.map((car, i) => {
    const isFeatured = car.tag === 'featured';
    const cardStyle = isFeatured
      ? `transition-delay:${i * 0.06}s; border:2px solid rgba(0,255,255,0.5); box-shadow:0 0 25px rgba(0,255,255,0.15), 0 0 60px rgba(255,0,80,0.08); position:relative; background:linear-gradient(135deg, rgba(0,255,255,0.05), rgba(255,0,80,0.05)); animation:cyberGlow 3s ease-in-out infinite alternate;`
      : `transition-delay:${i * 0.06}s`;
    const badge = isFeatured
      ? `<span class="cc-tag" style="background:linear-gradient(135deg,#00ffff,#ff0050);color:#000;font-weight:800;letter-spacing:0.08em;padding:6px 14px;font-size:0.7rem;">⚡ FEATURED</span>`
      : `<span class="cc-tag">${car.tag}</span>`;

    return `
    <div class="car-card reveal${isFeatured ? ' cc-featured' : ''}" data-id="${car.id}" style="${cardStyle}">
      <div class="cc-img" style="background:linear-gradient(135deg,${car.c1}22,${car.c2}11)">
        ${car.imageUrl ? `<img src="${car.imageUrl}" alt="${car.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div style="display:none">${makeSVG(car.c1, car.c2)}</div>` : makeSVG(car.c1, car.c2)}
        ${badge}
      </div>
      <div class="cc-body">
        <div class="cc-top">
          <div>
            <div class="cc-name"${isFeatured ? ' style="background:linear-gradient(90deg,#00ffff,#ff0050);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;"' : ''}>${car.year} ${car.name}</div>
            <div class="cc-year">${car.className} · ${car.locationName}</div>
          </div>
          <div class="cc-price">
            <div class="cc-amt"${isFeatured ? ' style="color:#00ffff"' : ''}>$${car.price}</div>
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
          <button class="cc-book"${isFeatured ? ' style="background:linear-gradient(135deg,#00ffff,#ff0050);color:#000;font-weight:700;"' : ''} onclick="bookCar(${car.id})">Book Now</button>
          <button class="cc-detail" onclick="openModal(${car.id})">Details</button>
        </div>
      </div>
    </div>
  `}).join('');

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
let _bookingCarId = null;

async function bookCar(id) {
  const car = await getCarById(id);
  if (!car) return;

  _bookingCarId = id;

  // Pre-fill dates from the search form if they exist, otherwise use defaults
  const pdate = document.getElementById('pdate');
  const rdate = document.getElementById('rdate');
  const bookPickup = document.getElementById('bookPickup');
  const bookReturn = document.getElementById('bookReturn');

  if (pdate && pdate.value) bookPickup.value = pdate.value;
  if (rdate && rdate.value) bookReturn.value = rdate.value;

  // Set min dates
  const today = new Date().toISOString().split('T')[0];
  bookPickup.min = today;
  bookReturn.min = today;

  // If no dates pre-set, use tomorrow and +7 days
  if (!bookPickup.value) {
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    bookPickup.value = tom.toISOString().split('T')[0];
  }
  if (!bookReturn.value) {
    const nw = new Date(); nw.setDate(nw.getDate() + 7);
    bookReturn.value = nw.toISOString().split('T')[0];
  }

  document.getElementById('bookModalTitle').textContent = `${car.year} ${car.name}`;
  _updateBookPrice(car);

  const bg = document.getElementById('bookModalBg');
  bg.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function _updateBookPrice(car) {
  const p = new Date(document.getElementById('bookPickup').value);
  const r = new Date(document.getElementById('bookReturn').value);
  const days = Math.max(1, Math.ceil((r - p) / (1000 * 60 * 60 * 24)));
  const total = car.price * days;
  document.getElementById('bookModalSub').textContent = `${car.className} · $${car.price}/day`;
  document.getElementById('bookModalPrice').textContent = `${days} day${days > 1 ? 's' : ''} × $${car.price} = $${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function _closeBookModal() {
  document.getElementById('bookModalBg').style.display = 'none';
  document.body.style.overflow = '';
  _bookingCarId = null;
}

// Wire up book modal events after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const bookModalBg = document.getElementById('bookModalBg');
  const bookModalX = document.getElementById('bookModalX');
  const bookPickup = document.getElementById('bookPickup');
  const bookReturn = document.getElementById('bookReturn');
  const bookConfirm = document.getElementById('bookModalConfirm');

  if (!bookModalBg) return; // Not on index page

  bookModalX.addEventListener('click', _closeBookModal);
  bookModalBg.addEventListener('click', e => { if (e.target === bookModalBg) _closeBookModal(); });

  // Update price when dates change
  async function onDateChange() {
    if (!_bookingCarId) return;
    const car = await getCarById(_bookingCarId);
    if (car) _updateBookPrice(car);
  }
  bookPickup.addEventListener('change', onDateChange);
  bookReturn.addEventListener('change', onDateChange);

  // Confirm booking
  bookConfirm.addEventListener('click', async () => {
    if (!_bookingCarId) return;
    const pickup = bookPickup.value;
    const ret = bookReturn.value;
    if (!pickup || !ret) { toast('Please select both dates.'); return; }
    if (new Date(ret) <= new Date(pickup)) { toast('Return date must be after pick-up date.'); return; }

    const added = await CCW_CART.addToCart(_bookingCarId, pickup, ret);
    const car = await getCarById(_bookingCarId);
    if (added) {
      toast(`✓ ${car.year} ${car.name} added to cart!`);
    } else {
      toast(`Could not add vehicle to cart.`);
    }
    _closeBookModal();
  });
});

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
  if (window.CCW_DB_READY) await window.CCW_DB_READY;
  renderFleetFilters();
  renderFleet();
  renderSaleVehicles();
});
