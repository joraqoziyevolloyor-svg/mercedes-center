/* Podveska sxemasi moduli. Kerak: window.MC_SXEMA (sxema-data.js).
   Ishlatish:
     MCSxema.mount(el, {
       products,              // saytdagi tovarlar ro'yxati (id, name, brand, oem, price, stock, img)
       car: 'Bongo 3',        // boshlang'ich mashina (ixtiyoriy)
       imgBase: '',           // p.img oldiga qo'shiladigan yo'l (ixtiyoriy)
       href: id => '#p/'+id,  // "Ko'rish" havolasi
       onAdd: id => {},       // berilsa "Savatga" tugmasi chiqadi
       onAsk: (car, part) => {} // berilsa, yo'q detal uchun "So'rov qoldirish" tugmasi chiqadi
     });
*/
(function () {
  'use strict';
  var CSS = [
    '.mc-sx{--sx-av:color-mix(in srgb,var(--accent,#f2a91d) 32%,var(--surface,#fff));color:var(--ink,#131a22);font:inherit}',
    '.mc-sx *{box-sizing:border-box}',
    '.mc-sx-bar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}',
    '.mc-sx-seg{display:inline-flex;border:1px solid var(--line,#dde1e6);border-radius:var(--r,10px);overflow:hidden;background:var(--surface,#fff)}',
    '.mc-sx-seg button{appearance:none;border:0;background:none;color:inherit;font:inherit;font-weight:600;padding:9px 14px;min-height:40px;cursor:pointer}',
    '.mc-sx-seg button+button{border-left:1px solid var(--line,#dde1e6)}',
    '.mc-sx-seg button[aria-pressed="true"]{background:var(--steel,#1d2a36);color:#fff}',
    '.mc-sx-cars{display:flex;flex-wrap:wrap;gap:6px;width:100%}',
    '.mc-sx-cars .mc-sx-chip{font-size:14px;font-weight:600;min-height:40px;padding:8px 14px}',
    '.mc-sx-grid{display:grid;gap:12px}',
    '@media (min-width:900px){.mc-sx-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);align-items:start}.mc-sx-side{position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto}}',
    '.mc-sx-fig{background:var(--surface,#fff);border:1px solid var(--line,#dde1e6);border-radius:var(--r,10px);padding:10px}',
    '.mc-sx-svg{display:block;width:100%;height:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.mc-sx-svg .body{fill:var(--tile,#e9ecef);stroke:var(--line,#dde1e6);stroke-width:1.5}',
    '.mc-sx-svg .tyre{fill:var(--muted,#5d6874);opacity:.55}',
    '.mc-sx-svg .leaf{fill:var(--surface,#fff);stroke:var(--muted,#5d6874);stroke-width:1.2}',
    '.mc-sx-svg .rod{stroke:var(--muted,#5d6874);stroke-width:3;stroke-linecap:round;fill:none}',
    '.mc-sx-svg .rod.thick{stroke-width:6}',
    '.mc-sx-svg .hit{stroke:transparent;stroke-width:20;stroke-linecap:round;fill:none}',
    '.mc-sx-svg .stud{fill:var(--ink,#131a22)}',
    '.mc-sx-svg .stud-line{stroke:var(--ink,#131a22);stroke-width:2.5;fill:none}',
    '.mc-sx-svg .lb{font-size:11px;font-weight:700;fill:var(--muted,#5d6874);letter-spacing:.06em}',
    '.mc-sx-svg .hs{cursor:pointer;outline:none}',
    '.mc-sx-svg>:not(.hs):not(:first-child){pointer-events:none}',
    '.mc-sx-svg .hs .part{fill:var(--sx-av);stroke:var(--ink,#131a22);stroke-width:1.6;transition:fill .12s}',
    '.mc-sx-svg .hs:hover .part,.mc-sx-svg .hs:focus-visible .part{fill:color-mix(in srgb,var(--accent,#f2a91d) 65%,var(--surface,#fff))}',
    '.mc-sx-svg .hs.off .part{fill:var(--tile,#e9ecef);stroke:var(--muted,#5d6874);stroke-dasharray:3 3;opacity:.6}',
    '.mc-sx-svg .hs.sel .part{fill:var(--accent,#f2a91d);stroke-width:2.4}',
    '.mc-sx-svg .hs.sel .rod{stroke:var(--accent,#f2a91d)}',
    '.mc-sx-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--muted,#5d6874);margin-top:6px}',
    '.mc-sx-legend i{display:inline-block;width:12px;height:12px;border-radius:3px;border:1.5px solid var(--ink,#131a22);vertical-align:-2px;margin-right:5px;background:var(--sx-av)}',
    '.mc-sx-legend i.off{background:var(--tile,#e9ecef);border-style:dashed;border-color:var(--muted,#5d6874)}',
    '.mc-sx-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}',
    '.mc-sx-chip{appearance:none;font:inherit;font-size:13px;border:1px solid var(--line,#dde1e6);background:var(--surface,#fff);color:inherit;border-radius:999px;padding:6px 11px;min-height:34px;cursor:pointer}',
    '.mc-sx-chip b{font-weight:700;margin-left:4px;color:var(--muted,#5d6874)}',
    '.mc-sx-chip.off{color:var(--muted,#5d6874);border-style:dashed}',
    '.mc-sx-chip[aria-pressed="true"]{background:var(--accent,#f2a91d);color:var(--accent-ink,#1b1300);border-color:var(--accent,#f2a91d)}',
    '.mc-sx-chip[aria-pressed="true"] b{color:inherit}',
    '.mc-sx-panel{background:var(--surface,#fff);border:1px solid var(--line,#dde1e6);border-radius:var(--r,10px);padding:12px}',
    '.mc-sx-panel h3{margin:0 0 8px;font-size:17px;line-height:1.3}',
    '.mc-sx-note{font-size:13px;color:var(--muted,#5d6874);margin:6px 0 10px}',
    '.mc-sx-empty{color:var(--muted,#5d6874);font-size:14px;margin:4px 0}',
    '.mc-sx-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}',
    '.mc-sx-card{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:start;border:1px solid var(--line,#dde1e6);border-radius:var(--r,10px);padding:8px}',
    '.mc-sx-card.out{opacity:.6}',
    '.mc-sx-ph{width:64px;height:64px;border-radius:8px;background:var(--tile,#e9ecef);object-fit:contain;display:block}',
    '.mc-sx-nm{font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}',
    '.mc-sx-meta{font-size:12.5px;color:var(--muted,#5d6874);margin-top:2px;overflow-wrap:anywhere}',
    '.mc-sx-warn{color:var(--no,#b3261e);font-weight:600}',
    '.mc-sx-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:6px}',
    '.mc-sx-price{font-weight:700;font-size:15px}',
    '.mc-sx-price small{font-weight:500;color:var(--muted,#5d6874);font-size:11.5px;margin-left:3px}',
    '.mc-sx-tag{font-size:11.5px;font-weight:600;border-radius:6px;padding:2px 7px;background:var(--tile,#e9ecef)}',
    '.mc-sx-tag.ok{background:var(--ok-bg,#e3f4ea);color:var(--ok,#1f8a4c)}',
    '.mc-sx-tag.no{background:var(--no-bg,#fbe7e5);color:var(--no,#b3261e)}',
    '.mc-sx-btn{appearance:none;font:inherit;font-size:13px;font-weight:600;border-radius:8px;padding:7px 12px;min-height:36px;cursor:pointer;border:1px solid var(--line,#dde1e6);background:var(--surface,#fff);color:inherit;text-decoration:none;display:inline-flex;align-items:center}',
    '.mc-sx-btn.pri{background:var(--accent,#f2a91d);border-color:var(--accent,#f2a91d);color:var(--accent-ink,#1b1300)}',
    '.mc-sx-act{display:flex;gap:6px;margin-left:auto}'
  ].join('\n');

  var SIDE_UZ = { LH: 'Chap', RH: "O'ng" };
  // saytdagi bilan bir xil: $12, $0.70
  function money(n) { var r = Math.round(n * 100) / 100; return '$' + r.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(r) ? 0 : 2, maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // shaklning haqiqiy yuzasi (qiya to'rtburchak bbox dan ancha kichik)
  function shapeArea(e) {
    try {
      var t = e.tagName.toLowerCase();
      if (t === 'circle') { var r = +e.getAttribute('r'); return Math.PI * r * r; }
      if (t === 'polygon') {
        var p = e.getAttribute('points').trim().split(/[\s,]+/).map(Number), a = 0;
        for (var i = 0; i < p.length; i += 2) { var j = (i + 2) % p.length; a += p[i] * p[j + 1] - p[j] * p[i + 1]; }
        return Math.abs(a) / 2;
      }
      var bb = e.getBBox(); return bb.width * bb.height;
    } catch (x) { return 0; }
  }
  function injectCss() {
    if (document.getElementById('mc-sx-css')) return;
    var st = document.createElement('style'); st.id = 'mc-sx-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  function mount(root, opt) {
    opt = opt || {};
    var D = opt.data || window.MC_SXEMA;
    if (!D) throw new Error('MC_SXEMA topilmadi: sxema-data.js ulanmagan');
    injectCss();
    var byId = {};
    (opt.products || []).forEach(function (p) { byId[String(p.id)] = p; });
    var cars = Object.keys(D.cars);
    var st = { car: cars.indexOf(opt.car) >= 0 ? opt.car : cars[0], view: 'front', part: null, side: 'all' };
    var href = opt.href || function (id) { return '#p/' + encodeURIComponent(id); };
    var imgBase = opt.imgBase || '';

    root.classList.add('mc-sx');
    root.innerHTML =
      '<div class="mc-sx-bar"><div class="mc-sx-cars" data-k="car"></div><div class="mc-sx-seg" data-k="view"></div></div>' +
      '<div class="mc-sx-grid"><div class="mc-sx-fig"><div class="mc-sx-draw"></div>' +
      '<div class="mc-sx-legend"><span><i></i>Bor</span><span><i class="off"></i>Hozir yo\'q</span><span class="mc-sx-vnote"></span></div></div>' +
      '<div class="mc-sx-side"><div class="mc-sx-chips"></div><div class="mc-sx-panel" aria-live="polite"></div></div></div>';
    var $ = function (s) { return root.querySelector(s); };

    function entries(part) {
      return ((C().map || {})[part] || []).filter(function (e) { return byId[e.id]; });
    }
    function partState(part) {
      var es = entries(part);
      if (!es.length) return 'none';
      return es.some(function (e) { return byId[e.id].stock; }) ? 'ok' : 'out';
    }
    function C() { return D.cars[st.car]; }
    function PT(k) { return C().parts[k]; }
    function viewParts() {
      return Object.keys(C().parts).filter(function (k) { return PT(k).view === st.view; });
    }

    function renderBar() {
      $('[data-k="car"]').innerHTML = cars.map(function (c) {
        return '<button type="button" class="mc-sx-chip" data-car="' + esc(c) + '" aria-pressed="' + (c === st.car) + '">' + esc(D.cars[c].uz || c) + '</button>';
      }).join('');
      if (!C().views[st.view]) st.view = Object.keys(C().views)[0];
      $('[data-k="view"]').innerHTML = Object.keys(C().views).map(function (v) {
        return '<button type="button" data-view="' + v + '" aria-pressed="' + (v === st.view) + '">' + esc(C().views[v].uz) + '</button>';
      }).join('');
    }

    function renderDraw() {
      $('.mc-sx-draw').innerHTML = C().views[st.view].svg;
      // kichik detallar kattalar ustida bo'lsin: bosiladigan guruhlarni ko'rinadigan yuzasi bo'yicha kattadan kichikka tartiblash
      var svgEl = $('.mc-sx-draw svg');
      if (svgEl) {
        var hsList = Array.prototype.slice.call(svgEl.querySelectorAll(':scope > .hs')).map(function (g) {
          var a = 0;
          Array.prototype.forEach.call(g.querySelectorAll('.part'), function (e) { a += shapeArea(e); });
          return [g, +g.getAttribute('data-z') || 0, a];
        });
        hsList.sort(function (x, y) { return (x[1] - y[1]) || (y[2] - x[2]); });
        hsList.forEach(function (x) { svgEl.appendChild(x[0]); });
        // ko'rinmas keng bosish chiziqlari eng pastki qatlamga: ular faqat bo'sh joyda ishlaydi, qo'shni detalni yopmaydi
        var under = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        hsList.forEach(function (x) {
          var hits = x[0].querySelectorAll('.hit'); if (!hits.length) return;
          var hg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          hg.setAttribute('class', 'hs hs-hit'); hg.setAttribute('data-part', x[0].getAttribute('data-part'));
          if (x[0].getAttribute('data-side')) hg.setAttribute('data-side', x[0].getAttribute('data-side'));
          Array.prototype.forEach.call(hits, function (h) { hg.appendChild(h); });
          under.appendChild(hg);
        });
        svgEl.insertBefore(under, svgEl.firstChild);
      }
      $('.mc-sx-vnote').textContent = C().views[st.view].note || 'Orqadan qaralgan: chap tomon chapda';
      root.querySelectorAll('.mc-sx-draw .hs').forEach(function (g) {
        var s = partState(g.getAttribute('data-part'));
        if (s !== 'ok') g.classList.add('off');
        var t = g.querySelector('title');
        if (t && s === 'none') t.textContent += ' — hozir yo\'q';
        if (t && s === 'out') t.textContent += ' — tugagan';
      });
      markSel();
    }

    function markSel() {
      root.querySelectorAll('.mc-sx-draw .hs').forEach(function (g) {
        var on = g.getAttribute('data-part') === st.part &&
          (st.side === 'all' || !g.getAttribute('data-side') || g.getAttribute('data-side') === st.side);
        g.classList.toggle('sel', on);
        g.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function renderChips() {
      $('.mc-sx-chips').innerHTML = viewParts().map(function (k) {
        var s = partState(k), n = entries(k).length;
        return '<button type="button" class="mc-sx-chip' + (s === 'ok' ? '' : ' off') + '" data-part="' + k + '" aria-pressed="' + (k === st.part) + '">' +
          esc(PT(k).uz) + '<b>' + n + '</b></button>';
      }).join('');
    }

    function card(e) {
      var p = byId[e.id], tags = [];
      if (e.side) tags.push('<span class="mc-sx-tag">' + SIDE_UZ[e.side] + ' (' + e.side + ')</span>');
      if (e.pos === '?') tags.push('<span class="mc-sx-tag">Old/orqa yozilmagan</span>');
      var note = e.note ? '<div class="mc-sx-meta mc-sx-warn">' + esc(e.note) + '</div>' : '';
      tags.push(p.stock ? '<span class="mc-sx-tag ok">Bor</span>' : '<span class="mc-sx-tag no">Tugagan</span>');
      var img = p.img ? '<img class="mc-sx-ph" loading="lazy" alt="" src="' + esc(imgBase + p.img) + '">' : '<div class="mc-sx-ph"></div>';
      var price = p.price != null ? '<span class="mc-sx-price">' + esc(money(p.price)) + '<small>optom</small></span>' : '<span class="mc-sx-price"><small>narxini so\'rang</small></span>';
      var acts = '<a class="mc-sx-btn" href="' + esc(href(p.id)) + '">Ko\'rish</a>' +
        (opt.onAdd && p.stock ? '<button type="button" class="mc-sx-btn pri" data-add="' + esc(p.id) + '">Savatga</button>' : '');
      return '<li class="mc-sx-card' + (p.stock ? '' : ' out') + '">' + img + '<div>' +
        '<div class="mc-sx-nm">' + esc(p.name) + '</div>' +
        '<div class="mc-sx-meta">' + esc([p.brand, p.oem && ('OEM ' + p.oem)].filter(Boolean).join(' · ')) + '</div>' +
        note +
        '<div class="mc-sx-row">' + price + tags.join('') + '<span class="mc-sx-act">' + acts + '</span></div></div></li>';
    }

    function renderPanel() {
      var P = $('.mc-sx-panel');
      if (!st.part) {
        P.innerHTML = '<p class="mc-sx-empty">Rasmdagi detalni yoki yuqoridagi nomni bosing, mos tovarlar shu yerda chiqadi.</p>';
        return;
      }
      var meta = PT(st.part), es = entries(st.part);
      var html = '<h3>' + esc(meta.uz) + ' · ' + esc(st.car) + '</h3>';
      if (meta.sided) {
        html += '<div class="mc-sx-seg" style="margin-bottom:8px">' + ['all', 'LH', 'RH'].map(function (s) {
          return '<button type="button" data-side="' + s + '" aria-pressed="' + (st.side === s) + '">' + (s === 'all' ? 'Hammasi' : SIDE_UZ[s]) + '</button>';
        }).join('') + '</div>';
      }
      var list = es.filter(function (e) { return st.side === 'all' || !e.side || e.side === st.side; });
      list.sort(function (a, b) {
        var A = byId[a.id], B = byId[b.id];
        return (B.stock - A.stock) || ((A.price == null) - (B.price == null)) || ((A.price || 0) - (B.price || 0));
      });
      if (st.side !== 'all' && list.some(function (e) { return !e.side; }))
        html += '<p class="mc-sx-note">Nomida chap/o\'ng yozilmagan tovarlar ham ko\'rsatildi. Tomonini OEM raqami bo\'yicha tekshiring.</p>';
      if (!list.length) {
        html += '<p class="mc-sx-empty">' + esc(st.car) + ' uchun bu detal hozir katalogda yo\'q.</p>' +
          (opt.onAsk ? '<button type="button" class="mc-sx-btn pri" data-ask="1">So\'rov qoldirish</button>' : '');
      } else {
        html += '<ul class="mc-sx-list">' + list.map(card).join('') + '</ul>';
      }
      P.innerHTML = html;
      Array.prototype.forEach.call(P.querySelectorAll('img.mc-sx-ph'), function (im) {
        function hide() { im.style.visibility = 'hidden'; }
        im.addEventListener('error', hide);
      });
    }

    function select(part, side) {
      st.part = part; st.side = side || 'all';
      markSel(); renderChips(); renderPanel();
    }

    function renderAll() { renderBar(); renderDraw(); renderChips(); renderPanel(); }

    root.addEventListener('click', function (ev) {
      var t = ev.target;
      var b = t.closest('[data-car]');
      if (b && b.tagName === 'BUTTON') { st.car = b.getAttribute('data-car'); st.part = null; st.side = 'all'; return renderAll(); }
      b = t.closest('button[data-view]');
      if (b) { st.view = b.getAttribute('data-view'); st.part = null; st.side = 'all'; return renderAll(); }
      b = t.closest('.mc-sx-chip');
      if (b) return select(b.getAttribute('data-part'), 'all');
      b = t.closest('.mc-sx-panel button[data-side]');
      if (b) { st.side = b.getAttribute('data-side'); markSel(); return renderPanel(); }
      b = t.closest('button[data-add]');
      if (b && opt.onAdd) { opt.onAdd(b.getAttribute('data-add')); b.textContent = 'Qo\'shildi ✓'; return; }
      b = t.closest('button[data-ask]');
      if (b && opt.onAsk) return opt.onAsk(st.car, PT(st.part).uz);
      var g = t.closest('.hs');
      if (g) {
        select(g.getAttribute('data-part'), g.getAttribute('data-side') || 'all');
        if (window.matchMedia && !window.matchMedia('(min-width:900px)').matches)
          $('.mc-sx-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    root.addEventListener('keydown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.hs');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); select(g.getAttribute('data-part'), g.getAttribute('data-side') || 'all'); }
    });

    renderAll();
    return {
      setCar: function (c) { if (D.cars[c]) { st.car = c; st.part = null; renderAll(); } },
      setView: function (v) { if (C().views[v]) { st.view = v; st.part = null; renderAll(); } },
      select: select
    };
  }

  window.MCSxema = { mount: mount };
})();
