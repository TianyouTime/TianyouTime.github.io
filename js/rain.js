/* =========================================================
 *  Banner 雨效
 *  还原 Wallpaper Engine 场景里的 rainperspective 粒子：
 *  512 个粒子、additive 混合、带拖尾（spritetrail）。
 *
 *  网页里的做法：一层 canvas 铺满 banner，画"有透视感的雨丝"。
 *  透视 = 越靠下离镜头越近 → 雨滴更长、更粗、更快、更亮。
 * ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    var banner = document.getElementById('banner');
    if (!banner) return;

    // 只在首页下雨：首页独有的结构是 .index-card
    // （用页面特征判断，比硬编码路径更稳，换域名/子目录都不受影响）
    if (!document.querySelector('.index-card')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'banner-rain';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;left:0;top:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:3;';
    banner.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var drops = [];
    var raf = 0;
    var t = 0;

    function makeDrop(initial) {
      // depth: 0 = 远（上），1 = 近（下）
      var depth = Math.pow(Math.random(), 0.7);
      return {
        x: Math.random() * (W + 200) - 100,
        y: initial ? Math.random() * H : -30 - Math.random() * H * 0.4,
        depth: depth,
        speed: 7 + depth * 20,
        len: 10 + depth * 30,
        alpha: 0.07 + depth * 0.24,
        width: 0.6 + depth * 1.2,
        sway: (Math.random() - 0.5) * 0.5
      };
    }

    function seed() {
      var count = Math.round(Math.min(Math.max((W * H) / 9000, 90), 380));
      drops = [];
      for (var i = 0; i < count; i++) drops.push(makeDrop(true));
    }

    function resize() {
      var r = banner.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      if (W === 0 || H === 0) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';

      // 风向：轻微摆动，避免雨丝完全平行
      var wind = 0.2 + Math.sin(t * 0.5) * 0.03;

      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.speed;
        d.x += d.speed * wind * 0.45 + d.sway;

        if (d.y - d.len > H) {
          drops[i] = makeDrop(false);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * wind * 0.45, d.y - d.len);
        ctx.strokeStyle = 'rgba(190, 222, 248, ' + d.alpha + ')';
        ctx.lineWidth = d.width;
        ctx.stroke();
      }

      t += 0.016;
      raf = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      canvas.style.display = 'none';
    }

    window.addEventListener('resize', function () {
      if (!raf) return;
      resize();
    });

    // 系统开启"减少动态效果"时不下雨
    if (reduceMotion.matches) {
      stop();
    } else {
      start();
    }

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function (e) {
        if (e.matches) stop();
        else { canvas.style.display = 'block'; start(); }
      });
    }

    // 页面切到后台时暂停，省电
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      } else if (!reduceMotion.matches && !raf) {
        raf = requestAnimationFrame(draw);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
