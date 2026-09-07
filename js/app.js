// ===================================================================
// AuraSkin — app.js
// Photo upload + AI vision skin analysis through the AuraSkin Worker.
// ===================================================================

(function () {
  'use strict';

  /* ---------------- Tabs ---------------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');

      tabButtons.forEach(function (b) {
        b.classList.remove('active');
      });

      tabPanels.forEach(function (p) {
        p.classList.remove('active');
      });

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /* ---------------- Photo upload + preview ---------------- */

  var WORKER_URL =
    'https://auraskin-backbackend.54020.workers.dev/';

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

  // Keep the base64 image comfortably small.
  // This also makes mobile uploads much more reliable.
  var MAX_IMAGE_DIMENSION = 1200;
  var JPEG_QUALITY = 0.72;

  var currentImageData = '';

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ภาพ เช่น JPG หรือ PNG');
      return;
    }

    compressImage(file)
      .then(function (dataUrl) {
        currentImageData = dataUrl;
        previewImg.src = dataUrl;
        previewName.textContent = file.name;
        previewWrap.classList.add('show');
        analyzeBtn.disabled = false;
      })
      .catch(function (error) {
        console.error('AuraSkin image preparation error:', error);
        alert('ไม่สามารถเตรียมภาพได้ กรุณาลองภาพอื่น');
      });
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onerror = function () {
        reject(new Error('Could not read image'));
      };

      reader.onload = function (event) {
        var img = new Image();

        img.onerror = function () {
          reject(new Error('Could not decode image'));
        };

        img.onload = function () {
          var largestSide = Math.max(
            img.naturalWidth,
            img.naturalHeight
          );

          var scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / largestSide
          );

          var width = Math.max(
            1,
            Math.round(img.naturalWidth * scale)
          );

          var height = Math.max(
            1,
            Math.round(img.naturalHeight * scale)
          );

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          var ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas is unavailable'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          var dataUrl = canvas.toDataURL(
            'image/jpeg',
            JPEG_QUALITY
          );

          console.log(
            'AuraSkin image prepared:',
            width + 'x' + height,
            Math.round(dataUrl.length / 1024) + ' KB'
          );

          resolve(dataUrl);
        };

        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  if (dropzone) {
    dropzone.addEventListener('click', function () {
      fileInput.click();
    });

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

  /* ---------------- AI Vision analysis ---------------- */

  async function runAnalysis() {
    if (!currentImageData) {
      return;
    }

    resultEmpty.style.display = 'none';
    resultBody.classList.remove('show');
    resultLoading.classList.add('show');
    analyzeBtn.disabled = true;

    try {
      console.log(
        'AuraSkin: sending image to Worker...'
      );

      var response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message:
            'วิเคราะห์ภาพผิวนี้สำหรับ AuraSkin โดยประเมินสภาพผิวและสิ่งที่สังเกตได้อย่างระมัดระวัง ไม่วินิจฉัยโรค และส่งผลลัพธ์เป็น JSON ตามฟิลด์ที่ระบบกำหนด',
          image: currentImageData
        })
      });

      var rawText = await response.text();
      var data;

      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error(
          'AuraSkin Worker returned non-JSON:',
          rawText
        );
        throw new Error(
          'Worker returned invalid JSON (HTTP ' +
            response.status + ')'
        );
      }

      console.log(
        'AuraSkin Worker response:',
        response.status,
        data
      );

      if (!response.ok || data.error) {
        var workerDetails =
          data.details || data.error || 'Unknown Worker error';

        throw new Error(
          'HTTP ' +
            response.status +
            ': ' +
            workerDetails
        );
      }

      if (!data.analysis) {
        throw new Error(
          'Worker returned no analysis.'
        );
      }

      fillResult(data.analysis);

      resultLoading.classList.remove('show');
      resultBody.classList.add('show');

    } catch (error) {
      console.error(
        'AuraSkin AI vision error:',
        error
      );

      resultLoading.classList.remove('show');
      resultEmpty.style.display = 'flex';

      // Show the real error while debugging instead of hiding it.
      // This makes Cloudflare/Groq errors visible immediately.
      alert(
        'AuraSkin วิเคราะห์ภาพไม่สำเร็จ\n\n' +
        (error.message || error)
      );

    } finally {
      analyzeBtn.disabled = false;
    }
  }

  function fillResult(p) {
    var skinType =
      p.skinType || 'ข้อมูลไม่เพียงพอ';

    // Worker uses "concern".
    // Keep "mainConcern" as a compatibility fallback.
    var concern =
      p.concern ||
      p.mainConcern ||
      'ไม่สามารถประเมินได้อย่างชัดเจน';

    var confidence = Number(p.confidence);

    if (!Number.isFinite(confidence)) {
      confidence = 0;
    }

    confidence = Math.max(
      0,
      Math.min(100, confidence)
    );

    var score = Number(p.score);

    if (!Number.isFinite(score)) {
      score = confidence;
    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    document.getElementById('resSkinType').textContent =
      skinType;

    document.getElementById('resConcern').textContent =
      concern;

    document.getElementById('resConfidence').textContent =
      confidence + '%';

    document.getElementById('resScoreText').textContent =
      score + ' / 100';

    document.getElementById('resScoreBar').style.width =
      score + '%';

    var chipRow =
      document.getElementById('resIngredients');

    chipRow.innerHTML = '';

    var ingredients =
      Array.isArray(p.ingredients)
        ? p.ingredients
        : [];

    ingredients.forEach(function (ing) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = String(ing);
      chipRow.appendChild(chip);
    });

    document.getElementById('resProductName').textContent =
      p.productName ||
      'ยังไม่มีคำแนะนำผลิตภัณฑ์';

    document.getElementById('resProductDesc').textContent =
      p.productDesc ||
      'ข้อมูลจากภาพยังไม่เพียงพอสำหรับคำแนะนำผลิตภัณฑ์ที่เหมาะสม';
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener(
      'click',
      runAnalysis
    );
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      fileInput.value = '';
      currentImageData = '';

      previewImg.src = '';
      previewWrap.classList.remove('show');

      analyzeBtn.disabled = true;

      resultBody.classList.remove('show');
      resultLoading.classList.remove('show');
      resultEmpty.style.display = 'flex';
    });
  }
})();
