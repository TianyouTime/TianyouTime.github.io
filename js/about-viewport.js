(function () {
  'use strict';
  function init() {
    var header = document.querySelector('.header-inner[data-hero-kind="about"]');
    var board = document.getElementById('board');
    var icons = document.querySelector('.about-icons');
    var profile = document.querySelector('.about-info');
    var navbar = document.getElementById('navbar');
    if (!header || !board || !icons || !profile) return;
    function fit() {
      if (window.innerWidth > 767) {
        header.style.removeProperty('--about-hero-height');
        return;
      }
      var viewport = window.visualViewport;
      if (viewport && viewport.scale && viewport.scale !== 1) return;
      var height = viewport ? viewport.height : window.innerHeight;
      var profileHeight = icons.getBoundingClientRect().bottom - board.getBoundingClientRect().top;
      var minimum = (navbar ? navbar.getBoundingClientRect().height : 64) + 96;
      var heroHeight = Math.max(minimum, Math.round(height - profileHeight - 12));
      var value = heroHeight + 'px';
      if (header.style.getPropertyValue('--about-hero-height') !== value) {
        header.style.setProperty('--about-hero-height', value);
      }
    }
    fit();
    window.addEventListener('resize', fit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(profile);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
