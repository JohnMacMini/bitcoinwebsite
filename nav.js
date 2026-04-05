(function () {
  // ── Hamburger toggle ────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  var toggleIcon = toggle ? toggle.querySelector('.nav-toggle-icon') : null;

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (toggleIcon) toggleIcon.textContent = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking outside the topbar
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.topbar') && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (toggleIcon) toggleIcon.textContent = '☰';
      }
    });
  }

  // ── Touch-friendly dropdowns ────────────────────────────────
  // On small screens the CSS :hover trick doesn't work on touch devices.
  // First tap expands the sub-menu; second tap follows the link.
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth > 768) return; // desktop: leave hover behaviour alone
      var dropdown = trigger.closest('.nav-dropdown');
      var isOpen = dropdown.classList.contains('is-open');

      // Close every other open dropdown
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function (other) {
        if (other !== dropdown) other.classList.remove('is-open');
      });

      if (!isOpen) {
        dropdown.classList.add('is-open');
        e.preventDefault(); // show sub-menu on first tap, don't navigate yet
      } else {
        dropdown.classList.remove('is-open');
        // second tap: allow the default href navigation
      }
    });
  });

  // ── Filter section collapse toggle ─────────────────────────
  var filtersToggle = document.querySelector('#filters-toggle');
  var filtersEl = document.querySelector('.filters');
  var filtersLabel = document.querySelector('#filters-toggle-label');

  if (filtersToggle && filtersEl) {
    filtersToggle.addEventListener('click', function () {
      var isOpen = filtersEl.classList.toggle('is-open');
      filtersToggle.setAttribute('aria-expanded', String(isOpen));
      if (filtersLabel) filtersLabel.textContent = isOpen ? 'Hide filters' : 'Show filters';
    });
  }
})();
