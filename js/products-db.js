/* ============================================================
   CERTIFIEDCITYWHIPS — PRODUCTS DATABASE (API-BACKED)
   Fetches product data from the Node.js API server
   which connects to MariaDB on the Red Hat server
   ============================================================ */

const CCW_PRODUCTS_API = (function () {
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
            console.error('CCW_PRODUCTS_API fetch error:', err.message);
            return null;
        }
    }

    function clearCache() { _cache = {}; }

    return { _fetch, clearCache };
})();

/* ── PRODUCT CATEGORIES ────────────────────────────────────── */
const PRODUCT_CATEGORIES = [];

(async function loadCategories() {
    const cats = await CCW_PRODUCTS_API._fetch('/product-categories');
    if (cats) PRODUCT_CATEGORIES.push(...cats);
})();

/* ── PRODUCTS DATA ─────────────────────────────────────────── */
// This array is populated async on load for backward compat
const PRODUCTS_DB = [];

(async function loadProducts() {
    const products = await CCW_PRODUCTS_API._fetch('/products');
    if (products) PRODUCTS_DB.push(...products);
})();

/* ── HELPER FUNCTIONS ──────────────────────────────────────── */
// These now work with the populated array OR can fetch directly

async function getProductById(id) {
    // Try local cache first
    const local = PRODUCTS_DB.find(p => p.id === parseInt(id));
    if (local) return local;
    // Fallback to API
    return await CCW_PRODUCTS_API._fetch('/products/' + parseInt(id));
}

async function getProductsByCategory(categoryId) {
    if (!categoryId || categoryId === 'all') {
        if (PRODUCTS_DB.length > 0) return PRODUCTS_DB.filter(p => p.isActive);
        const all = await CCW_PRODUCTS_API._fetch('/products');
        return all || [];
    }
    // Try local first
    if (PRODUCTS_DB.length > 0) {
        return PRODUCTS_DB.filter(p => p.categoryId === parseInt(categoryId) && p.isActive);
    }
    const cats = await CCW_PRODUCTS_API._fetch('/products/category/' + parseInt(categoryId));
    return cats || [];
}

function getProductCategoryByName(name) {
    return PRODUCT_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

async function getTireProducts() {
    if (PRODUCTS_DB.length > 0) return PRODUCTS_DB.filter(p => p.isTire && p.isActive);
    const all = await CCW_PRODUCTS_API._fetch('/products');
    return all ? all.filter(p => p.isTire) : [];
}

async function getDetailingProducts() {
    if (PRODUCTS_DB.length > 0) return PRODUCTS_DB.filter(p => p.categoryId === 2 && p.isActive);
    const cats = await CCW_PRODUCTS_API._fetch('/products/category/2');
    return cats || [];
}

async function getAccessories() {
    if (PRODUCTS_DB.length > 0) return PRODUCTS_DB.filter(p => p.categoryId === 3 && p.isActive);
    const cats = await CCW_PRODUCTS_API._fetch('/products/category/3');
    return cats || [];
}

async function searchProducts(query) {
    if (!query) return [];
    const results = await CCW_PRODUCTS_API._fetch('/products/search?q=' + encodeURIComponent(query.trim()));
    return results || [];
}

function getStockStatus(product) {
    if (product.stock <= 10) return 'LOW STOCK';
    if (product.stock <= 20) return 'MEDIUM';
    return 'IN STOCK';
}
