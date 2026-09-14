// AuraSkin — team photo picker
// Click a contributor photo to choose a new image and preview it immediately.
// The selected image is saved only in this browser (localStorage); it is not uploaded to GitHub.

document.addEventListener('DOMContentLoaded', function () {
  var avatars = document.querySelectorAll('#team .team-avatar');
  if (!avatars.length) return;

  avatars.forEach(function (avatar, index) {
    var img = avatar.querySelector('img');
    if (!img) return;

    var key = 'auraskin-team-photo-' + index;
    var originalSrc = img.getAttribute('src');

    try {
      var saved = localStorage.getItem(key);
      if (saved) img.src = saved;
    } catch (error) {}

    avatar.classList.add('team-avatar-editable');

    // Use a real <label> + <input type="file"> instead of a hidden input
    // triggered by JavaScript. This makes the native file picker reliable.
    var picker = document.createElement('label');
    picker.className = 'team-avatar-picker';
    picker.setAttribute('title', 'คลิกเพื่อเปลี่ยนรูป');

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'team-avatar-file';
    input.setAttribute('aria-label', 'เลือกภาพใหม่สำหรับผู้จัดทำ');

    var overlay = document.createElement('span');
    overlay.className = 'team-avatar-overlay';
    overlay.innerHTML = '<span class="team-avatar-camera">↗</span><span>เปลี่ยนรูป</span>';

    picker.appendChild(input);
    picker.appendChild(overlay);
    avatar.appendChild(picker);

    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      var reader = new FileReader();
      reader.onload = function (event) {
        var dataUrl = event.target.result;
        img.src = dataUrl;

        try {
          localStorage.setItem(key, dataUrl);
        } catch (error) {
          // Preview still works for this page load if storage is full/blocked.
        }
      };
      reader.readAsDataURL(file);
    });

    // Keyboard support: focus the avatar, then Enter/Space opens the picker.
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', 'เปลี่ยนรูปผู้จัดทำ');

    avatar.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      input.click();
    });

    // Ctrl/Cmd + double-click restores the original repository image.
    avatar.addEventListener('dblclick', function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      img.src = originalSrc;
      try {
        localStorage.removeItem(key);
      } catch (error) {}
    });
  });
});
