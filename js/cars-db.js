/* ============================================================
   CERTIFIEDCITYWHIPS — DATABASE MODULE (API-BACKED)
   Fetches vehicle, location, and service data from the
   Node.js API server connected to MariaDB on Red Hat
   ============================================================ */

const CCW_API = (function () {
    const API_BASE = '/api';
    let _cache = {};

    async function _fetch(url) {
        if (_cache[url]) return _cache[url];
        try {
            const res = await fetch(API_BASE + url);
            if (!res.ok) throw new Error('API error: ' + res.status);
            const data = await res.json();
            _cache[url] = data;
            return data;
        } catch (err) {
            console.error('CCW_API fetch error:', err.message);
            return null;
        }
    }

    function clearCache() { _cache = {}; }

    return { _fetch, clearCache };
})();

/* ── LOCATIONS ─────────────────────────────────────────────── */
const LOCATIONS_DB = [];

const pLocations = (async function loadLocations() {
    const locs = await CCW_API._fetch('/locations');
    if (locs) LOCATIONS_DB.push(...locs);
})();

/* ── VEHICLE CLASSES ───────────────────────────────────────── */
const VEHICLE_CLASSES = [];

const pClasses = (async function loadClasses() {
    const classes = await CCW_API._fetch('/vehicle-classes');
    if (classes) VEHICLE_CLASSES.push(...classes);
})();

/* ── VEHICLES ──────────────────────────────────────────────── */
const CARS_DB = [];

const pVehicles = (async function loadVehicles() {
    const cars = await CCW_API._fetch('/vehicles');
    if (cars) CARS_DB.push(...cars);
})();

/* ── SERVICES ──────────────────────────────────────────────── */
const SERVICES_DB = [];

const pServices = (async function loadServices() {
    const services = await CCW_API._fetch('/services');
    if (services) SERVICES_DB.push(...services);
})();

window.CCW_DB_READY = Promise.all([pLocations, pClasses, pVehicles, pServices]);

/* ── HELPER FUNCTIONS ──────────────────────────────────────── */

// Vehicles
async function getCarById(id) {
    const local = CARS_DB.find(c => c.id === parseInt(id));
    if (local) return local;
    return await CCW_API._fetch('/vehicles/' + parseInt(id));
}

async function getCarsByCategory(category) {
    if (!category || category === 'all') {
        if (CARS_DB.length > 0) return CARS_DB;
        const all = await CCW_API._fetch('/vehicles');
        return all || [];
    }
    if (CARS_DB.length > 0) return CARS_DB.filter(c => c.category === category);
    const filtered = await CCW_API._fetch('/vehicles/filter/' + encodeURIComponent(category));
    return filtered || [];
}

function getRentalCars() {
    return CARS_DB.filter(c => c.listingType === 'rental');
}

function getSaleCars() {
    return CARS_DB.filter(c => c.listingType === 'sale');
}

function getAvailableRentalCars() {
    return CARS_DB.filter(c => c.listingType === 'rental' && c.status === 'available');
}

function getAvailableSaleCars() {
    return CARS_DB.filter(c => c.listingType === 'sale' && c.status === 'available');
}

function getCarsByLocation(locationId) {
    return CARS_DB.filter(c => c.locationId === parseInt(locationId));
}

async function searchCars(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    // Try local first (faster)
    if (CARS_DB.length > 0) {
        return CARS_DB.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.make.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.categoryLabel.toLowerCase().includes(q) ||
            c.className.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.fuel.toLowerCase().includes(q) ||
            c.tag.toLowerCase().includes(q) ||
            (c.features && c.features.some(f => f.toLowerCase().includes(q)))
        );
    }
    // Fallback to API search
    const results = await CCW_API._fetch('/vehicles/search?q=' + encodeURIComponent(q));
    return results || [];
}

function getRelatedCars(carId, limit = 3) {
    const car = CARS_DB.find(c => c.id === parseInt(carId));
    if (!car) return [];
    return CARS_DB
        .filter(c => c.id !== car.id && c.listingType === car.listingType && (c.category === car.category || Math.abs(c.price - car.price) < 30))
        .slice(0, limit);
}

// Locations
function getLocationById(id) {
    return LOCATIONS_DB.find(l => l.id === parseInt(id));
}

function getActiveLocations() {
    return LOCATIONS_DB.filter(l => l.isActive);
}

// Services
function getServiceById(id) {
    return SERVICES_DB.find(s => s.id === parseInt(id));
}

function getRentalAddons() {
    return SERVICES_DB.filter(s => s.isRentalAddon);
}
