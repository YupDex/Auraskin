// AuraSkin — construction.js
// Fills in the path the visitor actually tried to reach, so the
// under-construction / 404 page feels a little less generic.

document.addEventListener('DOMContentLoaded', function () {
  var pathEl = document.getElementById('ucPath');
  if (!pathEl) return;

  var path = window.location.pathname + window.location.search + window.location.hash;
  pathEl.textContent = path || '/';
});