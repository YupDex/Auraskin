// ===================================================================
// AuraSkin — chatbot.js
//
// Features:
// - Groq AI chat through Cloudflare Worker
// - Conversation memory until page refresh
// - Markdown rendering
// - Safe HTML sanitization
// - Suggestion chips
// ===================================================================

(function () {
  'use strict';

  // ================================================================
  // CONFIG
  // ================================================================

  var WORKER_URL =
    'https://auraskin-backbackend.54020.workers.dev/';

  // ================================================================
  // ELEMENTS
  // ================================================================

  var chatLog = document.getElementById('chatLog');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var suggestChips = document.querySelectorAll('.suggest-chip');

  if (!chatLog || !chatInput || !chatSend) {
    console.error('AuraSkin chatbot: required elements not found.');
    return;
  }

  // ================================================================
  // TEMPORARY CHAT MEMORY
  //
  // This is stored only in browser memory.
  //
  // Refreshing the page resets the conversation.
  // No localStorage.
  // No cookies.
  // No database.
  // ================================================================

  var chatHistory = [];

  // ================================================================
  // MARKDOWN
  // ================================================================

  function escapeHTML(text) {
    var div = document.createElement('div');

    div.textContent = text || '';

    return div.innerHTML;
  }

  function renderMarkdown(text) {
    text = text || '';

    // Fallback if Markdown libraries aren't available.
    if (
      typeof marked === 'undefined' ||
      typeof DOMPurify === 'undefined'
    ) {
      return escapeHTML(text);
    }

    var html = marked.parse(text, {
      breaks: true,
      gfm: true
    });

    return DOMPurify.sanitize(html, {
      USE_PROFILES: {
        html: true
      }
    });
  }

  // ================================================================
  // ADD CHAT BUBBLE
  // ================================================================

  function addBubble(text, who) {
    var bubble = document.createElement('div');

    bubble.className = 'chat-bubble ' + who;

    if (who === 'bot') {
      // AI responses support Markdown.
      bubble.innerHTML = renderMarkdown(text);
    } else {
      // User messages remain plain text.
      bubble.textContent = text;
    }

    chatLog.appendChild(bubble);

    chatLog.scrollTop = chatLog.scrollHeight;

    return bubble;
  }

  // ================================================================
  // LOADING STATE
  // ================================================================

  function setLoading(isLoading) {
    chatSend.disabled = isLoading;
    chatInput.disabled = isLoading;

    suggestChips.forEach(function (chip) {
      chip.disabled = isLoading;
    });
  }

  // ================================================================
  // ASK AI
  // ================================================================

  async function getAIReply(message) {
    var response = await fetch(WORKER_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        message: message,

        // IMPORTANT:
        // This contains only messages BEFORE the current message.
        history: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error(
        'Network response was not ok (' +
          response.status +
          ')'
      );
    }

    var data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return (
      data.reply ||
      'ขออภัยค่ะ ไม่ได้รับคำตอบจากระบบ ลองใหม่อีกครั้งนะคะ'
    );
  }

  // ================================================================
  // SEND MESSAGE
  // ================================================================

  async function sendMessage(text) {
    var trimmed = (text || '').trim();

    if (!trimmed) {
      return;
    }

    // --------------------------------------------------------------
    // Display user message
    // --------------------------------------------------------------

    addBubble(trimmed, 'user');

    // IMPORTANT:
    // Do NOT add this message to chatHistory yet.
    //
    // The Worker receives:
    //
    // history = previous messages
    // message = current message
    //
    // This prevents the current message from being duplicated.
    // --------------------------------------------------------------

    chatInput.value = '';

    setLoading(true);

    // --------------------------------------------------------------
    // Temporary loading bubble
    // --------------------------------------------------------------

    var typingBubble = addBubble(
      'กำลังพิมพ์...',
      'bot'
    );

    try {

      // ------------------------------------------------------------
      // Ask AI
      // ------------------------------------------------------------

      var reply = await getAIReply(trimmed);

      // ------------------------------------------------------------
      // Save successful conversation
      // ------------------------------------------------------------

      chatHistory.push({
        role: 'user',
        content: trimmed
      });

      chatHistory.push({
        role: 'assistant',
        content: reply
      });

      // ------------------------------------------------------------
      // Render COMPLETE response as Markdown
      //
      // IMPORTANT:
      // We only parse Markdown after the entire response arrives.
      // This prevents incomplete tables / **bold / code blocks
      // from being interpreted while the AI response is incomplete.
      // ------------------------------------------------------------

      typingBubble.innerHTML = renderMarkdown(reply);

    } catch (error) {

      console.error(
        'AuraSkin AI error:',
        error
      );

      typingBubble.textContent =
        'ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';

    } finally {

      setLoading(false);

      chatLog.scrollTop =
        chatLog.scrollHeight;

      chatInput.focus();
    }
  }

  // ================================================================
  // SEND BUTTON
  // ================================================================

  chatSend.addEventListener(
    'click',
    function () {
      sendMessage(chatInput.value);
    }
  );

  // ================================================================
  // ENTER KEY
  // ================================================================

  chatInput.addEventListener(
    'keydown',
    function (event) {

      if (event.key === 'Enter') {

        event.preventDefault();

        sendMessage(chatInput.value);
      }
    }
  );

  // ================================================================
  // SUGGESTION CHIPS
  // ================================================================

  suggestChips.forEach(
    function (chip) {

      chip.addEventListener(
        'click',
        function () {

          sendMessage(
            chip.textContent
          );

        }
      );

    }
  );

})();