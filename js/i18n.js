/* ============================================================
   CCW — Internationalization (i18n) — English / Spanish
   Translates [data-i18n] elements + persists via localStorage
   ============================================================ */

const CCW_I18N = (() => {
    // ── Translation dictionary ──────────────────────────────────
    const T = {
        // ─── NAV ────────────────────────────────────────────────
        'nav.fleet': { en: 'Fleet', es: 'Flota' },
        'nav.shop': { en: 'Shop', es: 'Tienda' },
        'nav.services': { en: 'Services', es: 'Servicios' },
        'nav.contact': { en: 'Contact', es: 'Contacto' },
        'nav.login': { en: 'Login', es: 'Iniciar Sesión' },
        'nav.dashboard': { en: 'Dashboard', es: 'Panel' },

        // ─── HERO (index) ───────────────────────────────────────
        'hero.tagline': { en: 'Southern California\'s<br>Premium Car Rentals', es: 'Alquiler Premium de Autos<br>en el Sur de California' },
        'hero.btn.reserve': { en: 'Reserve a Whip', es: 'Reserva un Auto' },
        'hero.btn.browse': { en: 'Browse Fleet', es: 'Ver Flota' },

        // ─── MARQUEE ────────────────────────────────────────────
        'marquee.1': { en: 'CERTIFIED CITY WHIPS', es: 'CERTIFIED CITY WHIPS' },
        'marquee.2': { en: 'PREMIUM FLEET', es: 'FLOTA PREMIUM' },
        'marquee.3': { en: 'INSTANT BOOKING', es: 'RESERVA INMEDIATA' },
        'marquee.4': { en: 'FREE CANCELLATION', es: 'CANCELACIÓN GRATIS' },
        'marquee.5': { en: '24/7 SUPPORT', es: 'SOPORTE 24/7' },
        'marquee.6': { en: 'NO HIDDEN FEES', es: 'SIN CARGOS OCULTOS' },
        'marquee.7': { en: 'SOUTHERN CALIFORNIA', es: 'SUR DE CALIFORNIA' },

        // ─── BOOKING SECTION ────────────────────────────────────
        'book.eyebrow': { en: 'Find Your Ride', es: 'Encuentra Tu Auto' },
        'book.title': { en: 'Search Available Whips', es: 'Buscar Autos Disponibles' },
        'book.label.location': { en: 'Location', es: 'Ubicación' },
        'book.label.pickup': { en: 'Pick-up', es: 'Recogida' },
        'book.label.return': { en: 'Return', es: 'Devolución' },
        'book.label.type': { en: 'Type', es: 'Tipo' },
        'book.loc.all': { en: 'All locations...', es: 'Todas las ubicaciones...' },
        'book.loc.1': { en: 'Downtown Hub — San Bernardino', es: 'Centro — San Bernardino' },
        'book.loc.2': { en: 'Airport Terminal — San Bernardino', es: 'Terminal Aeropuerto — San Bernardino' },
        'book.loc.3': { en: 'Riverside Branch — Riverside', es: 'Sucursal Riverside — Riverside' },
        'book.type.any': { en: 'Any type', es: 'Cualquier tipo' },
        'book.type.economy': { en: 'Economy', es: 'Económico' },
        'book.type.sedan': { en: 'Sedan', es: 'Sedán' },
        'book.type.suv': { en: 'SUV', es: 'SUV' },
        'book.type.truck': { en: 'Truck / Pickup', es: 'Camioneta / Pickup' },
        'book.type.luxury': { en: 'Luxury', es: 'Lujo' },
        'book.type.electric': { en: 'Electric', es: 'Eléctrico' },
        'book.type.van': { en: 'Van', es: 'Van' },
        'book.submit': { en: 'Search Whips →', es: 'Buscar Autos →' },

        // ─── FLEET SECTION ──────────────────────────────────────
        'fleet.eyebrow': { en: 'Rental Fleet', es: 'Flota de Alquiler' },
        'fleet.title': { en: 'Pick Your Ride', es: 'Elige Tu Auto' },
        'fleet.sub': { en: 'Economy to luxury. Trucks to electric. Unlimited mileage and flexible pickup across 3 Southern California locations.', es: 'Económicos a lujo. Camionetas a eléctricos. Millaje ilimitado y recogida flexible en 3 ubicaciones del Sur de California.' },
        'fleet.filter.all': { en: 'All', es: 'Todos' },
        'fleet.filter.economy': { en: 'Economy', es: 'Económico' },
        'fleet.filter.sedan': { en: 'Sedan', es: 'Sedán' },
        'fleet.filter.suv': { en: 'SUV', es: 'SUV' },
        'fleet.filter.truck': { en: 'Truck', es: 'Camioneta' },
        'fleet.filter.luxury': { en: 'Luxury', es: 'Lujo' },
        'fleet.filter.electric': { en: 'Electric', es: 'Eléctrico' },
        'fleet.filter.van': { en: 'Van', es: 'Van' },

        // ─── VEHICLES FOR SALE ──────────────────────────────────
        'sale.eyebrow': { en: 'Buy a Vehicle', es: 'Compra un Vehículo' },
        'sale.title': { en: 'Vehicles for Sale', es: 'Vehículos en Venta' },
        'sale.sub': { en: 'Quality pre-owned vehicles at competitive prices. Inspected, certified, and ready to drive home.', es: 'Vehículos usados de calidad a precios competitivos. Inspeccionados, certificados y listos para llevar.' },

        // ─── PROCESS ────────────────────────────────────────────
        'process.eyebrow': { en: 'How It Works', es: 'Cómo Funciona' },
        'process.title': { en: 'Simple as 1–2–3–4', es: 'Simple como 1–2–3–4' },
        'process.step1.title': { en: 'Search', es: 'Buscar' },
        'process.step1.desc': { en: 'Filter by city, date, and vehicle type to find your perfect match.', es: 'Filtra por ciudad, fecha y tipo de vehículo para encontrar tu auto ideal.' },
        'process.step2.title': { en: 'Book', es: 'Reservar' },
        'process.step2.desc': { en: 'Reserve in minutes. Instant confirmation, no waiting around.', es: 'Reserva en minutos. Confirmación instantánea, sin esperas.' },
        'process.step3.title': { en: 'Pick Up', es: 'Recoger' },
        'process.step3.desc': { en: 'Show your ID, grab the keys, and you\'re out. That simple.', es: 'Muestra tu ID, toma las llaves y listo. Así de simple.' },
        'process.step4.title': { en: 'Return', es: 'Devolver' },
        'process.step4.desc': { en: 'Drop it off at any CCW location when you\'re done. Easy.', es: 'Devuélvelo en cualquier ubicación CCW cuando termines. Fácil.' },

        // ─── PERKS ──────────────────────────────────────────────
        'perks.eyebrow': { en: 'Why CCW', es: 'Por Qué CCW' },
        'perks.title': { en: 'Built Different', es: 'Hechos Diferente' },
        'perk1.title': { en: 'Full Coverage', es: 'Cobertura Total' },
        'perk1.desc': { en: 'Every rental includes comprehensive insurance. Drive with total peace of mind.', es: 'Cada alquiler incluye seguro integral. Conduce con total tranquilidad.' },
        'perk2.title': { en: 'Instant Confirmation', es: 'Confirmación Instantánea' },
        'perk2.desc': { en: 'Booking confirmed in seconds, not hours. Your time is too valuable to wait.', es: 'Reserva confirmada en segundos, no horas. Tu tiempo es muy valioso para esperar.' },
        'perk3.title': { en: 'Free Cancellation', es: 'Cancelación Gratis' },
        'perk3.desc': { en: 'Cancel up to 24 hours before pickup at no charge. No questions asked.', es: 'Cancela hasta 24 horas antes de la recogida sin cargo. Sin preguntas.' },
        'perk4.title': { en: '24/7 Support', es: 'Soporte 24/7' },
        'perk4.desc': { en: 'Real humans, always available. Day or night, we\'ve got you covered.', es: 'Personas reales, siempre disponibles. Día o noche, te tenemos cubierto.' },

        // ─── CTA BAND ──────────────────────────────────────────
        'cta.eyebrow': { en: 'Ready?', es: '¿Listo?' },
        'cta.title': { en: 'Ready to Roll?', es: '¿Listo para Rodar?' },
        'cta.sub': { en: 'Join 50,000+ people who\'ve already certified their city experience.', es: 'Únete a más de 50,000 personas que ya certificaron su experiencia urbana.' },
        'cta.btn.reserve': { en: 'Reserve Now →', es: 'Reserva Ahora →' },
        'cta.btn.talk': { en: 'Talk to Us', es: 'Habla con Nosotros' },

        // ─── CONTACT ────────────────────────────────────────────
        'contact.eyebrow': { en: 'Get In Touch', es: 'Ponte en Contacto' },
        'contact.title': { en: 'Contact CCW', es: 'Contacta a CCW' },
        'contact.label.address': { en: 'Address', es: 'Dirección' },
        'contact.label.phone': { en: 'Phone', es: 'Teléfono' },
        'contact.label.email': { en: 'Email', es: 'Correo' },
        'contact.phone.avail': { en: 'Available 24/7', es: 'Disponible 24/7' },
        'contact.form.name': { en: 'Name', es: 'Nombre' },
        'contact.form.email': { en: 'Email', es: 'Correo' },
        'contact.form.subject': { en: 'Subject', es: 'Asunto' },
        'contact.form.message': { en: 'Message', es: 'Mensaje' },
        'contact.form.submit': { en: 'Send Message →', es: 'Enviar Mensaje →' },
        'contact.form.pname': { en: 'Your name', es: 'Tu nombre' },
        'contact.form.pemail': { en: 'your@email.com', es: 'tu@correo.com' },
        'contact.form.psubject': { en: 'What\'s up?', es: '¿Qué necesitas?' },
        'contact.form.pmsg': { en: 'Tell us more...', es: 'Cuéntanos más...' },

        // ─── FOOTER ────────────────────────────────────────────
        'footer.desc': { en: 'Southern California\'s premium car rentals. Hand-picked vehicles, zero hidden fees, instant booking.', es: 'Alquiler premium de autos en el Sur de California. Vehículos seleccionados, sin cargos ocultos, reserva instantánea.' },
        'footer.col.company': { en: 'Company', es: 'Empresa' },
        'footer.about': { en: 'About CCW', es: 'Sobre CCW' },
        'footer.careers': { en: 'Careers', es: 'Empleo' },
        'footer.col.services': { en: 'Services', es: 'Servicios' },
        'footer.rental': { en: 'Car Rental', es: 'Alquiler de Autos' },
        'footer.insurance': { en: 'Insurance', es: 'Seguro' },
        'footer.roadside': { en: 'Roadside Assistance', es: 'Asistencia Vial' },
        'footer.shop': { en: 'Shop Products', es: 'Tienda de Productos' },
        'footer.col.support': { en: 'Support', es: 'Soporte' },
        'footer.faq': { en: 'FAQ', es: 'Preguntas Frecuentes' },
        'footer.contact': { en: 'Contact', es: 'Contacto' },
        'footer.privacy': { en: 'Privacy', es: 'Privacidad' },
        'footer.terms': { en: 'Terms', es: 'Términos' },
        'footer.tagline': { en: 'Proudly serving Southern California. 🌴', es: 'Sirviendo con orgullo al Sur de California. 🌴' },
        'footer.col.fleet': { en: 'Fleet', es: 'Flota' },
        'footer.rentals': { en: 'Rentals', es: 'Alquileres' },
        'footer.forsale': { en: 'For Sale', es: 'En Venta' },
        'footer.suvs': { en: 'SUVs', es: 'SUVs' },
        'footer.sedans': { en: 'Sedans', es: 'Sedanes' },
        'footer.exotics': { en: 'Exotic Cars', es: 'Autos Exóticos' },
        'footer.allproducts': { en: 'All Products', es: 'Todos los Productos' },

        // ─── ABOUT PAGE ─────────────────────────────────────────
        'about.eyebrow': { en: 'About Us', es: 'Sobre Nosotros' },
        'about.title': { en: 'Driven by Excellence.<br>Fueled by Passion.', es: 'Impulsados por la Excelencia.<br>Motivados por la Pasión.' },
        'about.intro': { en: 'CertifiedCityWhips was founded with a simple vision: make premium car rentals accessible, transparent, and unforgettable. We believe every journey should feel extraordinary.', es: 'CertifiedCityWhips fue fundada con una visión simple: hacer que el alquiler premium de autos sea accesible, transparente e inolvidable. Creemos que cada viaje debe sentirse extraordinario.' },
        'about.story.title': { en: 'Our Story', es: 'Nuestra Historia' },
        'about.story.p1': { en: 'Founded in 2020, CertifiedCityWhips began as a two-car operation in San Bernardino, California. What started as a passion project quickly grew into one of the most trusted names in premium car rental across Southern California. Today, we operate across 3 locations in the Inland Empire with a growing fleet of hand-picked vehicles.', es: 'Fundada en 2020, CertifiedCityWhips comenzó como una operación de dos autos en San Bernardino, California. Lo que empezó como un proyecto de pasión rápidamente creció hasta convertirse en uno de los nombres más confiables en alquiler premium de autos en el Sur de California. Hoy operamos en 3 ubicaciones en el Inland Empire con una flota creciente de vehículos seleccionados.' },
        'about.story.p2': { en: 'Our founder saw a gap in the market — luxury car rentals that didn\'t come with hidden fees, poor customer service, and outdated vehicles. CCW was built to be the antithesis of traditional car rental: transparent pricing, immaculate vehicles, and a booking experience that takes under 2 minutes.', es: 'Nuestro fundador vio una brecha en el mercado: alquiler de autos de lujo sin cargos ocultos, mal servicio al cliente ni vehículos anticuados. CCW fue creado para ser lo opuesto al alquiler de autos tradicional: precios transparentes, vehículos impecables y una experiencia de reserva que toma menos de 2 minutos.' },
        'about.values.title': { en: 'Our Values', es: 'Nuestros Valores' },
        'about.val1.title': { en: 'Excellence First', es: 'Excelencia Ante Todo' },
        'about.val1.desc': { en: 'Every vehicle is inspected, detailed, and certified before it reaches our customers. We accept nothing less than perfection.', es: 'Cada vehículo es inspeccionado, detallado y certificado antes de llegar a nuestros clientes. No aceptamos nada menos que la perfección.' },
        'about.val2.title': { en: 'Radical Transparency', es: 'Transparencia Radical' },
        'about.val2.desc': { en: 'No hidden fees. No surprises. What you see is what you pay. Period. We believe trust is earned through honesty.', es: 'Sin cargos ocultos. Sin sorpresas. Lo que ves es lo que pagas. Punto. Creemos que la confianza se gana con honestidad.' },
        'about.val3.title': { en: 'Speed & Simplicity', es: 'Velocidad y Simplicidad' },
        'about.val3.desc': { en: 'Book in under 2 minutes. Pick up in under 5. We\'ve engineered every friction point out of the rental experience.', es: 'Reserva en menos de 2 minutos. Recoge en menos de 5. Hemos eliminado cada punto de fricción de la experiencia de alquiler.' },
        'about.val4.title': { en: 'Premium Without Pretense', es: 'Premium Sin Pretensiones' },
        'about.val4.desc': { en: 'Luxury shouldn\'t feel exclusive. We make premium vehicles accessible to anyone who values quality and appreciates fine engineering.', es: 'El lujo no debería sentirse exclusivo. Hacemos que los vehículos premium sean accesibles para cualquiera que valore la calidad y aprecie la buena ingeniería.' },
        'about.numbers.title': { en: 'By the Numbers', es: 'En Números' },
        'about.num.vehicles': { en: 'Vehicles', es: 'Vehículos' },
        'about.num.veh.desc': { en: 'A hand-picked fleet of premium SUVs, sedans, and exotic cars.', es: 'Una flota seleccionada de SUVs premium, sedanes y autos exóticos.' },
        'about.num.rentals': { en: 'Completed Rentals', es: 'Alquileres Completados' },
        'about.num.rent.desc': { en: 'Trusted by thousands of customers across Southern California.', es: 'Confiado por miles de clientes en todo el Sur de California.' },
        'about.num.rating': { en: 'Average Rating', es: 'Calificación Promedio' },
        'about.num.rat.desc': { en: 'Consistently rated the top premium car rental service.', es: 'Consistentemente calificado como el mejor servicio de alquiler premium.' },
        'about.num.locations': { en: 'Locations', es: 'Ubicaciones' },
        'about.num.loc.desc': { en: 'San Bernardino (Downtown & Airport) and Riverside.', es: 'San Bernardino (Centro y Aeropuerto) y Riverside.' },

        // ─── SHOP PAGE ──────────────────────────────────────────
        'shop.back': { en: 'Back to Home', es: 'Volver al Inicio' },
        'shop.eyebrow': { en: 'Products & Accessories', es: 'Productos y Accesorios' },
        'shop.sub': { en: 'Tires, detailing products, and accessories for every vehicle. Quality brands, competitive prices, shipped to your door.', es: 'Llantas, productos de detallado y accesorios para cada vehículo. Marcas de calidad, precios competitivos, enviados a tu puerta.' },
        'shop.filter.all': { en: 'All Products', es: 'Todos los Productos' },
        'shop.filter.tires': { en: 'Tires', es: 'Llantas' },
        'shop.filter.detail': { en: 'Detailing', es: 'Detallado' },
        'shop.filter.access': { en: 'Accessories', es: 'Accesorios' },
        'shop.cta.eyebrow': { en: 'Need a Ride Too?', es: '¿También Necesitas un Auto?' },
        'shop.cta.title': { en: 'Rent or Buy a Vehicle', es: 'Alquila o Compra un Vehículo' },
        'shop.cta.sub': { en: 'Browse our rental fleet or check out vehicles for sale. Bundle products with your next rental for the complete CCW experience.', es: 'Explora nuestra flota de alquiler o los vehículos en venta. Combina productos con tu próximo alquiler para la experiencia completa CCW.' },
        'shop.cta.fleet': { en: 'Browse Fleet →', es: 'Ver Flota →' },
        'shop.cta.sale': { en: 'Vehicles for Sale', es: 'Vehículos en Venta' },

        // ─── SERVICES PAGE ──────────────────────────────────────
        'services.back': { en: 'Back to Home', es: 'Volver al Inicio' },
        'services.eyebrow': { en: 'What We Offer', es: 'Lo Que Ofrecemos' },
        'services.sub': { en: 'Everything you need — from the keys to the coverage. CertifiedCityWhips has you covered before, during, and after every ride.', es: 'Todo lo que necesitas — desde las llaves hasta la cobertura. CertifiedCityWhips te cubre antes, durante y después de cada viaje.' },

        // ─── FAQ PAGE ───────────────────────────────────────────
        'faq.eyebrow': { en: 'Support', es: 'Soporte' },
        'faq.title': { en: 'Frequently Asked Questions', es: 'Preguntas Frecuentes' },
        'faq.sub': { en: 'Everything you need to know about renting with CertifiedCityWhips.', es: 'Todo lo que necesitas saber sobre alquilar con CertifiedCityWhips.' },
        'faq.still': { en: 'Still have questions?', es: '¿Aún tienes preguntas?' },

        // ─── GENERIC / SHARED ───────────────────────────────────
        'back.home': { en: 'Back to Home', es: 'Volver al Inicio' },
        'btn.reserve': { en: 'Reserve Your Whip →', es: 'Reserva Tu Auto →' },
        'btn.talk': { en: 'Talk to Us', es: 'Habla con Nosotros' },
        'btn.addcart': { en: 'Add to Cart', es: 'Agregar al Carrito' },
        'btn.book.fleet': { en: 'Browse Fleet & Book →', es: 'Ver Flota y Reservar →' },
        'btn.addcart.arrow': { en: 'Add to Cart →', es: 'Agregar al Carrito →' },
    };

    let currentLang = localStorage.getItem('ccw_lang') || 'en';

    function getLang() { return currentLang; }

    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem('ccw_lang', lang);
        applyTranslations();
        updateToggleButton();
        // Update <html lang>
        document.documentElement.lang = lang;
    }

    function toggle() {
        setLang(currentLang === 'en' ? 'es' : 'en');
    }

    function t(key) {
        const entry = T[key];
        if (!entry) return key;
        return entry[currentLang] || entry.en || key;
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            if (!val || val === key) return;

            // Check if it's a placeholder
            if (el.hasAttribute('placeholder')) {
                el.placeholder = val;
            }
            // Use innerHTML for keys that contain <br> or HTML
            else if (val.includes('<')) {
                el.innerHTML = val;
            } else {
                el.textContent = val;
            }
        });
    }

    function updateToggleButton() {
        const btn = document.getElementById('langToggle');
        if (btn) {
            btn.textContent = currentLang === 'en' ? '🌐 ES' : '🌐 EN';
            btn.title = currentLang === 'en' ? 'Cambiar a Español' : 'Switch to English';
        }
    }

    // Auto-init on DOM ready
    function init() {
        applyTranslations();
        updateToggleButton();
        document.documentElement.lang = currentLang;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { getLang, setLang, toggle, t, applyTranslations };
})();
