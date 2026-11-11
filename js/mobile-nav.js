(function () {
  'use strict';
  function init() {
    var toggle = document.getElementById('navbar-toggler-btn');
    var menu = document.getElementById('mobile-grid-menu');
    var navbar = document.getElementById('navbar');
    if (!toggle || !menu || !navbar) return;
    var icon = toggle.querySelector('.animated-icon');
    var open = false;
    var background = Array.from(document.querySelectorAll('main, footer, #banner'));
    var originalInert = background.map(function (element) { return element.inert; });
    var searchPending = false;
    toggle.setAttribute('aria-controls', menu.id);

    function setOpen(value, restoreFocus) {
      open = value;
      menu.classList.toggle('show', open);
      icon.classList.toggle('open', open);
      document.body.classList.toggle('mobile-menu-open', open);
      // Only scrolling changes navbar padding; opening the menu keeps the brand in place.
      navbar.classList.toggle('top-nav-collapse', window.scrollY > 50);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      background.forEach(function (element, index) { element.inert = open || originalInert[index]; });
      if (open) {
        var first = menu.querySelector('a[href]');
        if (first) first.focus({ preventScroll: true });
      } else if (restoreFocus) toggle.focus({ preventScroll: true });
    }
    setOpen(false, false);

    // Take over this one mobile trigger before Bootstrap and the theme toggle it again.
    toggle.addEventListener('click', function (event) {
      if (window.innerWidth >= 992) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(!open, open);
    }, true);

    menu.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link || !menu.contains(link)) return;
      if (link.closest('#mobile-search-btn')) {
        searchPending = true;
        setOpen(false, false);
      } else if (!link.closest('#mobile-color-toggle-btn')) {
        setOpen(false, false);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false, true);
      } else if (event.key === 'Tab') {
        var focusable = [toggle].concat(Array.from(menu.querySelectorAll('a[href], button')));
        var index = focusable.indexOf(document.activeElement);
        if ((event.shiftKey && index <= 0) || (!event.shiftKey && (index < 0 || index === focusable.length - 1))) {
          event.preventDefault();
          focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
        }
      }
    });
    document.addEventListener('click', function (event) {
      if (open && !navbar.contains(event.target) && !menu.contains(event.target)) setOpen(false, true);
    });
    window.addEventListener('resize', function () {
      if (open && window.innerWidth >= 992) setOpen(false, false);
    });
    // Bootstrap restores focus to its trigger, which is hidden after the menu closes.
    if (window.jQuery) {
      window.jQuery('#modalSearch').on('hidden.bs.modal', function () {
        if (searchPending) {
          searchPending = false;
          toggle.focus({ preventScroll: true });
        }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
