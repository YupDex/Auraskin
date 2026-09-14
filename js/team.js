// AuraSkin — contributor photo lightbox
// Click a contributor photo to view the full image.
// No file picker and no image replacement — this only opens a larger preview.

document.addEventListener('DOMContentLoaded', function () {
  var avatars = document.querySelectorAll('#team .team-avatar');
  if (!avatars.length) return;

  // Load the feature stylesheet without requiring changes to the main HTML file.
  if (!document.querySelector('link[data-team-lightbox-css]')) {
    var styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'css/team.css';
    styleLink.setAttribute('data-team-lightbox-css', 'true');
    document.head.appendChild(styleLink);
  }

  var lightbox = document.createElement('div');
  lightbox.className = 'team-lightbox';
  lightbox.id = 'team-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="team-lightbox-backdrop" data-team-lightbox-close></div>
    <div class="team-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="team-lightbox-name">
      <button class="team-lightbox-close" type="button" aria-label="ปิด">×</button>
      <div class="team-lightbox-image-wrap">
        <img class="team-lightbox-image" src="" alt="">
      </div>
      <div class="team-lightbox-info">
        <div class="team-lightbox-kicker">คณะผู้จัดทำ · Team 14</div>
        <h3 id="team-lightbox-name"></h3>
        <p class="team-lightbox-role"></p>
        <span class="team-lightbox-grade"></span>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  var dialog = lightbox.querySelector('.team-lightbox-dialog');
  var closeButton = lightbox.querySelector('.team-lightbox-close');
  var largeImage = lightbox.querySelector('.team-lightbox-image');
  var nameElement = lightbox.querySelector('#team-lightbox-name');
  var roleElement = lightbox.querySelector('.team-lightbox-role');
  var gradeElement = lightbox.querySelector('.team-lightbox-grade');
  var lastAvatar = null;

  function openLightbox(avatar) {
    var card = avatar.closest('.team-card');
    var img = avatar.querySelector('img');
    if (!img || !card) return;

    var name = card.querySelector('h4');
    var role = card.querySelector('.role');
    var grade = card.querySelector('.grade');

    lastAvatar = avatar;
    largeImage.src = img.currentSrc || img.src;
    largeImage.alt = img.alt || (name ? name.textContent.trim() : 'รูปผู้จัดทำ');
    nameElement.textContent = name ? name.textContent.trim() : '';
    roleElement.textContent = role ? role.textContent.trim() : '';
    gradeElement.textContent = grade ? grade.textContent.trim() : '';

    lightbox.hidden = false;
    document.body.classList.add('team-lightbox-open');
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('team-lightbox-open');
    largeImage.removeAttribute('src');

    if (lastAvatar) {
      lastAvatar.focus();
    }
    lastAvatar = null;
  }

  avatars.forEach(function (avatar) {
    var img = avatar.querySelector('img');
    if (!img) return;

    avatar.classList.add('team-photo-viewable');
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', 'ดูรูปผู้จัดทำแบบเต็ม');
    avatar.setAttribute('title', 'คลิกเพื่อดูรูปเต็ม');

    var hint = document.createElement('span');
    hint.className = 'team-photo-hint';
    hint.textContent = 'ดูรูปเต็ม ↗';
    avatar.appendChild(hint);

    avatar.addEventListener('click', function () {
      openLightbox(avatar);
    });

    avatar.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openLightbox(avatar);
    });
  });

  closeButton.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-team-lightbox-close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });

  dialog.addEventListener('click', function (event) {
    event.stopPropagation();
  });
});
