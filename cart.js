/* ============================================================
   CERTIFIEDCITYWHIPS — CART MODULE
   localStorage-based shopping cart
   ============================================================ */

const CCW_CART = (function () {
    const CART_KEY = 'ccw_cart';

    function _getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    }

    function _saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        _updateBadge();
    }

    function addToCart(carId, pickupDate, returnDate) {
        const car = getCarById(carId); // from cars-db.js
        if (!car) return false;

        const cart = _getCart();

        // Calculate days
        const p = new Date(pickupDate);
        const r = new Date(returnDate);
        const days = Math.max(1, Math.ceil((r - p) / (1000 * 60 * 60 * 24)));

        cart.push({
            carId: car.id,
            carName: car.name,
            carImage: car.imageUrl,
            carFallback: car.fallbackGradient,
            pricePerDay: car.price,
            days: days,
            total: car.price * days,
            pickupDate: pickupDate,
            returnDate: returnDate,
            addedAt: new Date().toISOString()
        });

        _saveCart(cart);
        return true;
    }

    function addServiceToCart(serviceName, pricePerDay, planTier) {
        const cart = _getCart();

        // Check if this exact service+tier already exists
        const exists = cart.find(item => item.isService && item.carName === serviceName && item.planTier === planTier);
        if (exists) return false; // already added

        cart.push({
            isService: true,
            carId: null,
            carName: serviceName,
            carImage: null,
            carFallback: 'linear-gradient(135deg, rgba(200,16,46,0.3), rgba(100,8,23,0.5))',
            pricePerDay: pricePerDay,
            planTier: planTier,
            days: 1,
            total: pricePerDay,
            pickupDate: null,
            returnDate: null,
            addedAt: new Date().toISOString()
        });

        _saveCart(cart);
        return true;
    }

    function removeFromCart(index) {
        const cart = _getCart();
        cart.splice(index, 1);
        _saveCart(cart);
    }

    function getCart() {
        return _getCart();
    }

    function getCartCount() {
        return _getCart().length;
    }

    function getCartTotal() {
        return _getCart().reduce((sum, item) => sum + item.total, 0);
    }

    function clearCart() {
        _saveCart([]);
    }

    function _updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = getCartCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Update badge on page load
    document.addEventListener('DOMContentLoaded', _updateBadge);

    return { addToCart, addServiceToCart, removeFromCart, getCart, getCartCount, getCartTotal, clearCart };
})();
