/* 查找页及保留的分类、标签、归档链接，按 UTC+8 时段切换头图。 */
(function () {
  'use strict';
  function init() {
    var page = document.querySelector('[data-page-kind="find"]');
    if (!page && !/\/(tags|categories|archives)(\/|$)/.test(location.pathname)) return;
    var banner = document.getElementById('banner');
    if (!banner) return;
    var match = banner.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    var prefix = match ? new URL(match[1], location.href).pathname.replace(/img\/.*$/, '') : '/';
    var previous;
    function apply() {
      var hour = (new Date().getUTCHours() + 8) % 24;
      var period = hour >= 6 && hour < 17 ? 'day' : hour >= 17 && hour < 19 ? 'dusk' : 'night';
      if (period === previous) return;
      previous = period;
      var image = page ? page.getAttribute('data-banner-' + period) : prefix + 'img/find-' + period + '.webp';
      banner.style.backgroundImage = 'url("' + image + '")';
      banner.dispatchEvent(new Event('bannerchange'));
    }
    apply();
    setInterval(apply, 60000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) apply(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
