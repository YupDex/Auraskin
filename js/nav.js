// AuraSkin — nav.js
// Shared mobile navigation toggle for the project site and the web app.

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the mobile menu after a link is chosen.
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Load the contributor photo picker only on pages that have the team section.
  if (document.querySelector('#team .team-avatar')) {
    var script = document.createElement('script');
    script.src = 'js/team.js';
    script.defer = true;
    document.head.appendChild(script);
  }
});
