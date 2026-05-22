/**
 * KalkRemont Widget — встраиваемый калькулятор
 *
 * Использование:
 * <div data-kalkremont-widget="oboi"></div>
 * <script src="https://www.kalkremont.ru/widget/embed.js" async></script>
 *
 * Доступные типы:
 *   oboi — обои
 *   laminat — ламинат
 *   kraska — краска
 *   plitka — плитка
 *   shtukaturka — штукатурка
 *
 * Опции через data-атрибуты:
 *   data-kalkremont-widget="oboi"  — тип калькулятора (обязательно)
 *   data-theme="light|dark"        — тема (default: light)
 *   data-utm="мой-блог"            — UTM-метка для отслеживания трафика
 */
(function () {
  'use strict';

  var BASE = 'https://www.kalkremont.ru';

  var CALCS = {
    oboi: { name: 'Калькулятор обоев', path: '/raschet-oboev/' },
    laminat: { name: 'Калькулятор ламината', path: '/raschet-laminata/' },
    kraska: { name: 'Калькулятор краски', path: '/raschet-kraski/' },
    plitka: { name: 'Калькулятор плитки', path: '/raschet-plitki/' },
    shtukaturka: { name: 'Калькулятор штукатурки', path: '/raschet-shtukaturki/' }
  };

  function createIframe(type, theme, utm) {
    var calc = CALCS[type];
    if (!calc) return null;

    var iframe = document.createElement('iframe');
    var url = BASE + calc.path + '?embed=1' + (theme ? '&theme=' + theme : '') + (utm ? '&utm_source=' + encodeURIComponent(utm) : '');
    iframe.src = url;
    iframe.style.cssText = 'width:100%;border:0;border-radius:8px;min-height:680px;background:#fff;display:block';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', calc.name);
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    return iframe;
  }

  function createPoweredBy() {
    var p = document.createElement('div');
    p.style.cssText = 'text-align:center;font-size:12px;color:#999;margin-top:6px;font-family:-apple-system,sans-serif';
    p.innerHTML = 'Powered by <a href="' + BASE + '/" target="_blank" rel="noopener" style="color:#0a5cce;text-decoration:none">KalkRemont</a>';
    return p;
  }

  function init() {
    var slots = document.querySelectorAll('[data-kalkremont-widget]');
    slots.forEach(function (slot) {
      if (slot.dataset.kalkremontInited) return;
      slot.dataset.kalkremontInited = '1';
      var type = slot.dataset.kalkremontWidget;
      var theme = slot.dataset.theme || 'light';
      var utm = slot.dataset.utm || '';
      var iframe = createIframe(type, theme, utm);
      if (!iframe) {
        slot.innerHTML = '<div style="color:#c00;font-size:14px">[KalkRemont] Неизвестный тип виджета: ' + type + '. Доступные: oboi, laminat, kraska, plitka, shtukaturka.</div>';
        return;
      }
      slot.innerHTML = '';
      slot.appendChild(iframe);
      slot.appendChild(createPoweredBy());

      // Auto-resize по сообщениям от iframe (если калькулятор отправит height)
      window.addEventListener('message', function (e) {
        if (e.origin !== BASE) return;
        if (e.data && e.data.type === 'kalkremont-resize' && typeof e.data.height === 'number') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
