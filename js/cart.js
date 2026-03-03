/* ============================================================
   CERTIFIEDCITYWHIPS — CART MODULE
   localStorage-based shopping cart
   Supports: rentals, vehicle sales, products, and services
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

    // Add a rental vehicle to cart
    async function addToCart(carId, pickupDate, returnDate) {
        const car = await getCarById(carId);
        if (!car || car.listingType !== 'rental') return false;

        const cart = _getCart();
        const p = new Date(pickupDate);
        const r = new Date(returnDate);
        const days = Math.max(1, Math.ceil((r - p) / (1000 * 60 * 60 * 24)));

        cart.push({
            itemType: 'rental',
            carId: car.id,
            carName: car.year + ' ' + car.name,
            carImage: car.imageUrl,
            carFallback: car.fallbackGradient,
            pricePerDay: car.price,
            days: days,
            total: car.price * days,
            pickupDate: pickupDate,
            returnDate: returnDate,
            locationId: car.locationId,
            locationName: car.locationName,
            addedAt: new Date().toISOString()
        });

        _saveCart(cart);
        return true;
    }

    // Add a vehicle for sale to cart
    function addVehicleSaleToCart(car) {
        if (!car || car.listingType !== 'sale') return false;
        const cart = _getCart();

        // Check if already in cart
        const exists = cart.find(item => item.itemType === 'vehicle_sale' && item.carId === car.id);
        if (exists) return false;

        cart.push({
            itemType: 'vehicle_sale',
            carId: car.id,
            carName: car.year + ' ' + car.name,
            carImage: car.imageUrl,
            carFallback: car.fallbackGradient,
            pricePerDay: null,
            days: null,
            total: car.salePrice,
            pickupDate: null,
            returnDate: null,
            locationId: car.locationId,
            locationName: car.locationName,
            mileage: car.mileage,
            addedAt: new Date().toISOString()
        });

        _saveCart(cart);
        return true;
    }

    // Add a product (tire, detailing, accessory) to cart
    async function addProductToCart(productId, quantity) {
        if (typeof getProductById !== 'function') return false;
        const product = await getProductById(productId);
        if (!product) return false;

        const cart = _getCart();
        const qty = quantity || 1;

        // Check if already in cart, if so increase quantity
        const existing = cart.find(item => item.itemType === 'product' && item.productId === product.id);
        if (existing) {
            existing.quantity += qty;
            existing.total = existing.quantity * product.price;
            _saveCart(cart);
            return true;
        }

        cart.push({
            itemType: 'product',
            productId: product.id,
            carId: null,
            carName: product.name,
            carImage: null,
            carFallback: product.fallbackGradient,
            pricePerDay: product.price,
            days: null,
            quantity: qty,
            total: product.price * qty,
            categoryName: product.categoryName,
            sku: product.sku,
            pickupDate: null,
            returnDate: null,
            addedAt: new Date().toISOString()
        });

        _saveCart(cart);
        return true;
    }

    // Add a service to cart
    function addServiceToCart(serviceName, pricePerDay, planTier) {
        const cart = _getCart();

        const exists = cart.find(item => item.itemType === 'service' && item.carName === serviceName && item.planTier === planTier);
        if (exists) return false;

        cart.push({
            itemType: 'service',
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

    document.addEventListener('DOMContentLoaded', _updateBadge);

    return {
        addToCart,
        addVehicleSaleToCart,
        addProductToCart,
        addServiceToCart,
        removeFromCart,
        getCart,
        getCartCount,
        getCartTotal,
        clearCart
    };
})();
