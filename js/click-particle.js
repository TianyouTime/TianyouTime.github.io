/* =========================================================
 *  自定义小零件
 *  1) 点击页面时的粒子扩散
 *  2) 页脚"本站已运行 N 天"计时器
 *  放在 source/js/ 下，再在 _config.fluid.yml 的 custom_js 里登记
 * ========================================================= */

/* ---------- 1. 点击粒子 ---------- */
(function () {
  var MAX = 60;            // 屏幕上最多同时存在多少个粒子
  var PER_CLICK = 12;      // 每次点击生成几个
  var particles = [];

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.style.cssText =
    'position:fixed;left:0;top:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // 随机颜色，偏亮色系
  function randomColor() {
    var hue = Math.random() * 360;
    return 'hsl(' + hue + ', 85%, 62%)';
  }

  function spawn(x, y) {
    for (var i = 0; i < PER_CLICK; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1.5 + Math.random() * 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: randomColor()
      });
    }
    // 超出上限就丢掉最老的
    while (particles.length > MAX) particles.shift();
  }

  var running = false;
  function loop() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;          // 重力
      p.vx *= 0.99;          // 空气阻力
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  document.addEventListener('pointerdown', function (e) {
    // 系统开启"减少动态效果"时不播放
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 在输入框、链接、图片上点的时候不触发，避免误触
    var tag = (e.target.tagName || '').toUpperCase();
    if (['INPUT', 'TEXTAREA', 'A', 'IMG', 'BUTTON'].indexOf(tag) !== -1) return;

    spawn(e.clientX, e.clientY);
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  });
})();
