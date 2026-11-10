/* =========================================================
 *  页脚统计
 *  1) 已持续航行 X 年 X 天 X 时 X 分 X 秒   —— 纯前端算
 *  2) 总访问量 / 总访客数                  —— 不蒜子（第三方服务）
 *
 *  第一块不依赖任何服务，只要浏览器开着就一直走。
 *  第二块必须联网，因为静态站自己没有数据库记访问量。
 * ========================================================= */
(function () {
  'use strict';

  /* =====================================================
   *  1. 运行时长
   *  改成你自己的建站时间：new Date(年, 月-1, 日, 时, 分, 秒)
   *  注意月份是 0 开始，11 表示 12 月
   * ===================================================== */
  var START = new Date(2026, 10, 10, 0, 0, 0); // 2026-11-10 00:00:00

  // 访问量总开关：false = 一直显示 "-" 占位，不加载任何外部脚本
  // 部署到真实域名、想去掉占位时，把这里改成 true
  var USE_REAL_COUNTER = false;

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // 精确算「过了几个整年」：把起点那年的纪念日往后推 N 年，
  // 如果超过了现在，说明差一年，退回去。剩下的再拆成天/时/分/秒。
  function since(start, now) {
    var years = now.getFullYear() - start.getFullYear();
    var anniversary = new Date(start.getTime());
    anniversary.setFullYear(start.getFullYear() + years);
    if (anniversary.getTime() > now.getTime()) {
      years -= 1;
      anniversary.setFullYear(start.getFullYear() + years);
    }
    var rest = now.getTime() - anniversary.getTime();
    return {
      years: years,
      days: Math.floor(rest / 86400000),
      hours: Math.floor(rest / 3600000) % 24,
      mins: Math.floor(rest / 60000) % 60,
      secs: Math.floor(rest / 1000) % 60
    };
  }

  function renderTime() {
    var el = document.getElementById('running-time');
    if (!el) return;
    var t = since(START, new Date());
    var parts = [];
    if (t.years > 0) parts.push(t.years + ' 年');
    parts.push(t.days + ' 天');
    parts.push(pad(t.hours) + ' 时');
    parts.push(pad(t.mins) + ' 分');
    parts.push(pad(t.secs) + ' 秒');
    el.textContent = '已持续航行 ' + parts.join(' ');
  }

  /* =====================================================
   *  2. 访问量（不蒜子）
   *  原理：在页面里塞一个 <script>，它去自己的服务器查
   *  这个站点的 PV/UV，然后把数字填进指定 id 的 span。
   *  零配置、免费，但依赖它的域名活着。
   * ===================================================== */
  function loadCounter() {
    // 主源：vercount（不蒜子的常用镜像）
    var script = document.createElement('script');
    script.async = true;
    script.src = '//events.vercount.one/js?i=/busuanzi.pure.mini.js';
    document.body.appendChild(script);

    // 5 秒还没数字，换官方源再试一次
    setTimeout(function () {
      var pv = document.getElementById('busuanzi_value_site_pv');
      var text = pv ? pv.textContent.trim() : '';
      if (!text || text === '-') {
        var backup = document.createElement('script');
        backup.async = true;
        backup.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
        document.body.appendChild(backup);
      }
    }, 5000);

    // 占位模式下不隐藏，始终显示 "-"
  }

  function init() {
    // Fluid 的页脚没有 id，只有 <footer> 标签，所以不能用 getElementById
    var footer = document.querySelector('footer') ||
                 document.querySelector('.footer-inner') ||
                 document.getElementById('footer');
    if (!footer) return;

    // 运行时长
    var time = document.createElement('p');
    time.id = 'running-time';
    time.style.cssText =
      'text-align:center;font-size:.85rem;opacity:.78;margin:.5rem 0 0;';
    footer.appendChild(time);

    // 访问量
    var stats = document.createElement('p');
    stats.id = 'visit-stats';
    stats.style.cssText =
      'text-align:center;font-size:.8rem;opacity:.7;margin:.25rem 0 0;';
    stats.innerHTML =
      '<span id="busuanzi_container_site_pv">总访问量 ' +
      '<span id="busuanzi_value_site_pv">-</span> 次</span>' +
      '<span style="margin:0 .7rem;opacity:.35">|</span>' +
      '<span id="busuanzi_container_site_uv">总访客数 ' +
      '<span id="busuanzi_value_site_uv">-</span> 人</span>';
    footer.appendChild(stats);

    renderTime();
    setInterval(renderTime, 1000);
    if (USE_REAL_COUNTER) loadCounter();

    // 调试用：在控制台能看到这行说明脚本跑通了
    if (window.console) console.log('[footer-stats] mounted');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
