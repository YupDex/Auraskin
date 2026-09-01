// ===================================================================
// AuraSkin — chatbot.js
// Connects the chat UI to a real AI backend (Cloudflare Worker proxy
// to Gemini/OpenAI). Replace WORKER_URL below if you redeploy the
// Worker at a different address.
// ===================================================================

(function () {
  'use strict';

  // 🔧 Your deployed Cloudflare Worker URL
  var WORKER_URL = 'https://auraskin-backbackend.54020.workers.dev/';

  var chatLog = document.getElementById('chatLog');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var suggestChips = document.querySelectorAll('.suggest-chip');

  if (!chatLog || !chatInput || !chatSend) return;

  function addBubble(text, who) {
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + who;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    return bubble;
  }

  function setLoading(isLoading) {
    chatSend.disabled = isLoading;
    chatInput.disabled = isLoading;
    suggestChips.forEach(function (chip) { chip.disabled = isLoading; });
  }

  async function getAIReply(message) {
    var res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });

    if (!res.ok) throw new Error('Network response was not ok (' + res.status + ')');

    var data = await res.json();
    return data.reply || 'ขออภัยค่ะ ไม่สามารถประมวลผลคำตอบได้ในขณะนี้';
  }

  async function sendMessage(text) {
    var trimmed = (text || '').trim();
    if (!trimmed) return;

    addBubble(trimmed, 'user');
    chatInput.value = '';
    setLoading(true);

    var typingBubble = addBubble('กำลังพิมพ์...', 'bot');

    try {
      var reply = await getAIReply(trimmed);
      typingBubble.textContent = reply;
    } catch (err) {
      typingBubble.textContent = 'ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      console.error(err);
    } finally {
      setLoading(false);
      chatLog.scrollTop = chatLog.scrollHeight;
      chatInput.focus();
    }
  }

  chatSend.addEventListener('click', function () { sendMessage(chatInput.value); });
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage(chatInput.value);
  });
  suggestChips.forEach(function (chip) {
    chip.addEventListener('click', function () { sendMessage(chip.textContent); });
  });
})();