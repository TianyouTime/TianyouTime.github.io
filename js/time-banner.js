/* =========================================================
 *  标签页头图：按北京时间自动切换「白天 / 傍晚 / 夜晚」
 *
 *  为什么不放在配置里？因为 Hexo 是构建时生成静态页，
 *  构建那一刻的时间会被"焊死"在 HTML 里。想让每个访客
 *  都看到自己当前时段的图，只能由浏览器现场判断。
 *
 *  时段可以按需修改，见下方 pick()。
 * ========================================================= */
(function () {
  'use strict';

  // 只在标签页生效（/tags/ 或 /tags/xxx/）
  if (!/\/tags\//.test(location.pathname)) return;

  var IMAGES = {
    day: '/img/banners/tag-day.webp',
    dusk: '/img/banners/tag-dusk.webp',
    night: '/img/banners/tag-night.webp'
  };

  // 东八区（UTC+8）小时数，不受访客本地时区影响
  function beijingHour() {
    return (new Date().getUTCHours() + 8) % 24;
  }

  // ┌── 时段定义，想改就改这里 ──────────────────┐
  // │  06:00 - 16:59  白天                      │
  // │  17:00 - 18:59  傍晚                      │
  // │  19:00 - 05:59  夜晚                      │
  // └───────────────────────────────────────────┘
  function pick(h) {
    if (h >= 6 && h < 17) return IMAGES.day;
    if (h >= 17 && h < 19) return IMAGES.dusk;
    return IMAGES.night;
  }

  function apply() {
    var banner = document.getElementById('banner');
    if (!banner) return;

    var img = pick(beijingHour());
    banner.style.backgroundImage = "url('" + img + "')";

    // 换图时轻微淡入，避免"啪"地跳一下
    banner.style.transition = 'background-image 0.4s ease, opacity 0.4s ease';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
