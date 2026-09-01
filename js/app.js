// ===================================================================
// AuraSkin — app.js
// Powers the demo web app: tab switching and photo upload + mock skin
// analysis.
//
// NOTE: The skin-analysis result below is illustrative sample data —
// no camera-vision model (e.g. Teachable Machine) is wired up yet, so
// it's clearly labelled as a preview in the UI.
//
// The AI Chat tab is handled separately by js/chatbot.js, which talks
// to a real AI backend (Cloudflare Worker proxy). Keep chat logic out
// of this file so the two don't double-bind the same buttons.
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
})();