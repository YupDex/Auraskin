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

    // Restore the last local preview, if one exists.
    try {
      var saved = localStorage.getItem(key);
      if (saved) img.src = saved;
    } catch (error) {
      // Storage may be blocked; the normal GitHub image still works.
    }

    avatar.classList.add('team-avatar-editable');
    avatar.setAttribute('role', 'button');
    avatar.setAttribute('tabindex', '0');
    avatar.setAttribute('aria-label', 'เปลี่ยนรูปผู้จัดทำ');
    avatar.setAttribute('title', 'คลิกเพื่อเปลี่ยนรูป');

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.hidden = true;
    input.setAttribute('aria-hidden', 'true');
    avatar.appendChild(input);

    var overlay = document.createElement('span');
    overlay.className = 'team-avatar-overlay';
    overlay.innerHTML = '<span class="team-avatar-camera">↗</span><span>เปลี่ยนรูป</span>';
    avatar.appendChild(overlay);

    function openPicker(event) {
      if (event) event.preventDefault();
      input.click();
    }

    avatar.addEventListener('click', openPicker);

    avatar.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        openPicker(event);
      }
    });

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

    // Double-click with Ctrl/Cmd restores the original repository image.
    avatar.addEventListener('dblclick', function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      img.src = originalSrc;
      try {
        localStorage.removeItem(key);
      } catch (error) {}
    });
  });
});
