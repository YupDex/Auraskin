// ===================================================================
// AuraSkin — app.js
// Powers the demo web app: tab switching, photo upload + mock skin
// analysis, and a rule-based AI chat demo.
//
// NOTE: This prototype has no real backend, camera-vision model, or
// language model wired up yet (see the project's Technology section
// for the intended Teachable Machine + OpenAI API stack). The results
// below are illustrative sample data so the interface can be tried
// end to end, and are clearly labelled as a preview.
// ===================================================================

(function () {
  'use strict';

  /* ---------------- Tabs ---------------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');

      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /* ---------------- Photo upload + preview ---------------- */
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var previewWrap = document.getElementById('previewWrap');
  var previewImg = document.getElementById('previewImg');
  var previewName = document.getElementById('previewName');
  var analyzeBtn = document.getElementById('analyzeBtn');
  var resetBtn = document.getElementById('resetBtn');

  var resultEmpty = document.getElementById('resultEmpty');
  var resultLoading = document.getElementById('resultLoading');
  var resultBody = document.getElementById('resultBody');

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      previewWrap.classList.add('show');
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  if (dropzone) {
    dropzone.addEventListener('click', function () { fileInput.click(); });

    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0]);
      }
    });
  }

  /* ---------------- Mock analysis ---------------- */
  var sampleProfiles = [
    {
      skinType: 'ผสม', mainConcern: 'สิวอุดตัน', confidence: 92, score: 82,
      ingredients: ['Salicylic Acid (BHA)', 'Niacinamide', 'Oil-free SPF'],
      productName: 'AuraSkin Balancing Serum',
      productDesc: 'ลดความมันส่วนเกิน พร้อมช่วยให้รูขุมขนดูโล่งขึ้น'
    },
    {
      skinType: 'แห้ง', mainConcern: 'ผิวขาดน้ำ', confidence: 88, score: 76,
      ingredients: ['Hyaluronic Acid', 'Ceramide', 'Squalane'],
      productName: 'Ceramide Barrier Cream',
      productDesc: 'เสริมเกราะผิวและกักเก็บความชุ่มชื้นตลอดวัน'
    },
    {
      skinType: 'มัน', mainConcern: 'รูขุมขนกว้าง', confidence: 90, score: 79,
      ingredients: ['Niacinamide', 'Zinc PCA', 'Clay'],
      productName: 'AuraSkin Clarifying Gel',
      productDesc: 'ควบคุมความมันโดยไม่ทำให้ผิวแห้งตึง'
    },
    {
      skinType: 'บอบบาง', mainConcern: 'ผิวแพ้ง่าย ระคายเคือง', confidence: 85, score: 74,
      ingredients: ['Centella Asiatica', 'Panthenol', 'Ceramide'],
      productName: 'AuraSkin Calming Cream',
      productDesc: 'สูตรอ่อนโยน ช่วยลดรอยแดงและการระคายเคือง'
    }
  ];

  function runAnalysis() {
    resultEmpty.style.display = 'none';
    resultBody.classList.remove('show');
    resultLoading.classList.add('show');
    analyzeBtn.disabled = true;

    // Simulated processing delay so the flow feels real; a production
    // build would call the AI model here instead.
    setTimeout(function () {
      var profile = sampleProfiles[Math.floor(Math.random() * sampleProfiles.length)];
      fillResult(profile);
      resultLoading.classList.remove('show');
      resultBody.classList.add('show');
      analyzeBtn.disabled = false;
    }, 1400);
  }

  function fillResult(p) {
    document.getElementById('resSkinType').textContent = p.skinType;
    document.getElementById('resConcern').textContent = p.mainConcern;
    document.getElementById('resConfidence').textContent = p.confidence + '%';
    document.getElementById('resScoreText').textContent = p.score + ' / 100';
    document.getElementById('resScoreBar').style.width = p.score + '%';

    var chipRow = document.getElementById('resIngredients');
    chipRow.innerHTML = '';
    p.ingredients.forEach(function (ing) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = ing;
      chipRow.appendChild(chip);
    });

    document.getElementById('resProductName').textContent = p.productName;
    document.getElementById('resProductDesc').textContent = p.productDesc;
  }

  if (analyzeBtn) analyzeBtn.addEventListener('click', runAnalysis);

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      fileInput.value = '';
      previewWrap.classList.remove('show');
      analyzeBtn.disabled = true;
      resultBody.classList.remove('show');
      resultLoading.classList.remove('show');
      resultEmpty.style.display = 'flex';
    });
  }

  /* ---------------- Chat demo ---------------- */
  var chatLog = document.getElementById('chatLog');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var suggestChips = document.querySelectorAll('.suggest-chip');

  var chatRules = [
    { keys: ['แห้ง', 'ตึง', 'ลอก'], reply: 'สำหรับผิวแห้ง แนะนำมองหาส่วนผสม Hyaluronic Acid และ Ceramide ช่วยเติมและกักเก็บความชุ่มชื้น ควรทามอยส์เจอไรเซอร์ทันทีหลังล้างหน้าตอนผิวยังหมาดๆ ค่ะ' },
    { keys: ['มัน', 'เงา', 'รูขุมขน'], reply: 'ผิวมันมักไปกับรูขุมขนกว้างและเงาไว แนะนำ Niacinamide หรือ BHA (Salicylic Acid) เพื่อควบคุมความมันแบบไม่ทำให้ผิวแห้งตึงจนเกินไปค่ะ' },
    { keys: ['สิว', 'อุดตัน', 'สิวอักเสบ'], reply: 'สำหรับสิวอุดตัน BHA ช่วยทำความสะอาดรูขุมขนได้ดี ส่วนสิวอักเสบควรเพิ่มความอ่อนโยนของสูตรและปรึกษาแพทย์ผิวหนังหากเป็นต่อเนื่องนะคะ' },
    { keys: ['แพ้', 'ระคายเคือง', 'บอบบาง'], reply: 'ผิวแพ้ง่ายควรเลี่ยงน้ำหอมและแอลกอฮอล์ แนะนำ Centella Asiatica และ Panthenol ที่ช่วยปลอบประโลมผิว และควรทดสอบผลิตภัณฑ์ใหม่ที่ท้องแขนก่อนใช้บนหน้าเสมอค่ะ' },
    { keys: ['กันแดด', 'spf'], reply: 'แนะนำทาครีมกันแดดทุกวัน แม้อยู่ในร่ม เลือก SPF 30 ขึ้นไป และทาซ้ำทุก 2-3 ชั่วโมงหากอยู่กลางแจ้งนานค่ะ' },
    { keys: ['niacinamide'], reply: 'Niacinamide ช่วยลดความมันส่วนเกิน กระชับรูขุมขน และช่วยให้สีผิวดูสม่ำเสมอขึ้น เหมาะกับเกือบทุกสภาพผิวค่ะ' },
    { keys: ['aha', 'bha'], reply: 'AHA (เช่น Glycolic/Lactic Acid) ช่วยผลัดเซลล์ผิวชั้นบน เหมาะกับผิวหมองคล้ำ ส่วน BHA (Salicylic Acid) ละลายในน้ำมันได้ดี เหมาะกับผิวมัน/สิวอุดตันมากกว่าค่ะ' }
  ];

  function botReplyFor(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < chatRules.length; i++) {
      var rule = chatRules[i];
      for (var j = 0; j < rule.keys.length; j++) {
        if (lower.indexOf(rule.keys[j]) !== -1) return rule.reply;
      }
    }
    return 'ขอบคุณสำหรับคำถามค่ะ ตอนนี้ AI Chat อยู่ในเวอร์ชันตัวอย่าง ลองถามเกี่ยวกับสภาพผิว (แห้ง/มัน/สิว/แพ้ง่าย) หรือส่วนผสมอย่าง Niacinamide, AHA, BHA ได้เลยค่ะ';
  }

  function addBubble(text, who) {
    var bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + who;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function sendMessage(text) {
    var trimmed = (text || '').trim();
    if (!trimmed) return;

    addBubble(trimmed, 'user');
    chatInput.value = '';

    // Small delay so the reply feels conversational rather than instant.
    setTimeout(function () {
      addBubble(botReplyFor(trimmed), 'bot');
    }, 500);
  }

  if (chatSend) chatSend.addEventListener('click', function () { sendMessage(chatInput.value); });
  if (chatInput) {
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage(chatInput.value);
    });
  }
  suggestChips.forEach(function (chip) {
    chip.addEventListener('click', function () { sendMessage(chip.textContent); });
  });
})();
