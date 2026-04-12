/* ============================================================
   CERTIFIEDCITYWHIPS — AI CHAT BOT
   Powered by OpenWebUI via server proxy (/api/chat)
   Streams responses in real-time using SSE
   ============================================================ */

/* ── CHAT WIDGET UI + AI LOGIC ──────────────────────────────── */
(function () {
    // ── Conversation history (kept in memory) ──────────────
    let conversationHistory = [];
    const MAX_HISTORY = 20;

    // ── Inject CSS ─────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    .ccw-chat-btn {
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #FF3C3C, #CC2020);
        border: none; cursor: pointer; color: #fff; font-size: 26px;
        box-shadow: 0 8px 32px rgba(255,60,60,0.4);
        transition: transform 0.3s, box-shadow 0.3s;
        display: flex; align-items: center; justify-content: center;
    }
    .ccw-chat-btn:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(255,60,60,0.5); }
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
        background: linear-gradient(135deg, #FF3C3C, #CC2020);
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 14px; color: #fff;
    }
    .ccw-chat-header-info h4 { margin:0; font-size:0.9rem; color:#fff; font-weight:600; }
    .ccw-chat-header-info p { margin:0; font-size:0.7rem; color: #FF3C3C; }

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
        align-self: flex-end; background: linear-gradient(135deg, #FF3C3C, #CC2020);
        color: #000; font-weight: 500; border-bottom-right-radius: 4px;
    }

    .ccw-typing {
        align-self: flex-start; padding: 12px 18px;
        background: rgba(255,255,255,0.06); border-radius: 16px;
        border-bottom-left-radius: 4px; display: flex; gap: 5px;
        align-items: center;
    }
    .ccw-typing-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: rgba(255,255,255,0.3);
        animation: ccwBounce 1.4s ease-in-out infinite;
    }
    .ccw-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ccw-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ccwBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
        30% { transform: translateY(-6px); opacity: 1; }
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
    .ccw-chat-input:focus { border-color: rgba(255,60,60,0.4); }
    .ccw-chat-input::placeholder { color: rgba(255,255,255,0.25); }
    .ccw-chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .ccw-chat-send {
        width: 40px; height: 40px; border-radius: 12px;
        background: linear-gradient(135deg, #FF3C3C, #CC2020);
        border: none; cursor: pointer; color: #000; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
    }
    .ccw-chat-send:hover { transform: scale(1.08); }
    .ccw-chat-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    @media (max-width: 480px) {
        .ccw-chat-window { width: calc(100vw - 24px); right: 12px; bottom: 90px; max-height: 70vh; }
        .ccw-chat-btn { bottom: 18px; right: 18px; width: 52px; height: 52px; font-size: 22px; }
    }`;
    document.head.appendChild(style);

    // ── Inject HTML ────────────────────────────────────────
    const chatHTML = `
    <button class="ccw-chat-btn" id="ccwChatBtn" title="Chat with us">💬</button>
    <div class="ccw-chat-window" id="ccwChatWindow">
        <div class="ccw-chat-header">
            <div class="ccw-chat-avatar">CCW</div>
            <div class="ccw-chat-header-info">
                <h4>CCW AI Assistant</h4>
                <p>● Online — Powered by AI</p>
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

    // ── Elements ───────────────────────────────────────────
    const btn = document.getElementById('ccwChatBtn');
    const win = document.getElementById('ccwChatWindow');
    const msgs = document.getElementById('ccwChatMessages');
    const input = document.getElementById('ccwChatInput');
    const send = document.getElementById('ccwChatSend');

    let isOpen = false;
    let greeted = false;
    let isStreaming = false;

    function toggle() {
        isOpen = !isOpen;
        btn.classList.toggle('open', isOpen);
        win.classList.toggle('open', isOpen);
        if (isOpen && !greeted) {
            greeted = true;
            let greetName = 'there';
            if (typeof CCW_AUTH !== 'undefined' && CCW_AUTH.getCurrentUser()) {
                const firstName = CCW_AUTH.getCurrentUser().name.split(' ')[0];
                if (firstName) greetName = firstName;
            }
            addMsg('bot', `Hey ${greetName}! 👋 I'm the CCW AI Assistant. I can help with vehicles, pricing, booking, locations, insurance, and more. Ask me anything!`);
        }
        if (isOpen) input.focus();
    }

    // ── SECURITY: Escape HTML to prevent XSS ──────────────
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Format bot message (safe markdown-like formatting) ─
    function formatBotText(text) {
        const safe = escapeHtml(text);
        return safe
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function addMsg(type, text) {
        const el = document.createElement('div');
        el.className = `ccw-msg ${type}`;
        if (type === 'user') {
            el.textContent = text;
        } else {
            el.innerHTML = formatBotText(text);
        }
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
        return el;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'ccw-typing';
        el.id = 'ccwTypingIndicator';
        el.innerHTML = '<div class="ccw-typing-dot"></div><div class="ccw-typing-dot"></div><div class="ccw-typing-dot"></div>';
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('ccwTypingIndicator');
        if (el) el.remove();
    }

    function setInputEnabled(enabled) {
        input.disabled = !enabled;
        send.disabled = !enabled;
    }

    // ── AI Chat via streaming SSE ──────────────────────────
    async function sendToAI(userMessage) {
        // Add user message to history
        conversationHistory.push({ role: 'user', content: userMessage });
        if (conversationHistory.length > MAX_HISTORY) {
            conversationHistory = conversationHistory.slice(-MAX_HISTORY);
        }

        isStreaming = true;
        setInputEnabled(false);
        showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            });

            hideTyping();

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to get response');
            }

            // Create bot message element for streaming
            const botEl = addMsg('bot', '');
            let fullResponse = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process SSE lines
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const data = trimmed.slice(6); // Remove 'data: '
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);

                        // Check for error message from proxy
                        if (parsed.error) {
                            fullResponse = parsed.error;
                            botEl.innerHTML = formatBotText(fullResponse);
                            msgs.scrollTop = msgs.scrollHeight;
                            continue;
                        }

                        // OpenAI-compatible streaming format
                        const delta = parsed.choices?.[0]?.delta;
                        if (delta?.content) {
                            fullResponse += delta.content;
                            botEl.innerHTML = formatBotText(fullResponse);
                            msgs.scrollTop = msgs.scrollHeight;
                        }
                    } catch (e) {
                        // Skip unparseable lines
                    }
                }
            }

            // Save assistant response to history
            if (fullResponse) {
                conversationHistory.push({ role: 'assistant', content: fullResponse });
                if (conversationHistory.length > MAX_HISTORY) {
                    conversationHistory = conversationHistory.slice(-MAX_HISTORY);
                }
            }

            // If no response was received
            if (!fullResponse) {
                botEl.innerHTML = formatBotText("Sorry, I didn't get a response. Please try again or contact us at hello@certifiedcitywhips.com");
            }

        } catch (err) {
            hideTyping();
            console.error('Chat error:', err);
            addMsg('bot', "Oops! Something went wrong. Please try again, or reach out to us at hello@certifiedcitywhips.com or +1 (800) CCW-WHIPS. 🛠️");
        } finally {
            isStreaming = false;
            setInputEnabled(true);
            input.focus();
        }
    }

    // ── Handle send ────────────────────────────────────────
    function handleSend() {
        if (isStreaming) return;
        const text = input.value.trim().slice(0, 500);
        if (!text) return;
        addMsg('user', text);
        input.value = '';
        sendToAI(text);
    }

    btn.addEventListener('click', toggle);
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !isStreaming) handleSend(); });
})();
