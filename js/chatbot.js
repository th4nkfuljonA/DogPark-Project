/* ============================================================
   CERTIFIEDCITYWHIPS — CHAT BOT
   Rule-based assistant that answers common customer questions.
   NEVER reveals private company info or anything harmful.
   ============================================================ */

const CCW_CHATBOT = (function () {

    // ── BLOCKED TOPICS — never answer these ─────────────────
    const BLOCKED_PATTERNS = [
        /password/i, /login\s*cred/i, /admin\s*(panel|access|password)/i,
        /database/i, /server\s*(ip|address|config)/i, /api\s*key/i,
        /employee\s*(salary|pay|ssn|social|address|phone)/i,
        /revenue/i, /profit/i, /financ/i, /income/i, /tax\s*(return|filing)/i,
        /lawsuit/i, /legal\s*(issue|problem|case)/i, /sue/i,
        /hack/i, /exploit/i, /vulnerab/i, /bypass/i, /inject/i,
        /competitor/i, /internal\s*(doc|memo|meeting|email)/i,
        /ssn|social\s*security/i, /credit\s*card\s*number/i,
        /owner('s)?\s*(home|address|phone|personal)/i,
        /how\s*much.*make/i, /net\s*worth/i,
        /bank\s*(account|routing|info)/i,
        /customer\s*(data|list|email|info)/i,
    ];

    const BLOCK_RESPONSE = "I'm not able to share that kind of information. For sensitive or private matters, please contact our team directly at hello@certifiedcitywhips.com or call +1 (800) CCW-WHIPS.";

    // ── KNOWLEDGE BASE ──────────────────────────────────────
    const QA = [
        // Greetings
        {
            patterns: [/^(hi|hey|hello|sup|yo|what'?s?\s*up)/i],
            answer: "Hey! 👋 Welcome to CertifiedCityWhips! I can help you with booking info, pricing, locations, vehicle questions, and more. What can I help you with?"
        },

        // Booking
        {
            patterns: [/how.*(book|rent|reserve)/i, /book.*vehicle/i, /make.*reservation/i],
            answer: "Booking is easy! Browse our fleet on the homepage, pick a vehicle, choose your dates, and complete checkout. The whole process takes less than 2 minutes. You'll get an instant confirmation email with pickup instructions. 🚗"
        },

        // Pricing / Rates
        {
            patterns: [/how much/i, /pric/i, /rate/i, /cost/i, /cheap/i, /afford/i],
            answer: "Our daily rates start at **$35/day** for economy vehicles. Here's a quick breakdown:\n• Economy (Corolla): $35/day\n• Sedan (Camry): $45/day\n• Truck (Tacoma): $61/day\n• SUV (4Runner): $70/day\n• Luxury (Mercedes): $95/day\n• Electric (Tesla): $55/day\n\nAll rates include unlimited mileage on most vehicles!"
        },

        // Age requirements
        {
            patterns: [/age/i, /how old/i, /years old/i, /minimum age/i, /21/i],
            answer: "You must be at least **21 years old** with a valid driver's license held for a minimum of 2 years. For exotic and sports vehicles, the minimum age is 25. Drivers under 25 may have a young driver surcharge."
        },

        // Insurance
        {
            patterns: [/insurance/i, /coverage/i, /protect/i, /damage/i],
            answer: "Basic liability coverage is included with every rental. We also offer:\n• **Basic Insurance**: $12.99/day\n• **Premium Insurance** (full coverage): $24.99/day\n\nYou can also use your personal auto insurance if it covers rental vehicles."
        },

        // Cancellation
        {
            patterns: [/cancel/i, /refund/i],
            answer: "**Free cancellation** up to 48 hours before your scheduled pickup! Here's the breakdown:\n• 48+ hours before: Full refund\n• 24–48 hours: 50% refund\n• Less than 24 hours / no-show: Non-refundable\n\nContact us for exceptions due to emergencies."
        },

        // Breakdown / Roadside
        {
            patterns: [/break\s*down/i, /roadside/i, /tow/i, /flat\s*tire/i, /emergency/i, /stuck/i],
            answer: "All CCW rentals include **24/7 roadside assistance** at no extra cost! If anything happens, call our hotline and we'll dispatch assistance or a replacement vehicle within 60 minutes in metro areas. 🛠️"
        },

        // Extend rental
        {
            patterns: [/extend/i, /longer/i, /keep.*car/i, /more\s*days/i],
            answer: "Yes! You can extend your rental through your dashboard or by calling us, subject to vehicle availability. Extensions are charged at the same daily rate. We recommend extending at least 12 hours before your scheduled return."
        },

        // Mileage
        {
            patterns: [/mileage/i, /mile/i, /distance/i, /unlimited/i],
            answer: "Most of our vehicles come with **unlimited mileage** included! Some specialty vehicles have 200 miles per day with additional miles at $0.25/mile. Exotic vehicles are limited to 100 miles/day at $2.50/mile for additional miles."
        },

        // Delivery
        {
            patterns: [/deliver/i, /pick\s*up.*service/i, /drop\s*off/i, /bring.*car/i],
            answer: "Yes! We offer vehicle delivery and pickup within a 30-mile radius of our locations. Airport delivery is available at select locations. Delivery fees start at $50 and vary by distance. Contact us for a quote!"
        },

        // Locations
        {
            patterns: [/location/i, /where/i, /address/i, /find\s*you/i, /branch/i, /office/i],
            answer: "We have **3 locations** in Southern California:\n\n📍 **Downtown Hub** — 100 Main St, San Bernardino, CA 92401 (7AM–9PM)\n📍 **Airport Terminal** — 295 N Leland Norton Way, San Bernardino, CA 92408 (6AM–11PM)\n📍 **Riverside Branch** — 3500 Market St, Riverside, CA 92501 (8AM–8PM)"
        },

        // Hours
        {
            patterns: [/hour/i, /open/i, /close/i, /time/i, /when.*open/i],
            answer: "Our hours vary by location:\n• **Downtown Hub**: 7:00 AM – 9:00 PM\n• **Airport Terminal**: 6:00 AM – 11:00 PM\n• **Riverside Branch**: 8:00 AM – 8:00 PM\n\nPhone support is available **24/7**!"
        },

        // Contact
        {
            patterns: [/contact/i, /phone/i, /email/i, /call/i, /reach/i, /talk.*human/i, /speak.*person/i],
            answer: "You can reach us anytime:\n📧 **Email**: hello@certifiedcitywhips.com\n📞 **Phone**: +1 (800) CCW-WHIPS (available 24/7)\n\nOr visit any of our 3 locations in person!"
        },

        // Vehicles / Fleet
        {
            patterns: [/what.*vehicle/i, /what.*car/i, /fleet/i, /type.*car/i, /what.*rent/i, /available/i],
            answer: "We have a wide selection of vehicles:\n🚗 **Economy** — Toyota Corolla\n🚙 **Sedans** — Toyota Camry, Tesla Model 3\n🛻 **Trucks** — Tacoma, F-150, Sierra 2500\n🏔️ **SUVs** — 4Runner, Explorer\n✨ **Luxury** — Mercedes C-Class\n🚐 **Vans** — Chevy Express 3500\n⚡ **Electric** — Tesla Model 3\n\nBrowse the full fleet on our homepage!"
        },

        // Payment
        {
            patterns: [/pay/i, /payment/i, /debit/i, /credit/i, /cash/i, /method/i],
            answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover). A hold is placed on your card at pickup and released upon return. For more details, contact our team!"
        },

        // License / ID
        {
            patterns: [/license/i, /id\b/i, /identification/i, /document/i, /what.*need.*bring/i],
            answer: "To pick up your rental, please bring:\n✅ Valid driver's license (held 2+ years)\n✅ Credit or debit card in your name\n✅ Booking confirmation (email or digital)\n\nInternational drivers need a valid passport and international driving permit."
        },

        // Products / Shop
        {
            patterns: [/shop/i, /product/i, /tire/i, /accessori/i, /detailing/i, /buy.*product/i],
            answer: "Check out our Shop for quality auto products:\n🛞 **Tires** — All-season, winter, truck sets ($320–$620)\n✨ **Detailing** — Wash kits, ceramic coating, interior care ($14.99–$42.99)\n🔧 **Accessories** — Phone mounts, LED kits, floor mats ($18.99–$64.99)\n\nVisit our Shop page to browse and order!"
        },

        // Vehicles for sale
        {
            patterns: [/buy.*car/i, /for\s*sale/i, /purchase.*vehicle/i, /pre.?owned/i, /used\s*car/i],
            answer: "Yes! We sell quality pre-owned vehicles too! Current listings include Honda Civic, Toyota RAV4 Hybrid, Chevy Malibu, Tesla Model Y, and Ford F-150 — starting from **$15,200**. Check the \"Vehicles for Sale\" section on our homepage!"
        },

        // About the company
        {
            patterns: [/about/i, /who.*you/i, /what.*ccw/i, /company/i, /tell.*about/i],
            answer: "CertifiedCityWhips (CCW) is a premium car rental service based in Southern California. We offer hand-picked vehicles with zero hidden fees, instant booking, and 24/7 support. Whether you need a ride for a day or want to buy, we've got you covered! 🚗✨"
        },

        // FAQ
        {
            patterns: [/faq/i, /frequent/i, /common\s*question/i],
            answer: "Great question! Check out our FAQ page for everything about booking, insurance, cancellation, mileage limits, and more. You can find it at the FAQ page in our footer, or just ask me right here!"
        },

        // Thank you
        {
            patterns: [/thank/i, /thanks/i, /thx/i, /appreciate/i],
            answer: "You're welcome! 😊 If you need anything else, just ask. Happy driving! 🚗"
        },

        // Goodbye
        {
            patterns: [/bye/i, /goodbye/i, /see\s*ya/i, /later/i, /gotta\s*go/i],
            answer: "See you later! 👋 Drive safe and enjoy the ride. We're here 24/7 if you need us!"
        },
    ];

    const DEFAULT_RESPONSE = "I'm not sure about that one! Here are some things I can help with:\n• 🚗 Vehicle availability & pricing\n• 📍 Locations & hours\n• 📋 Booking & cancellation\n• 🛡️ Insurance options\n• 🛞 Shop products\n\nOr contact our team at hello@certifiedcitywhips.com for anything else!";

    // ── CHAT LOGIC ──────────────────────────────────────────
    function getResponse(message) {
        const msg = message.trim().slice(0, 500);  // Limit input length
        if (!msg) return null;

        // Check blocked topics first
        for (const pattern of BLOCKED_PATTERNS) {
            if (pattern.test(msg)) return BLOCK_RESPONSE;
        }

        // Find matching Q&A
        for (const qa of QA) {
            for (const pattern of qa.patterns) {
                if (pattern.test(msg)) return qa.answer;
            }
        }

        return DEFAULT_RESPONSE;
    }

    return { getResponse };
})();


/* ── CHAT WIDGET UI ──────────────────────────────────────── */
(function () {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
    .ccw-chat-btn {
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #00d4aa, #00b894);
        border: none; cursor: pointer; color: #fff; font-size: 26px;
        box-shadow: 0 8px 32px rgba(0,212,170,0.4);
        transition: transform 0.3s, box-shadow 0.3s;
        display: flex; align-items: center; justify-content: center;
    }
    .ccw-chat-btn:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(0,212,170,0.5); }
    .ccw-chat-btn.open { transform: rotate(45deg) scale(1.1); }

    .ccw-chat-window {
        position: fixed; bottom: 100px; right: 28px; z-index: 9998;
        width: 380px; max-height: 520px; border-radius: 20px;
        background: #0d0f12; border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 20px 80px rgba(0,0,0,0.6);
        display: none; flex-direction: column; overflow: hidden;
        font-family: 'Inter', sans-serif;
    }
    .ccw-chat-window.open { display: flex; animation: ccwSlideUp 0.3s ease; }
    @keyframes ccwSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

    .ccw-chat-header {
        padding: 18px 20px; display: flex; align-items: center; gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.03);
    }
    .ccw-chat-avatar {
        width: 38px; height: 38px; border-radius: 50%;
        background: linear-gradient(135deg, #00d4aa, #00b894);
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 14px; color: #fff;
    }
    .ccw-chat-header-info h4 { margin:0; font-size:0.9rem; color:#fff; font-weight:600; }
    .ccw-chat-header-info p { margin:0; font-size:0.7rem; color: #00d4aa; }

    .ccw-chat-messages {
        flex: 1; overflow-y: auto; padding: 16px 16px 8px;
        display: flex; flex-direction: column; gap: 10px;
        max-height: 340px; scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.1) transparent;
    }

    .ccw-msg {
        max-width: 85%; padding: 12px 16px; border-radius: 16px;
        font-size: 0.82rem; line-height: 1.6; word-wrap: break-word;
        animation: ccwFadeIn 0.2s ease;
    }
    @keyframes ccwFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    .ccw-msg.bot {
        align-self: flex-start; background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.85); border-bottom-left-radius: 4px;
    }
    .ccw-msg.user {
        align-self: flex-end; background: linear-gradient(135deg, #00d4aa, #00b894);
        color: #000; font-weight: 500; border-bottom-right-radius: 4px;
    }

    .ccw-chat-input-wrap {
        padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; gap: 8px; background: rgba(255,255,255,0.02);
    }
    .ccw-chat-input {
        flex: 1; padding: 10px 14px; border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
        color: #fff; font-size: 0.82rem; outline: none;
        font-family: 'Inter', sans-serif; transition: border-color 0.2s;
    }
    .ccw-chat-input:focus { border-color: rgba(0,212,170,0.4); }
    .ccw-chat-input::placeholder { color: rgba(255,255,255,0.25); }

    .ccw-chat-send {
        width: 40px; height: 40px; border-radius: 12px;
        background: linear-gradient(135deg, #00d4aa, #00b894);
        border: none; cursor: pointer; color: #000; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
    }
    .ccw-chat-send:hover { transform: scale(1.08); }

    @media (max-width: 480px) {
        .ccw-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 90px; max-height: 70vh; }
        .ccw-chat-btn { bottom: 18px; right: 18px; width: 52px; height: 52px; font-size: 22px; }
    }`;
    document.head.appendChild(style);

    // Inject HTML
    const chatHTML = `
    <button class="ccw-chat-btn" id="ccwChatBtn" title="Chat with us">💬</button>
    <div class="ccw-chat-window" id="ccwChatWindow">
        <div class="ccw-chat-header">
            <div class="ccw-chat-avatar">CCW</div>
            <div class="ccw-chat-header-info">
                <h4>CCW Assistant</h4>
                <p>● Online — Typically replies instantly</p>
            </div>
        </div>
        <div class="ccw-chat-messages" id="ccwChatMessages"></div>
        <div class="ccw-chat-input-wrap">
            <input type="text" class="ccw-chat-input" id="ccwChatInput" placeholder="Type a message..." autocomplete="off" maxlength="500" />
            <button class="ccw-chat-send" id="ccwChatSend" title="Send">➤</button>
        </div>
    </div>`;

    const container = document.createElement('div');
    container.innerHTML = chatHTML;
    document.body.appendChild(container);

    // Elements
    const btn = document.getElementById('ccwChatBtn');
    const win = document.getElementById('ccwChatWindow');
    const msgs = document.getElementById('ccwChatMessages');
    const input = document.getElementById('ccwChatInput');
    const send = document.getElementById('ccwChatSend');

    let isOpen = false;
    let greeted = false;

    function toggle() {
        isOpen = !isOpen;
        btn.classList.toggle('open', isOpen);
        win.classList.toggle('open', isOpen);
        if (isOpen && !greeted) {
            greeted = true;
            addMsg('bot', "Hey there! 👋 I'm the CCW Assistant. Ask me anything about our vehicles, pricing, locations, booking, or products!");
        }
        if (isOpen) input.focus();
    }

    // SECURITY: Escape HTML to prevent XSS
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function addMsg(type, text) {
        const el = document.createElement('div');
        el.className = `ccw-msg ${type}`;
        if (type === 'user') {
            // User messages: plain text only — no HTML rendering
            el.textContent = text;
        } else {
            // Bot messages: escape first, then apply safe formatting
            const safe = escapeHtml(text);
            el.innerHTML = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        }
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function handleSend() {
        const text = input.value.trim().slice(0, 500);
        if (!text) return;
        addMsg('user', text);
        input.value = '';

        // Simulate brief typing delay
        setTimeout(() => {
            const response = CCW_CHATBOT.getResponse(text);
            addMsg('bot', response);
        }, 400);
    }

    btn.addEventListener('click', toggle);
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
})();
