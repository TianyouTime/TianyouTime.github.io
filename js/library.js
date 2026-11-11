(function () {
  'use strict';
  function init() {
    document.querySelectorAll('[data-tab-group]').forEach(function (group) {
      var tabs = Array.from(group.querySelectorAll('[data-tab]'));
      var panels = Array.from(group.querySelectorAll('[data-panel]'));
      group.querySelector('.collection-tabs').setAttribute('role', 'tablist');
      tabs.forEach(function (tab) {
        tab.id = 'tab-' + group.dataset.tabGroup + '-' + tab.dataset.tab;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', tab.dataset.tab);
      });
      panels.forEach(function (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-' + group.dataset.tabGroup + '-' + panel.dataset.panel);
      });
      function activate() {
        var fragment = location.hash.slice(1).split('/');
        var key = fragment[0];
        var name;
        try { name = fragment.length > 1 ? decodeURIComponent(fragment.slice(1).join('/')) : null; }
        catch (error) { name = null; }
        if (!tabs.some(function (tab) { return tab.dataset.tab === key; })) key = group.dataset.defaultTab;
        tabs.forEach(function (tab) {
          var selected = tab.dataset.tab === key;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
        });
        panels.forEach(function (panel) { panel.hidden = panel.dataset.panel !== key; });
        if (group.dataset.tabGroup === 'find') {
          panels.forEach(function (panel) {
            panel.querySelectorAll('[data-group-name]').forEach(function (section) {
              var target = panel.dataset.panel === key && section.dataset.groupName === name;
              section.open = panel.dataset.panel === 'tags' ? target : true;
              if (target) {
                var summary = section.querySelector('summary');
                summary.focus({ preventScroll: true });
                section.scrollIntoView({ block: 'center' });
              }
            });
          });
        }
      }
      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function (event) {
          event.preventDefault();
          if (location.hash !== tab.hash) history.pushState(null, '', tab.hash);
          activate();
        });
        tab.addEventListener('keydown', function (event) {
          var next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault();
          tabs[next].click();
          tabs[next].focus();
        });
      });
      window.addEventListener('hashchange', activate);
      window.addEventListener('popstate', activate);
      activate();
    });
    var banner = document.getElementById('banner');
    if (banner) {
      var request = 0;
      function sizeBanner() {
        var match = banner.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        if (!match) return;
        var current = ++request;
        var image = new Image();
        image.onload = function () {
          if (current !== request || !image.naturalWidth || !image.naturalHeight) return;
          banner.parentElement.style.setProperty('--banner-ratio', image.naturalWidth / image.naturalHeight);
          banner.parentElement.setAttribute('data-responsive-banner', '');
          document.body.classList.add('mobile-banner-fit');
          window.dispatchEvent(new Event('resize'));
        };
        image.src = match[1];
      }
      banner.addEventListener('bannerchange', sizeBanner);
      sizeBanner();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
