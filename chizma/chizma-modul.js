/* Hayotim — Chizma va yozuv: iPad qalami bilan erkin yozish, AutoCAD odatlari bilan aniq chizma, qatlamlar, PDF va DXF */
(function () {
  'use strict';
  var KEY = 'hayot.chizma.v1';
  var PROJ = ['Yozuv', 'Mercedes Center', 'HVAC obyektlar', 'Uy', 'Boshqa'];
  var LAY0 = [['Devor', '#1d1d1b'], ['Isitish', '#9a2f1f'], ['Suv', '#2a4f8f'], ['Elektr', '#a08a12'], ['Izoh', '#6b6b66']];
  var EXTRA = ['#2f6b3f', '#1f7a7a', '#7a3f8f', '#b5651d'];
  var INK = ['#1d1d1b', '#2a4f8f', '#9a2f1f', '#2f6b3f', '#b5651d', '#e0b400'];
  var WID = [['Ingichka', 1.2], ['O\'rta', 2.4], ['Qalin', 4.5]];
  var PAPER = [['toza', 'Toza'], ['chiziq', 'Chiziqli'], ['katak', 'Katakli'], ['nuqta', 'Nuqtali']];
  var I = function (d) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var IC = {
    pen: I('<path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/><path d="M14 7l3 3"/>'),
    mark: I('<path d="M4 20h7"/><path d="M8 16l-1-1l8.5-8.5l3 3L10 18z"/><path d="M7 15l-1.5 3.5L9 17"/>'),
    erase: I('<path d="M9 20h11"/><path d="M4.5 14.5l8.8-8.8l5.5 5.5L12 18H8z"/><path d="M9 10l5.5 5.5"/>'),
    sel: I('<path d="M5 4l5.5 15l2.2-6.3L19 10.5z"/>'),
    line: I('<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="5" r="1.6"/>'),
    rect: I('<rect x="4" y="6" width="16" height="12"/>'),
    circle: I('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="0.8"/>'),
    dim: I('<path d="M4 7v10M20 7v10M4 12h16"/><path d="M6.5 9.5L4 12l2.5 2.5M17.5 9.5L20 12l-2.5 2.5"/>'),
    text: I('<path d="M5 6h14M12 6v13M9 19h6"/>'),
    ortho: I('<path d="M5 4v15h15"/><path d="M5 19l6-6"/>'),
    osnap: I('<rect x="8.5" y="8.5" width="7" height="7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
    undo: I('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    redo: I('<path d="M15 14l5-5l-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
    pages: I('<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>'),
    full: I('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    small: I('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    share: I('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M5 13v6h14v-6"/>'),
    fit: I('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6"/>'),
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7s10 7 10 7s-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
  };
  var FREE = [['pen', 'Ruchka', 'P'], ['mark', 'Marker', 'M'], ['erase', 'O\'chirg\'ich', 'E'], ['sel', 'Tanlash', 'V']];
  var CAD = [['line', 'Chiziq', 'L'], ['rect', 'To\'rtburchak', 'R'], ['circle', 'Aylana', 'C'], ['dim', 'O\'lcham', 'D'], ['text', 'Matn', 'T']];
  var HINT = {
    pen: 'Qalam bilan yozing yoki chizing. Barmoq bilan suring, ikki barmoq bilan yaqinlashtiring.',
    mark: 'Marker — muhim joyni bo\'yab qo\'yish uchun.',
    erase: 'Tekkan chiziq butunligicha o\'chadi.',
    sel: 'Bosib tanlang, sudrab suring. Bo\'sh joydan sudrasangiz — ramka bilan tanlash.',
    line: 'Nuqtani bosing. Keyingisini bosing yoki uzunlikni yozib Enter. Esc — tugatish.',
    rect: 'Ikki burchakni bosing. Yoki o\'lchamni yozing: 8x5 va Enter.',
    circle: 'Markaz, keyin radius. Yoki radiusni yozib Enter.',
    dim: 'Ikki nuqta, uchinchisi — o\'lcham chizig\'i qayerda turadi.',
    text: 'Matn qo\'yiladigan joyni bosing.'
  };
  var STEPS = [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 50, 100, 500];
  var DIM_H = 0.22, FONT = '"Helvetica Neue", Arial, sans-serif', HI = '#d9822b';

  function h(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function fmt(v) { return String(Math.round(v * 100) / 100); }
  function num(s) { return parseFloat(String(s).replace(',', '.')); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function segDist(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
  function pad(x) { return ('0' + x).slice(-2); }
  function when(t) { var d = new Date(t); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function today() { var d = new Date(); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); }

  function layer(name, col) { return { id: uid(), name: name, color: col, on: true, lock: false }; }
  function blank(name, project, paper) { var L = LAY0.map(function (x) { return layer(x[0], x[1]); }); return { id: uid(), name: name, project: project, paper: paper || 'chiziq', updated: Date.now(), layers: L, active: L[0].id, shapes: [] }; }
  function demo() {
    var d = blank('Do\'kon zali qayta joylashuv', 'Mercedes Center', 'katak'), L = d.layers;
    function add(t, li, p, x) { var s = { id: uid(), t: t, l: L[li].id, p: p }; for (var k in x || {}) s[k] = x[k]; d.shapes.push(s); }
    add('rect', 0, [[0, 0], [8, 5]]); add('rect', 0, [[8, 0], [13, 5]]); add('line', 0, [[4, 5], [4, 7]]);
    add('dim', 4, [[0, 0], [8, 0], [0, -0.8]]); add('dim', 4, [[8, 0], [13, 0], [8, -0.8]]); add('dim', 4, [[13, 0], [13, 5], [13.8, 0]]);
    add('text', 4, [[2.95, 2.6]], { s: 'Do\'kon zali', h: 0.35 }); add('text', 4, [[9.95, 2.6]], { s: 'Ombor', h: 0.35 }); add('text', 4, [[4.25, 6.4]], { s: 'kirish', h: 0.25 });
    d.updated -= 1000;
    return d;
  }

  /* --- geometriya: bitta joyda, ekran, PDF va DXF shundan chizadi --- */
  function dimGeo(s) {
    var a = s.p[0], b = s.p[1], c = s.p[2], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, off = (c[0] - a[0]) * nx + (c[1] - a[1]) * ny, sg = off < 0 ? -1 : 1;
    return { a: a, b: b, A: [a[0] + nx * off, a[1] + ny * off], B: [b[0] + nx * off, b[1] + ny * off], L: L, u: [ux, uy], o: [nx * sg, ny * sg], off: Math.abs(off) };
  }
  function dimSegs(g) {
    var r = [], o = g.o, u = g.u, k = 0.07, t = [(u[0] + o[0]) * k, (u[1] + o[1]) * k];
    if (g.off > 0.1) { r.push([[g.a[0] + o[0] * 0.05, g.a[1] + o[1] * 0.05], [g.A[0] + o[0] * 0.1, g.A[1] + o[1] * 0.1]]); r.push([[g.b[0] + o[0] * 0.05, g.b[1] + o[1] * 0.05], [g.B[0] + o[0] * 0.1, g.B[1] + o[1] * 0.1]]); }
    r.push([[g.A[0] - u[0] * 0.1, g.A[1] - u[1] * 0.1], [g.B[0] + u[0] * 0.1, g.B[1] + u[1] * 0.1]]);
    r.push([[g.A[0] - t[0], g.A[1] - t[1]], [g.A[0] + t[0], g.A[1] + t[1]]]); r.push([[g.B[0] - t[0], g.B[1] - t[1]], [g.B[0] + t[0], g.B[1] + t[1]]]);
    return r;
  }
  function dimText(g) {
    var m = 0.06 + DIM_H / 2, ang = Math.atan2(g.u[1], g.u[0]) * 180 / Math.PI;
    if (ang > 90 || ang <= -90) ang += ang > 0 ? -180 : 180;
    return { c: [(g.A[0] + g.B[0]) / 2 + g.o[0] * m, (g.A[1] + g.B[1]) / 2 + g.o[1] * m], ang: ang, s: fmt(g.L) };
  }
  function penW(s, q) { return q[2] || s.w || 0.04; }
  var BB = new WeakMap();
  function bbOf(s) {
    var c = BB.get(s); if (c) return c;
    var p = s.p, xs, ys, e = 0, r;
    if (s.t === 'circle') r = [p[0][0] - s.r, p[0][1] - s.r, p[0][0] + s.r, p[0][1] + s.r];
    else if (s.t === 'text') r = [p[0][0], p[0][1] - s.h, p[0][0] + s.s.length * s.h * 0.55, p[0][1] + s.h * 0.2];
    else {
      if (s.t === 'dim') { var g = dimGeo(s), tc = dimText(g).c; p = [g.a, g.b, g.A, g.B, [tc[0] - DIM_H, tc[1] - DIM_H], [tc[0] + DIM_H, tc[1] + DIM_H]]; }
      if (s.t === 'pen' || s.t === 'mark') e = (s.w || 0.06) / 2 + 0.05;
      xs = p.map(function (q) { return q[0]; }); ys = p.map(function (q) { return q[1]; });
      r = [Math.min.apply(0, xs) - e, Math.min.apply(0, ys) - e, Math.max.apply(0, xs) + e, Math.max.apply(0, ys) + e];
    }
    BB.set(s, r); return r;
  }
  function bboxAll(list) { var b = null; list.forEach(function (s) { var q = bbOf(s); b = b ? [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])] : q; }); return b; }
  function corners(s) { var a = s.p[0], b = s.p[1]; return [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]; }
  function segsOf(s) {
    var p = s.p, r = [], i;
    if (s.t === 'line' || s.t === 'pen' || s.t === 'mark') for (i = 1; i < p.length; i++) r.push([p[i - 1], p[i]]);
    else if (s.t === 'rect') { var c = corners(s); for (i = 0; i < 4; i++) r.push([c[i], c[(i + 1) % 4]]); }
    else if (s.t === 'dim') r = dimSegs(dimGeo(s));
    return r;
  }
  function keys(s) {
    var p = s.p, r = [], i;
    if (s.t === 'line') return [[p[0], 'end'], [p[1], 'end'], [[(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2], 'mid']];
    if (s.t === 'rect') { var c = corners(s); for (i = 0; i < 4; i++) { var n = c[(i + 1) % 4]; r.push([c[i], 'end'], [[(c[i][0] + n[0]) / 2, (c[i][1] + n[1]) / 2], 'mid']); } return r; }
    if (s.t === 'circle') return [[p[0], 'cen'], [[p[0][0] + s.r, p[0][1]], 'end'], [[p[0][0] - s.r, p[0][1]], 'end'], [[p[0][0], p[0][1] + s.r], 'end'], [[p[0][0], p[0][1] - s.r], 'end']];
    if (s.t === 'text') return [[p[0], 'end']];
    return [];
  }
  function aci(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2, hu;
    if (d < 0.15) return l < 0.3 ? 7 : l < 0.7 ? 8 : 9;
    hu = mx === r ? 60 * (((g - b) / d + 6) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    var best = 1, bd = 999; [[0, 1], [30, 30], [60, 2], [120, 3], [180, 4], [240, 5], [300, 6], [360, 1]].forEach(function (x) { if (Math.abs(x[0] - hu) < bd) { bd = Math.abs(x[0] - hu); best = x[1]; } });
    return best;
  }

  var CSS = '.cz{--c-ink:var(--ink,#1d1d1b);--c-soft:var(--soft,#6b6b66);--c-rule:var(--rule,#e3e1d9);--c-paper:#fffefa;font-family:var(--fs,system-ui,sans-serif);font-size:13px;line-height:1.4;color:var(--c-ink);outline:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.cz-stage{position:relative;height:72vh;min-height:520px;border:1px solid var(--c-rule);border-radius:14px;overflow:hidden;background:var(--c-paper)}' +
    '.cz canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}' +
    '.cz button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.cz-fl{position:absolute;display:flex;align-items:center;gap:2px;padding:4px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(29,29,27,.09);border-radius:12px;box-shadow:0 2px 14px rgba(29,29,27,.08);z-index:3}' +
    '.cz-tb{top:10px;left:10px;right:150px;flex-wrap:wrap;width:max-content;max-width:calc(100% - 160px)}' +
    '.cz-tr{top:10px;right:10px}.cz-zm{bottom:10px;right:10px}' +
    '.cz-b{width:40px;height:40px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:var(--c-ink);position:relative}' +
    '.cz-b:hover{background:rgba(29,29,27,.06)}.cz-b[aria-pressed="true"]{background:var(--c-ink);color:#fff}' +
    '.cz-sep{width:1px;height:26px;background:var(--c-rule);margin:0 4px}' +
    '.cz-dot{width:32px;height:40px;display:inline-flex;align-items:center;justify-content:center}' +
    '.cz-dot i{display:block;width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}' +
    '.cz-dot[aria-pressed="true"] i{box-shadow:0 0 0 2px #fff,0 0 0 3.5px var(--c-ink)}' +
    '.cz-wd i{background:var(--c-ink);border-radius:9px;width:18px;box-shadow:none}.cz-wd[aria-pressed="true"] i{box-shadow:none;background:var(--c-ink)}.cz-wd[aria-pressed="true"]{background:rgba(29,29,27,.08);border-radius:9px}' +
    '.cz-lsel{font:inherit;font-size:13px;height:34px;border:1px solid var(--c-rule);border-radius:8px;background:#fff;padding:0 8px;margin:0 4px;color:inherit}' +
    '.cz-zm .pct{min-width:52px;text-align:center;font-size:12px;color:var(--c-soft);font-variant-numeric:tabular-nums}' +
    '.cz-st{position:absolute;left:10px;bottom:10px;max-width:calc(100% - 210px);padding:7px 12px;border-radius:10px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(29,29,27,.09);color:var(--c-soft);font-size:12px;z-index:3;display:flex;gap:10px;align-items:baseline}' +
    '.cz-st b{color:var(--c-ink);font:600 13px Menlo,monospace}.cz-st i{font-style:normal;font-family:Menlo,monospace;white-space:nowrap;color:var(--c-ink)}' +
    '.cz-menu{position:absolute;top:58px;right:10px;z-index:4;flex-direction:column;align-items:stretch;padding:6px;min-width:190px}' +
    '.cz-menu button{text-align:left;padding:10px 12px;border-radius:8px}.cz-menu button:hover{background:rgba(29,29,27,.06)}.cz-menu small{display:block;color:var(--c-soft);font-size:11px}' +
    '.cz-dr{position:absolute;top:0;right:0;bottom:0;width:300px;background:#fff;border-left:1px solid var(--c-rule);box-shadow:-8px 0 30px rgba(29,29,27,.08);z-index:5;overflow:auto;transform:translateX(105%);transition:transform .22s ease;-webkit-user-select:text;user-select:text}' +
    '.cz-dr.open{transform:none}' +
    '.cz-dh{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 4px}.cz-dh b{font-size:15px;font-weight:600}.cz-dh button{font-size:13px;color:var(--c-soft);padding:6px}' +
    '.cz-box{padding:10px 16px 14px;border-bottom:1px solid var(--c-rule)}' +
    '.cz h4{margin:0 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--c-soft);font-weight:500}.cz h4 small{float:right;letter-spacing:0;text-transform:none;color:' + HI + '}' +
    '.cz-in{display:block;width:100%;font:inherit;font-size:15px;padding:9px 10px;border:1px solid var(--c-rule);border-radius:8px;background:#fff;margin:0 0 8px;color:inherit}' +
    '.cz-meta{color:var(--c-soft);font-size:12px;margin-bottom:4px}' +
    '.cz-seg{display:flex;border:1px solid var(--c-rule);border-radius:9px;overflow:hidden;margin-bottom:10px}.cz-seg button{flex:1;padding:9px 4px;font-size:12px;border-left:1px solid var(--c-rule)}.cz-seg button:first-child{border-left:0}.cz-seg button[aria-pressed="true"]{background:var(--c-ink);color:#fff}' +
    '.cz-sw{display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:13px}.cz-sw button{width:44px;height:26px;border-radius:13px;background:var(--c-rule);position:relative}.cz-sw button::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}.cz-sw button[aria-pressed="true"]{background:var(--c-ink)}.cz-sw button[aria-pressed="true"]::after{left:21px}' +
    '.cz-ly{display:flex;align-items:center;gap:6px;padding:3px 0}' +
    '.cz-ly input[type=color]{width:20px;height:20px;padding:0;border:0;background:none;flex:none;cursor:pointer}' +
    '.cz .cz-ly .n{flex:1;text-align:left;padding:6px 8px;border-radius:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cz .cz-ly.on .n{background:rgba(29,29,27,.07);font-weight:600}' +
    '.cz .cz-ly .ic{padding:6px;line-height:0;border-radius:7px}.cz-ly .ic.off{opacity:.3}.cz .cz-ly .mv{padding:4px 8px;font-size:11px;border:1px solid var(--c-rule);border-radius:7px}' +
    '.cz-dc{padding:9px 10px;border-radius:9px;cursor:pointer;margin-bottom:2px}.cz-dc:hover{background:rgba(29,29,27,.04)}.cz-dc.on{background:rgba(29,29,27,.07)}' +
    '.cz-dc b{display:block;font-weight:500;font-size:14px}.cz-dc small{color:var(--c-soft)}' +
    '.cz-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.cz .cz-add{font-size:13px;padding:8px 12px;border:1px solid var(--c-rule);border-radius:8px;background:#fff}.cz .cz-add.del{color:#9a2f1f}' +
    '.cz-ti{position:absolute;font:16px var(--fs,system-ui,sans-serif);padding:5px 8px;border:1px solid var(--c-ink);border-radius:6px;min-width:180px;z-index:6;background:#fff}' +
    '.cz-help{margin:10px 2px 0;font-size:12px;color:var(--c-soft);line-height:1.6}' +
    '.cz.full{position:fixed;inset:0;z-index:40;background:var(--c-paper)}.cz.full .cz-stage{height:100%;min-height:0;border:0;border-radius:0}.cz.full .cz-help{display:none}' +
    '@media (max-width:820px){.cz-tb{right:10px;max-width:calc(100% - 20px)}.cz-tr{top:auto;bottom:58px}.cz-menu{top:auto;bottom:108px}.cz-st{bottom:auto;top:auto;display:none}}';
  function ensureCss() { if (document.getElementById('cz-css')) return; var s = h('style', '', CSS); s.id = 'cz-css'; document.head.appendChild(s); }

  /* opts.store berilsa (sayt): hamma narsa MacBook'da, brauzerga hech narsa yozilmaydi. Berilmasa — shu brauzer xotirasi */
  function mount(root, opts) {
    opts = opts || {};
    var store = opts.store || null, docs = [], cur = null;
    if (store) { docs = opts.docs; cur = opts.cur; }
    else try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw && raw.docs && raw.docs.length) { docs = raw.docs; cur = docs.filter(function (d) { return d.id === raw.cur; })[0] || docs[0]; } } catch (e) { /* xotira yopiq — namuna bilan boshlanadi */ }
    if (!cur) { cur = blank('Yozuv · ' + today(), 'Yozuv', 'chiziq'); docs = store ? [cur] : [cur, demo()]; if (store) store.dirty(cur); }
    docs.forEach(function (d) { if (!d.paper) d.paper = 'katak'; });
    var st = { tool: 'pen', ink: INK[0], wid: 1, ortho: false, osnap: true, gsnap: true, finger: true, penSeen: false, penDown: false, z: 40, ox: 60, oy: 60, sel: [], pts: [], buf: '', m: null, w: null, k: '', msg: '', undo: [], redo: [], box: null, stroke: null, erase: null };

    var saveT = 0, msgT = 0;
    function flush() { if (store) return; clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify({ docs: docs, cur: cur.id })); } catch (e) { msg('Saqlab bo\'lmadi: brauzer xotirasi yopiq'); } }
    function save() { cur.updated = Date.now(); if (store) { store.dirty(cur); return; } clearTimeout(saveT); saveT = setTimeout(flush, 250); }
    if (!store) { window.addEventListener('pagehide', flush); document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); }); }
    function msg(t) { st.msg = t; status(); clearTimeout(msgT); msgT = setTimeout(function () { st.msg = ''; status(); }, 3500); }

    ensureCss();
    var wrap = h('div', 'cz'), stage = h('div', 'cz-stage'), cv = h('canvas'), tb = h('div', 'cz-fl cz-tb'), tr = h('div', 'cz-fl cz-tr'), zm = h('div', 'cz-fl cz-zm'), stl = h('div', 'cz-st'), menu = h('div', 'cz-fl cz-menu'), dr = h('div', 'cz-dr');
    var pInfo = h('div', 'cz-box'), pLay = h('div', 'cz-box'), pDocs = h('div', 'cz-box');
    wrap.tabIndex = 0; menu.style.display = 'none';
    [cv, tb, tr, zm, stl, menu, dr].forEach(function (x) { stage.appendChild(x); });
    var dh = h('div', 'cz-dh', '<b>Sahifa</b>'), dx = h('button', '', 'Yopish ✕'); dx.onclick = function () { drawer(false); }; dh.appendChild(dx);
    dr.appendChild(dh); dr.appendChild(pInfo); dr.appendChild(pDocs); dr.appendChild(pLay);
    wrap.appendChild(stage);
    wrap.appendChild(h('p', 'cz-help', 'iPad: Apple Pencil bilan yozasiz, barmoq bilan surasiz, ikki barmoq bilan yaqinlashtirasiz — qalam tekkan zahoti barmoq chizmaydigan bo\'ladi (kaftingiz ekranga tegsa ham iz qolmaydi). Aniq chizma uchun: L — chiziq, R — to\'rtburchak, C — aylana, D — o\'lcham; yo\'nalishni ko\'rsatib uzunlikni yozasiz va Enter. Katta ekran tugmasi — butun ekranda ishlash.'));
    root.appendChild(wrap);
    var ctx = cv.getContext('2d'), W = 1, H = 1, dpr = 1;

    function ib(parent, icon, title, fn, cls) { var b = h('button', cls || 'cz-b', icon); b.title = title; b.setAttribute('aria-label', title); b.onclick = function (e) { e.stopPropagation(); fn(b); wrap.focus({ preventScroll: true }); }; parent.appendChild(b); return b; }
    function sep(p) { var s = h('span', 'cz-sep'); p.appendChild(s); return s; }
    var TB = {}, TG = {}, inkBox = h('span', ''), layBox = h('span', '');
    inkBox.style.display = layBox.style.display = 'contents';
    FREE.forEach(function (t) { TB[t[0]] = ib(tb, IC[t[0]], t[1] + ' (' + t[2] + ')', function () { setTool(t[0]); }); });
    sep(tb); tb.appendChild(inkBox); tb.appendChild(layBox);
    var DOTS = INK.map(function (c) { var b = ib(inkBox, '<i style="background:' + c + '"></i>', 'Rang', function () { st.ink = c; syncInk(); }, 'cz-dot'); b.dataset.c = c; return b; });
    var WDOTS = WID.map(function (w, i) { var b = ib(inkBox, '<i style="height:' + Math.max(2, w[1] * 1.6) + 'px"></i>', 'Qalinlik: ' + w[0], function () { st.wid = i; syncInk(); }, 'cz-dot cz-wd'); return b; });
    var lsel = h('select', 'cz-lsel'); lsel.title = 'Qaysi qatlamga chiziladi'; lsel.onchange = function () { cur.active = lsel.value; save(); renderLay(); wrap.focus({ preventScroll: true }); }; layBox.appendChild(lsel);
    sep(tb);
    CAD.forEach(function (t) { TB[t[0]] = ib(tb, IC[t[0]], t[1] + ' (' + t[2] + ')', function () { setTool(t[0]); }); });
    sep(tb);
    TG.ortho = ib(tb, IC.ortho, 'Orto — faqat tik va yotiq chiziq (F8)', function () { toggle('ortho', 'Orto'); });
    TG.osnap = ib(tb, IC.osnap, 'Yopishish — chiziq uchi, o\'rtasi, markaziga o\'zi tushadi (F3)', function () { toggle('osnap', 'Yopishish'); });
    sep(tb); ib(tb, IC.undo, 'Orqaga (⌘Z)', function () { undoF(); }); ib(tb, IC.redo, 'Oldinga (⇧⌘Z)', function () { redoF(); });
    if (store && store.badge) tr.appendChild(store.badge);
    ib(tr, IC.pages, 'Sahifalar va qatlamlar', function () { drawer(!dr.classList.contains('open')); });
    ib(tr, IC.share, 'Chiqarish: PDF yoki DXF', function () { menu.style.display = menu.style.display === 'none' ? 'flex' : 'none'; });
    var fb = ib(tr, IC.full, 'Katta ekran', function () { fullF(); });
    if (opts.full) { wrap.classList.add('full'); fb.style.display = 'none'; }
    [['PDF', 'chop etish yoki saqlash', exportPDF], ['DXF', 'AutoCAD\'da ochish uchun', exportDXF]].forEach(function (x) { var b = h('button', '', x[0] + '<small>' + x[1] + '</small>'); b.onclick = function () { menu.style.display = 'none'; x[2](); }; menu.appendChild(b); });
    ib(zm, '<span style="font-size:20px">−</span>', 'Uzoqlashtirish', function () { zoomAt([W / 2, H / 2], 1 / 1.4); });
    var pct = h('button', 'pct', '100%'); pct.title = '100% ga qaytarish'; pct.onclick = function () { zoomAt([W / 2, H / 2], 40 / st.z); }; zm.appendChild(pct);
    ib(zm, '<span style="font-size:20px">+</span>', 'Yaqinlashtirish', function () { zoomAt([W / 2, H / 2], 1.4); });
    ib(zm, IC.fit, 'Hammasini ko\'rsatish (F)', function () { fitF(); });

    function syncInk() {
      DOTS.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === st.ink)); });
      WDOTS.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === st.wid)); b.querySelector('i').style.background = st.ink; });
    }
    function drawer(on) { dr.classList.toggle('open', on); menu.style.display = 'none'; }
    stage.addEventListener('pointerdown', function (e) { if (menu.style.display !== 'none' && !menu.contains(e.target) && !tr.contains(e.target)) menu.style.display = 'none'; }, true);

    function lay(id) { for (var i = 0; i < cur.layers.length; i++) if (cur.layers[i].id === id) return cur.layers[i]; return null; }
    function vis(s) { var l = lay(s.l); return !!(l && l.on); }
    function editable(s) { var l = lay(s.l); return !!(l && l.on && !l.lock); }
    function isSel(s) { return st.sel.indexOf(s.id) >= 0; }
    function P(p) { return [p[0] * st.z + st.ox, p[1] * st.z + st.oy]; }
    function wx(x) { return (x - st.ox) / st.z; }
    function wy(y) { return (y - st.oy) / st.z; }
    function minor() { return STEPS.filter(function (s) { return s * st.z >= 12; })[0] || 500; }
    function base() { return st.pts.length ? st.pts[st.pts.length - 1] : null; }
    function clampZ(z) { return Math.max(2, Math.min(4000, z)); }
    function isFree(t) { return t === 'pen' || t === 'mark' || t === 'erase'; }

    /* --- yopishish: tugun > orto > to'r --- */
    function snapPt(m, b, skipSel) {
      var w = [wx(m[0]), wy(m[1])];
      if (st.osnap) {
        var best = null, bd = 10;
        function look(k) { var q = P(k[0]), d = Math.hypot(q[0] - m[0], q[1] - m[1]); if (d < bd) { bd = d; best = k; } }
        cur.shapes.forEach(function (s) { if (vis(s) && !(skipSel && isSel(s))) keys(s).forEach(look); });
        st.pts.forEach(function (p) { look([p, 'end']); });
        if (best) return { w: best[0].slice(), k: best[1] };
      }
      var g = minor();
      if (b) {
        var dx = w[0] - b[0], dy = w[1] - b[1];
        if (st.ortho) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
        if (st.gsnap) { dx = Math.round(dx / g) * g; dy = Math.round(dy / g) * g; }
        w = [r3(b[0] + dx), r3(b[1] + dy)];
      } else if (st.gsnap) w = [r3(Math.round(w[0] / g) * g), r3(Math.round(w[1] / g) * g)];
      return { w: w, k: '' };
    }
    function near(s, w, tol) {
      if (s.t === 'circle') return Math.abs(dist(w, s.p[0]) - s.r) < tol;
      if (s.t === 'text') { var q = bbOf(s); return w[0] >= q[0] - tol && w[0] <= q[2] + tol && w[1] >= q[1] - tol && w[1] <= q[3] + tol; }
      var b = bbOf(s); if (w[0] < b[0] - tol || w[0] > b[2] + tol || w[1] < b[1] - tol || w[1] > b[3] + tol) return false;
      var extra = (s.t === 'pen' || s.t === 'mark') ? (s.w || 0.04) / 2 : 0, g = segsOf(s);
      if (g.length === 0 && s.p.length) return dist(w, s.p[0]) < tol + extra;
      for (var i = 0; i < g.length; i++) if (segDist(w, g[i][0], g[i][1]) < tol + extra) return true;
      return false;
    }
    function hit(m) { var w = [wx(m[0]), wy(m[1])], tol = 8 / st.z; for (var i = cur.shapes.length - 1; i >= 0; i--) { var s = cur.shapes[i]; if (editable(s) && near(s, w, tol)) return s; } return null; }

    /* --- chizish --- */
    var raf = 0;
    function req() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
    function resize() { dpr = window.devicePixelRatio || 1; W = Math.max(1, cv.clientWidth); H = Math.max(1, cv.clientHeight); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); draw(); }
    function lines(step, col, vert, horiz) {
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.beginPath();
      if (vert) for (var x = Math.floor(wx(0) / step) * step; P([x, 0])[0] <= W; x += step) { var X = Math.round(P([x, 0])[0]) + 0.5; ctx.moveTo(X, 0); ctx.lineTo(X, H); }
      if (horiz) for (var y = Math.floor(wy(0) / step) * step; P([0, y])[1] <= H; y += step) { var Y = Math.round(P([0, y])[1]) + 0.5; ctx.moveTo(0, Y); ctx.lineTo(W, Y); }
      ctx.stroke();
    }
    function paper() {
      var t = cur.paper;
      if (t === 'katak') { var mi = minor(), ma = STEPS.filter(function (s) { return s > mi && s * st.z >= 60; })[0] || mi * 10; lines(mi, '#f1eee6', true, true); lines(ma, '#e2ddd0', true, true); }
      else if (t === 'chiziq') { var sp = 0.8; while (sp * st.z < 10) sp *= 2; lines(sp, '#dde5ee', false, true); var mx = Math.round(P([1.6, 0])[0]) + 0.5; if (mx > 0 && mx < W) { ctx.strokeStyle = '#f0c6bc'; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke(); } }
      else if (t === 'nuqta') { var s = 0.5; while (s * st.z < 16) s *= 2; while (s * st.z > 64) s /= 2; ctx.fillStyle = '#cbc6b8'; for (var x = Math.floor(wx(0) / s) * s; P([x, 0])[0] <= W; x += s) for (var y = Math.floor(wy(0) / s) * s; P([0, y])[1] <= H; y += s) { var q = P([x, y]); ctx.fillRect(q[0] - 1, q[1] - 1, 2, 2); } }
    }
    function inView(s) { var b = bbOf(s), a = P([b[0], b[1]]), c = P([b[2], b[3]]); return c[0] >= -20 && a[0] <= W + 20 && c[1] >= -20 && a[1] <= H + 20; }
    function inkStroke(s, col) {
      var p = s.p; if (!p.length) return;
      ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
      if (p.length === 1) { var q = P(p[0]); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(0.6, penW(s, p[0]) * st.z / 2), 0, Math.PI * 2); ctx.fill(); return; }
      /* bir xil qalinlikdagi bo'laklar bitta yo'l bo'lib chiziladi — iPad'da ham tez */
      var bucket = -1, a = P(p[0]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      for (var i = 1; i < p.length; i++) {
        var w = Math.max(0.6, (penW(s, p[i - 1]) + penW(s, p[i])) / 2 * st.z), bk = Math.round(w * 4);
        if (bk !== bucket && bucket >= 0) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(a[0], a[1]); }
        bucket = bk; ctx.lineWidth = w; a = P(p[i]); ctx.lineTo(a[0], a[1]);
      }
      ctx.stroke();
    }
    function paint(s, col, hi, dash) {
      var a, b;
      if (s.t === 'pen') { inkStroke(s, hi ? HI : (s.c || col)); return; }
      if (s.t === 'mark') { ctx.save(); ctx.globalAlpha = hi ? 0.6 : 0.32; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = hi ? HI : (s.c || col); ctx.lineWidth = Math.max(2, s.w * st.z); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]); ctx.beginPath(); s.p.forEach(function (p, i) { var q = P(p); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.restore(); return; }
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = hi ? 2.5 : 1.5; ctx.setLineDash(dash || []); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s.t === 'line') { a = P(s.p[0]); b = P(s.p[1]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      else if (s.t === 'rect') { a = P(s.p[0]); b = P(s.p[1]); ctx.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      else if (s.t === 'circle') { a = P(s.p[0]); ctx.beginPath(); ctx.arc(a[0], a[1], s.r * st.z, 0, Math.PI * 2); ctx.stroke(); }
      else if (s.t === 'text') { a = P(s.p[0]); ctx.font = Math.max(9, s.h * st.z) + 'px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s.s, a[0], a[1]); }
      else if (s.t === 'dim') {
        var g = dimGeo(s), tx = dimText(g); ctx.lineWidth = hi ? 2 : 1; ctx.beginPath();
        dimSegs(g).forEach(function (q) { var p0 = P(q[0]), p1 = P(q[1]); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); }); ctx.stroke();
        a = P(tx.c); ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(tx.ang * Math.PI / 180); ctx.font = Math.max(9, DIM_H * st.z) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tx.s, 0, 0); ctx.restore();
      }
    }
    function label(t) { if (!st.m) return; ctx.setLineDash([]); ctx.font = '12px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; var x = st.m[0] + 14, y = st.m[1] - 10, w = ctx.measureText(t).width; ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(x - 4, y - 16, w + 8, 19); ctx.fillStyle = '#1d1d1b'; ctx.fillText(t, x, y); }
    function preview() {
      var L = lay(cur.active), c = L ? L.color : '#1d1d1b', w = st.w, b = st.pts[0], D = [6, 4];
      if (st.stroke) { paint(st.stroke, c); return; }
      if (!w || !b) return;
      ctx.save(); ctx.globalAlpha = 0.75;
      if (st.tool === 'line') { paint({ t: 'line', p: [b, w] }, c, false, D); ctx.restore(); return label(fmt(dist(b, w)) + ' m'); }
      if (st.tool === 'rect') { paint({ t: 'rect', p: [b, w] }, c, false, D); ctx.restore(); return label(fmt(Math.abs(w[0] - b[0])) + ' × ' + fmt(Math.abs(w[1] - b[1])) + ' m'); }
      if (st.tool === 'circle') { paint({ t: 'circle', p: [b], r: dist(b, w) }, c, false, D); ctx.restore(); return label('r ' + fmt(dist(b, w)) + ' m'); }
      if (st.tool === 'dim') { if (st.pts.length === 1) paint({ t: 'line', p: [b, w] }, c, false, D); else if (dist(st.pts[0], st.pts[1]) > 1e-6) paint({ t: 'dim', p: [st.pts[0], st.pts[1], w] }, c, false, D); }
      ctx.restore();
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#fffefa'; ctx.fillRect(0, 0, W, H);
      paper();
      cur.shapes.forEach(function (s) { var l = lay(s.l); if (l && l.on && inView(s)) paint(s, isSel(s) ? HI : l.color, isSel(s)); });
      preview();
      if (st.box) { var a = st.box.a, b = st.box.b; ctx.setLineDash([4, 3]); ctx.strokeStyle = HI; ctx.lineWidth = 1; ctx.fillStyle = 'rgba(217,130,43,.08)'; ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); ctx.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      if (st.tool === 'erase' && st.m) { ctx.setLineDash([]); ctx.strokeStyle = 'rgba(29,29,27,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(st.m[0], st.m[1], 10, 0, Math.PI * 2); ctx.stroke(); }
      if (st.w && !isFree(st.tool) && st.tool !== 'sel') {
        var q = P(st.w); ctx.setLineDash([]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#2f6b3f'; ctx.beginPath();
        if (st.k === 'end') ctx.rect(q[0] - 5, q[1] - 5, 10, 10);
        else if (st.k === 'mid') { ctx.moveTo(q[0], q[1] - 6); ctx.lineTo(q[0] + 6, q[1] + 5); ctx.lineTo(q[0] - 6, q[1] + 5); ctx.closePath(); }
        else if (st.k === 'cen') ctx.arc(q[0], q[1], 6, 0, Math.PI * 2);
        else { ctx.strokeStyle = 'rgba(29,29,27,.5)'; ctx.lineWidth = 1; ctx.moveTo(q[0] - 8, q[1]); ctx.lineTo(q[0] + 8, q[1]); ctx.moveTo(q[0], q[1] - 8); ctx.lineTo(q[0], q[1] + 8); }
        ctx.stroke();
      }
      pct.textContent = Math.round(st.z / 40 * 100) + '%';
    }
    function status() {
      var r = '', b = base();
      if (st.w && !isFree(st.tool)) r = 'x ' + fmt(st.w[0]) + '  y ' + fmt(-st.w[1]);
      if (b && st.w && !isFree(st.tool) && st.tool !== 'sel') { r += ' · ' + fmt(dist(b, st.w)) + ' m'; if (st.tool === 'line') r += ' · ' + Math.round((Math.atan2(b[1] - st.w[1], st.w[0] - b[0]) * 180 / Math.PI + 360) % 360) + '°'; }
      stl.innerHTML = '<span>' + esc(st.msg || HINT[st.tool]) + '</span>' + (st.buf ? '<b>› ' + esc(st.buf) + '</b>' : '') + (r ? '<i>' + r + '</i>' : '');
    }

    /* --- o'zgartirish va orqaga --- */
    function act(fn) { st.undo.push(JSON.stringify(cur.shapes)); if (st.undo.length > 100) st.undo.shift(); st.redo = []; fn(); changed(); }
    function changed() { save(); meta(); renderDocs(); req(); }
    function addS(t, p, x) {
      var L = lay(cur.active);
      if (!L.on || L.lock) { msg('«' + L.name + '» qatlami ' + (L.lock ? 'qulflangan' : 'yashirin') + ' — boshqa qatlamni tanlang'); return false; }
      act(function () { var s = { id: uid(), t: t, l: L.id, p: p }; for (var k in x || {}) s[k] = x[k]; cur.shapes.push(s); });
      return true;
    }
    function undoF() { if (!st.undo.length) return msg('Orqaga qaytadigan narsa yo\'q'); st.redo.push(JSON.stringify(cur.shapes)); cur.shapes = JSON.parse(st.undo.pop()); st.sel = []; renderLay(); changed(); }
    function redoF() { if (!st.redo.length) return msg('Oldinga qaytadigan narsa yo\'q'); st.undo.push(JSON.stringify(cur.shapes)); cur.shapes = JSON.parse(st.redo.pop()); st.sel = []; renderLay(); changed(); }
    function delSel() { if (!st.sel.length) return; act(function () { cur.shapes = cur.shapes.filter(function (s) { return !isSel(s); }); }); st.sel = []; renderLay(); }

    function setTool(t) {
      st.tool = t; st.pts = []; st.buf = ''; if (t !== 'sel') st.sel = [];
      Object.keys(TB).forEach(function (k) { TB[k].setAttribute('aria-pressed', String(k === t)); });
      var free = t === 'pen' || t === 'mark'; inkBox.style.display = free ? 'contents' : 'none'; layBox.style.display = free ? 'none' : 'contents';
      cv.style.cursor = t === 'sel' ? 'default' : t === 'erase' ? 'none' : 'crosshair';
      renderLay(); status(); req();
    }
    function toggle(k, name) { st[k] = !st[k]; if (TG[k]) TG[k].setAttribute('aria-pressed', String(st[k])); msg(name + (st[k] ? ' yoqildi' : ' o\'chirildi')); }
    function finish() { st.pts = []; st.buf = ''; status(); req(); }
    function zoomAt(m, f) { var nz = clampZ(st.z * f); st.ox = m[0] - (m[0] - st.ox) / st.z * nz; st.oy = m[1] - (m[1] - st.oy) / st.z * nz; st.z = nz; req(); }
    function fitF() {
      var bb = bboxAll(cur.shapes.filter(vis));
      if (!bb) { st.z = 40; st.ox = 40; st.oy = 80; }
      else { st.z = clampZ(Math.min((W - 120) / Math.max(bb[2] - bb[0], 1), (H - 160) / Math.max(bb[3] - bb[1], 1))); st.ox = (W - (bb[0] + bb[2]) * st.z) / 2; st.oy = (H - (bb[1] + bb[3]) * st.z) / 2; }
      req();
    }
    function fullF() { var on = !wrap.classList.contains('full'); wrap.classList.toggle('full', on); document.documentElement.style.overflow = on ? 'hidden' : ''; fb.innerHTML = on ? IC.small : IC.full; fb.title = on ? 'Kichik ekran' : 'Katta ekran'; setTimeout(function () { resize(); fitF(); }, 0); }

    function click(w) {
      var t = st.tool, b = st.pts[0];
      if (t === 'line') { if (b && dist(b, w) > 1e-6) addS('line', [b, w]); st.pts = [w]; }
      else if (t === 'rect') { if (!b) st.pts = [w]; else { if (Math.abs(w[0] - b[0]) > 1e-6 && Math.abs(w[1] - b[1]) > 1e-6) addS('rect', [[Math.min(b[0], w[0]), Math.min(b[1], w[1])], [Math.max(b[0], w[0]), Math.max(b[1], w[1])]]); st.pts = []; } }
      else if (t === 'circle') { if (!b) st.pts = [w]; else { var r = dist(b, w); if (r > 1e-6) addS('circle', [b], { r: r3(r) }); st.pts = []; } }
      else if (t === 'dim') { st.pts.push(w); if (st.pts.length === 3) { if (dist(st.pts[0], st.pts[1]) > 1e-6) addS('dim', st.pts.slice()); st.pts = []; } }
      status(); req();
    }
    /* AutoCAD kabi: yo'nalishni ko'rsatib, uzunlikni yozasiz */
    function applyBuf() {
      var t = st.tool, b = st.pts[0], s = st.buf.trim(); st.buf = '';
      if (!b) return msg(t === 'circle' ? 'Avval markazni bosing' : 'Avval birinchi nuqtani bosing');
      var w = st.w || [b[0] + 1, b[1]], dx = w[0] - b[0], dy = w[1] - b[1], L;
      if (t === 'line') {
        L = num(s); if (!(L > 0)) return msg('Uzunlik noto\'g\'ri: ' + s);
        var d = Math.hypot(dx, dy); if (d < 1e-9) { dx = 1; dy = 0; d = 1; }
        click([r3(b[0] + dx / d * L), r3(b[1] + dy / d * L)]);
      } else if (t === 'rect') {
        var q = s.split(/[x×*]/i), a = num(q[0]), c = q.length > 1 ? num(q[1]) : a;
        if (!(a > 0) || !(c > 0)) return msg('O\'lcham noto\'g\'ri: ' + s + ' — masalan 8x5');
        click([r3(b[0] + (dx < 0 ? -a : a)), r3(b[1] + (dy < 0 ? -c : c))]);
      } else if (t === 'circle') {
        L = num(s); if (!(L > 0)) return msg('Radius noto\'g\'ri: ' + s);
        click([r3(b[0] + L), b[1]]);
      }
    }
    function askText(w, s) {
      var L = lay(cur.active);
      if (!s && (!L.on || L.lock)) return msg('«' + L.name + '» qatlami ' + (L.lock ? 'qulflangan' : 'yashirin') + ' — boshqa qatlamni tanlang');
      var q = P(w), i = h('input', 'cz-ti'), done = false; i.value = s ? s.s : ''; i.placeholder = 'Matn…'; i.style.left = Math.min(q[0], W - 200) + 'px'; i.style.top = Math.max(0, q[1] - 30) + 'px';
      stage.appendChild(i); i.focus(); i.select(); setTimeout(function () { if (!done && document.activeElement !== i) i.focus(); }, 0);
      function fin(ok) {
        if (done) return; done = true; var v = i.value.trim(); i.remove();
        if (ok && v) { if (s) act(function () { cur.shapes.forEach(function (x) { if (x.id === s.id) x.s = v; }); }); else addS('text', [w], { s: v, h: 0.3 }); }
        wrap.focus({ preventScroll: true });
      }
      i.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Enter') fin(true); else if (e.key === 'Escape') fin(false); };
      i.onblur = function () { fin(true); };
    }
    function eraseAt(m) {
      /* qalam tez yurganda ikki nuqta orasi ham tekshiriladi */
      var l = st.erase.last || m, n = Math.max(1, Math.ceil(dist(l, m) / 5)), tol = 10 / st.z, gone = [], i, w;
      st.erase.last = m;
      for (i = 1; i <= n; i++) { w = [wx(l[0] + (m[0] - l[0]) * i / n), wy(l[1] + (m[1] - l[1]) * i / n)]; cur.shapes.forEach(function (s) { if (gone.indexOf(s) < 0 && editable(s) && near(s, w, tol)) gone.push(s); }); }
      if (!gone.length) return;
      if (!st.erase.any) { st.undo.push(st.erase.orig); if (st.undo.length > 100) st.undo.shift(); st.redo = []; st.erase.any = true; }
      cur.shapes = cur.shapes.filter(function (s) { return gone.indexOf(s) < 0; });
    }

    /* --- qalam, barmoq, sichqoncha, trackpad --- */
    var touch = {}, pinch = null, pan = null, drag = null, pend = null;
    function mpos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function pressure(e) { return e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5; }
    function inkPt(e) { var m = mpos(e), base = WID[st.wid][1] / st.z, f = e.pointerType === 'pen' ? 0.35 + 1.1 * pressure(e) : 1; return [r3(wx(m[0])), r3(wy(m[1])), Math.round(base * f * 10000) / 10000]; }
    function startPinch() { var ids = Object.keys(touch), a = touch[ids[0]], b = touch[ids[1]]; pinch = { d: dist(a, b) || 1, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], z: st.z, ox: st.ox, oy: st.oy }; }
    function cancelGesture() { st.stroke = null; st.box = null; pend = null; if (drag && drag.moved) { cur.shapes = JSON.parse(drag.orig); st.undo.pop(); } drag = null; if (st.erase && st.erase.any) { cur.shapes = JSON.parse(st.erase.orig); st.undo.pop(); } st.erase = null; req(); }
    cv.addEventListener('pointerdown', function (e) {
      wrap.focus({ preventScroll: true }); e.preventDefault();
      var m = mpos(e), type = e.pointerType;
      if (type === 'pen') { if (!st.penSeen) { st.penSeen = true; st.finger = false; renderInfo(); msg('Qalam topildi — endi barmoq faqat suradi va yaqinlashtiradi'); } st.penDown = true; pan = null; pinch = null; touch = {}; }
      if (type === 'touch') {
        if (st.penDown) return; /* yozayotganda kaft tegsa — e'tibor berilmaydi */
        touch[e.pointerId] = m;
        var n = Object.keys(touch).length;
        if (n >= 2) { cancelGesture(); pan = null; startPinch(); return; }
        if (!st.finger) { pan = { m: m, ox: st.ox, oy: st.oy }; return; }
      }
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* eski brauzer */ }
      if (e.button === 1) { pan = { m: m, ox: st.ox, oy: st.oy }; return; }
      if (e.button === 2) { finish(); return; }
      st.m = m;
      var t = st.tool;
      if (t === 'pen' || t === 'mark') {
        var L = lay(cur.active); if (!L.on || L.lock) return msg('«' + L.name + '» qatlami ' + (L.lock ? 'qulflangan' : 'yashirin') + ' — boshqa qatlamni tanlang');
        var q = inkPt(e); st.stroke = t === 'pen' ? { t: 'pen', p: [q], c: st.ink } : { t: 'mark', p: [[q[0], q[1]]], c: st.ink, w: Math.round(WID[st.wid][1] * 5 / st.z * 1000) / 1000 }; req(); return;
      }
      if (t === 'erase') { st.erase = { orig: JSON.stringify(cur.shapes), any: false }; eraseAt(m); req(); return; }
      if (t === 'sel') {
        var s = hit(m); st.w = [wx(m[0]), wy(m[1])];
        if (s) { if (e.shiftKey) st.sel = isSel(s) ? st.sel.filter(function (id) { return id !== s.id; }) : st.sel.concat(s.id); else if (!isSel(s)) st.sel = [s.id]; drag = { from: snapPt(m, null, true).w, orig: JSON.stringify(cur.shapes), moved: false }; }
        else { if (!e.shiftKey) st.sel = []; st.box = { a: m, b: m }; }
        renderLay(); req(); return;
      }
      var sp = snapPt(m, base()); st.w = sp.w; st.k = sp.k;
      if (t === 'text') { askText(sp.w); return; }
      st.buf = '';
      if (type === 'touch') pend = sp.w; else click(sp.w);
    });
    cv.addEventListener('pointermove', function (e) {
      var m = mpos(e), sp, type = e.pointerType;
      if (type === 'touch') {
        if (!touch[e.pointerId]) return;
        touch[e.pointerId] = m;
        if (pinch) { var ids = Object.keys(touch); if (ids.length < 2) return; var a = touch[ids[0]], b = touch[ids[1]], c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], nz = clampZ(pinch.z * dist(a, b) / pinch.d); st.ox = c[0] - (pinch.c[0] - pinch.ox) / pinch.z * nz; st.oy = c[1] - (pinch.c[1] - pinch.oy) / pinch.z * nz; st.z = nz; req(); return; }
      }
      if (pan) { st.ox = pan.ox + m[0] - pan.m[0]; st.oy = pan.oy + m[1] - pan.m[1]; req(); return; }
      st.m = m;
      if (st.stroke) {
        var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
        evs.forEach(function (ev) { var q = inkPt(ev), l = st.stroke.p[st.stroke.p.length - 1]; if (dist(q, l) * st.z > 1.2) st.stroke.p.push(st.stroke.t === 'pen' ? q : [q[0], q[1]]); });
        req(); return;
      }
      if (st.erase) { eraseAt(m); req(); return; }
      if (st.box) { st.box.b = m; req(); return; }
      if (drag) {
        sp = snapPt(m, drag.from, true); st.w = sp.w; st.k = sp.k;
        var dx = sp.w[0] - drag.from[0], dy = sp.w[1] - drag.from[1];
        if (dx || dy || drag.moved) {
          if (!drag.moved) { st.undo.push(drag.orig); st.redo = []; drag.moved = true; }
          cur.shapes = JSON.parse(drag.orig).map(function (s) { if (isSel(s)) s.p = s.p.map(function (p) { var r = [r3(p[0] + dx), r3(p[1] + dy)]; if (p.length > 2) r.push(p[2]); return r; }); return s; });
        }
      } else if (st.tool === 'sel' || isFree(st.tool)) { st.w = [wx(m[0]), wy(m[1])]; st.k = ''; }
      else { sp = snapPt(m, base()); st.w = sp.w; st.k = sp.k; }
      status(); req();
    });
    function up(e) {
      if (e.pointerType === 'pen') st.penDown = false;
      if (e.pointerType === 'touch') { if (!touch[e.pointerId]) return; delete touch[e.pointerId]; if (pinch) { if (Object.keys(touch).length < 2) { pinch = null; var rest = Object.keys(touch); pan = rest.length && !st.finger ? { m: touch[rest[0]], ox: st.ox, oy: st.oy } : null; } return; } }
      if (pan) { pan = null; return; }
      if (pend) { var w = pend; pend = null; click(w); }
      if (st.stroke) { var s = st.stroke; st.stroke = null; addS(s.t, s.p, s.t === 'pen' ? { c: s.c } : { c: s.c, w: s.w }); req(); }
      if (st.erase) { var any = st.erase.any; st.erase = null; if (any) changed(); }
      if (st.box) {
        var a = st.box.a, b = st.box.b; st.box = null;
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 4) {
          var x1 = wx(Math.min(a[0], b[0])), x2 = wx(Math.max(a[0], b[0])), y1 = wy(Math.min(a[1], b[1])), y2 = wy(Math.max(a[1], b[1]));
          cur.shapes.forEach(function (s) { if (!editable(s) || isSel(s)) return; var q = bbOf(s); if (q[0] >= x1 && q[2] <= x2 && q[1] >= y1 && q[3] <= y2) st.sel.push(s.id); });
        }
        renderLay(); req();
      }
      if (drag) { if (drag.moved) changed(); drag = null; }
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !drag && !st.stroke && !st.box && !pan && !st.erase) { st.m = null; st.w = null; status(); req(); } });
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    cv.addEventListener('dblclick', function (e) { if (st.tool !== 'sel') return; var s = hit(mpos(e)); if (s && s.t === 'text') askText(s.p[0], s); });
    /* iPad Safari'da sahifa o'zi kattalashib ketmasin */
    ['gesturestart', 'gesturechange'].forEach(function (n) { stage.addEventListener(n, function (e) { e.preventDefault(); }); });
    /* sahifa aylanishiga xalaqit bermaydi: chizma bosilgandan keyingina trackpad chizmani suradi */
    cv.addEventListener('wheel', function (e) {
      if (!wrap.contains(document.activeElement) && !wrap.classList.contains('full')) return;
      e.preventDefault(); var m = mpos(e);
      if (e.ctrlKey || e.metaKey) zoomAt(m, Math.exp(-e.deltaY * 0.01)); else { st.ox -= e.deltaX; st.oy -= e.deltaY; req(); }
    }, { passive: false });

    wrap.addEventListener('keydown', function (e) {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      e.stopPropagation(); /* sahifadagi 1–8 tugmalari chizma ichida ishlamasin — raqam uzunlik uchun */
      var k = e.key, mod = e.metaKey || e.ctrlKey, low = k.toLowerCase();
      if (mod && low === 'z') { e.preventDefault(); if (e.shiftKey) redoF(); else undoF(); return; }
      if (mod && low === 'y') { e.preventDefault(); redoF(); return; }
      if (mod && low === 'a') { e.preventDefault(); setTool('sel'); st.sel = cur.shapes.filter(editable).map(function (s) { return s.id; }); renderLay(); req(); return; }
      if (mod) return;
      if (k === 'F8') { e.preventDefault(); toggle('ortho', 'Orto'); return; }
      if (k === 'F3') { e.preventDefault(); toggle('osnap', 'Yopishish'); return; }
      if (k === 'F9') { e.preventDefault(); toggle('gsnap', 'To\'r'); return; }
      if (k === 'Escape') { if (st.buf) st.buf = ''; else if (st.pts.length) st.pts = []; else if (st.sel.length) { st.sel = []; renderLay(); } else if (dr.classList.contains('open')) drawer(false); else if (wrap.classList.contains('full')) fullF(); status(); req(); return; }
      if (/^[0-9.,x×*-]$/i.test(k) && /line|rect|circle/.test(st.tool)) { e.preventDefault(); st.buf += k; status(); return; }
      if (k === 'Backspace' && st.buf) { e.preventDefault(); st.buf = st.buf.slice(0, -1); status(); return; }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); if (st.buf) applyBuf(); else finish(); return; }
      if ((k === 'Delete' || k === 'Backspace') && st.sel.length) { e.preventDefault(); delSel(); return; }
      if (low === 'f') { e.preventDefault(); fitF(); return; }
      var t = FREE.concat(CAD).filter(function (x) { return x[2].toLowerCase() === low; })[0];
      if (t) { e.preventDefault(); setTool(t[0]); }
    });

    /* --- yon panel: sahifa, ro'yxat, qatlamlar --- */
    var metaEl = null;
    function meta() { if (metaEl) metaEl.textContent = cur.shapes.length + ' ta chiziq · saqlandi ' + when(cur.updated); }
    function renderInfo() {
      pInfo.innerHTML = '';
      var nm = h('input', 'cz-in'); nm.value = cur.name; nm.placeholder = 'Sahifa nomi';
      nm.onchange = function () { cur.name = nm.value.trim() || 'Nomsiz sahifa'; nm.value = cur.name; changed(); };
      pInfo.appendChild(nm);
      var ps = h('select', 'cz-in'), all = PROJ.slice();
      docs.forEach(function (d) { if (all.indexOf(d.project) < 0) all.push(d.project); });
      all.forEach(function (p) { var o = h('option', '', esc(p === 'Yozuv' ? 'Yozuv (loyihasiz)' : p)); o.value = p; o.selected = p === cur.project; ps.appendChild(o); });
      var no = h('option', '', 'Yangi loyiha…'); no.value = '+'; ps.appendChild(no);
      ps.onchange = function () { var v = ps.value; if (v === '+') { v = (prompt('Loyiha nomi') || '').trim(); if (!v) { ps.value = cur.project; return; } } cur.project = v; changed(); renderInfo(); };
      pInfo.appendChild(h('div', 'cz-meta', 'Qayerga tegishli')); pInfo.appendChild(ps);
      pInfo.appendChild(h('div', 'cz-meta', 'Qog\'oz'));
      var seg = h('div', 'cz-seg');
      PAPER.forEach(function (p) { var b = h('button', '', p[1]); b.setAttribute('aria-pressed', String(cur.paper === p[0])); b.onclick = function () { cur.paper = p[0]; save(); renderInfo(); req(); }; seg.appendChild(b); });
      pInfo.appendChild(seg);
      var sw = h('div', 'cz-sw', '<span>Barmoq bilan ham chizish</span>'), sb = h('button'); sb.setAttribute('aria-pressed', String(st.finger)); sb.title = 'O\'chiq bo\'lsa barmoq faqat suradi — qalam bilan yozganda kaft iz qoldirmaydi';
      sb.onclick = function () { st.finger = !st.finger; renderInfo(); }; sw.appendChild(sb); pInfo.appendChild(sw);
      metaEl = h('div', 'cz-meta'); pInfo.appendChild(metaEl); meta();
    }
    function renderLay() {
      lsel.innerHTML = ''; cur.layers.forEach(function (l) { var o = h('option', '', esc(l.name)); o.value = l.id; o.selected = l.id === cur.active; lsel.appendChild(o); });
      pLay.innerHTML = ''; pLay.appendChild(h('h4', '', 'Qatlamlar' + (st.sel.length ? '<small>' + st.sel.length + ' ta tanlandi</small>' : '')));
      cur.layers.forEach(function (l) {
        var r = h('div', 'cz-ly' + (l.id === cur.active ? ' on' : '')), c = h('input'), n = h('button', 'n', esc(l.name)), eye = h('button', 'ic' + (l.on ? '' : ' off'), IC.eye), lk = h('button', 'ic' + (l.lock ? '' : ' off'), IC.lock);
        c.type = 'color'; c.value = l.color; c.title = 'Rang'; c.oninput = function () { l.color = c.value; save(); req(); };
        n.title = 'Shu qatlamga chizish (ikki marta bosing — nomini o\'zgartirish)';
        n.onclick = function () { cur.active = l.id; save(); renderLay(); };
        n.ondblclick = function () { var v = (prompt('Qatlam nomi', l.name) || '').trim(); if (v) { l.name = v; save(); renderLay(); } };
        function prune() { st.sel = st.sel.filter(function (id) { return cur.shapes.some(function (s) { return s.id === id && editable(s); }); }); }
        eye.title = l.on ? 'Yashirish' : 'Ko\'rsatish'; eye.onclick = function () { l.on = !l.on; prune(); save(); renderLay(); req(); };
        lk.title = l.lock ? 'Qulfni ochish' : 'Qulflash — tanlab ham, o\'chirib ham bo\'lmaydi'; lk.onclick = function () { l.lock = !l.lock; prune(); save(); renderLay(); req(); };
        r.appendChild(c); r.appendChild(n); r.appendChild(eye); r.appendChild(lk);
        if (st.sel.length) { var mv = h('button', 'mv', '← shu'); mv.title = 'Tanlanganlarni shu qatlamga o\'tkazish'; mv.onclick = function () { act(function () { cur.shapes.forEach(function (s) { if (isSel(s)) s.l = l.id; }); }); renderLay(); }; r.appendChild(mv); }
        pLay.appendChild(r);
      });
      var add = h('button', 'cz-add', '+ Qatlam');
      add.onclick = function () { var v = (prompt('Yangi qatlam nomi') || '').trim(); if (!v) return; var L = layer(v, EXTRA[cur.layers.length % EXTRA.length]); cur.layers.push(L); cur.active = L.id; save(); renderLay(); };
      var row = h('div', 'cz-row'); row.appendChild(add); pLay.appendChild(row);
    }
    function useDoc(d) {
      if (store && !d.shapes) { msg('Ochilmoqda…'); store.open(d).then(function () { useDoc(d); }, function (e) { msg('Ochib bo\'lmadi: ' + (e && e.message || 'MacBook ulanmagan')); }); return; }
      cur = d; st.sel = []; st.pts = []; st.buf = ''; st.undo = []; st.redo = []; save(); renderInfo(); renderLay(); renderDocs(); fitF(); }
    function renderDocs() {
      pDocs.innerHTML = ''; pDocs.appendChild(h('h4', '', 'Sahifalar'));
      docs.slice().sort(function (a, b) { return b.updated - a.updated; }).forEach(function (d) {
        var r = h('div', 'cz-dc' + (d === cur ? ' on' : ''), '<b>' + esc(d.name) + '</b><small>' + esc(d.project) + ' · ' + (d.shapes ? d.shapes.length : d.n || 0) + ' ta · ' + when(d.updated) + '</small>');
        r.onclick = function () { if (d !== cur) useDoc(d); };
        pDocs.appendChild(r);
      });
      var row = h('div', 'cz-row'), nb = h('button', 'cz-add', '+ Yangi sahifa'), db = h('button', 'cz-add del', 'O\'chirish');
      nb.onclick = function () { var d = blank(cur.project === 'Yozuv' ? 'Yozuv · ' + today() : 'Yangi chizma', cur.project, cur.paper); docs.push(d); useDoc(d); var i = pInfo.querySelector('input'); if (i) { i.focus(); i.select(); } };
      db.title = 'Ochiq turgan sahifani o\'chirish';
      db.onclick = function () { if (!confirm('«' + cur.name + '» o\'chirilsinmi? Qaytarib bo\'lmaydi.')) return; var gone = cur; if (store) store.del(gone); docs = docs.filter(function (d) { return d !== gone; }); if (!docs.length) docs.push(blank('Yozuv · ' + today(), 'Yozuv', 'chiziq')); useDoc(docs[0]); };
      row.appendChild(nb); row.appendChild(db); pDocs.appendChild(row);
    }

    /* --- PDF: A4 yotiq; chizmada masshtab va shtamp, yozuvda faqat nom va sana --- */
    function svgOf(s, k, ox, oy, col) {
      function X(p) { return (ox + p[0] * k).toFixed(2); }
      function Y(p) { return (oy + p[1] * k).toFixed(2); }
      function pts(p) { return p.map(function (q) { return X(q) + ',' + Y(q); }).join(' '); }
      var a = 'stroke="' + col + '" stroke-width="0.3" fill="none" stroke-linecap="round" stroke-linejoin="round"';
      if (s.t === 'pen') { var mw = s.p.reduce(function (t, q) { return t + penW(s, q); }, 0) / s.p.length; return '<polyline stroke="' + (s.c || col) + '" stroke-width="' + (mw * k).toFixed(3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" points="' + pts(s.p) + '"/>'; }
      if (s.t === 'mark') return '<polyline stroke="' + (s.c || col) + '" stroke-opacity="0.32" stroke-width="' + (s.w * k).toFixed(3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" points="' + pts(s.p) + '"/>';
      if (s.t === 'line') return '<polyline ' + a + ' points="' + pts(s.p) + '"/>';
      if (s.t === 'rect') return '<rect ' + a + ' x="' + X(s.p[0]) + '" y="' + Y(s.p[0]) + '" width="' + ((s.p[1][0] - s.p[0][0]) * k).toFixed(2) + '" height="' + ((s.p[1][1] - s.p[0][1]) * k).toFixed(2) + '"/>';
      if (s.t === 'circle') return '<circle ' + a + ' cx="' + X(s.p[0]) + '" cy="' + Y(s.p[0]) + '" r="' + (s.r * k).toFixed(2) + '"/>';
      if (s.t === 'text') return '<text x="' + X(s.p[0]) + '" y="' + Y(s.p[0]) + '" font-size="' + (s.h * k).toFixed(2) + '" fill="' + col + '" font-family="Helvetica, Arial, sans-serif">' + esc(s.s) + '</text>';
      var g = dimGeo(s), tx = dimText(g), cx = X(tx.c), cy = Y(tx.c);
      return dimSegs(g).map(function (q) { return '<line stroke="' + col + '" stroke-width="0.18" x1="' + X(q[0]) + '" y1="' + Y(q[0]) + '" x2="' + X(q[1]) + '" y2="' + Y(q[1]) + '"/>'; }).join('') +
        '<text x="' + cx + '" y="' + cy + '" font-size="' + (DIM_H * k).toFixed(2) + '" fill="' + col + '" font-family="Helvetica, Arial, sans-serif" text-anchor="middle" dominant-baseline="central" transform="rotate(' + tx.ang.toFixed(2) + ' ' + cx + ' ' + cy + ')">' + tx.s + '</text>';
    }
    function exportPDF() {
      var list = cur.shapes.filter(vis), bb = bboxAll(list);
      if (!bb) return msg('Sahifa bo\'sh — chop etadigan narsa yo\'q');
      var note = cur.project === 'Yozuv', PW = 297, PH = 210, M = 10, TBH = note ? 8 : 16, aw = PW - 2 * M - 8, ah = PH - 2 * M - TBH - 8, bw = Math.max(bb[2] - bb[0], 0.01), bh = Math.max(bb[3] - bb[1], 0.01), sc, k;
      if (note) { k = Math.min(aw / bw, ah / bh); sc = 0; }
      else { sc = [1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 250, 500, 1000, 2000, 5000, 10000].filter(function (s) { return bw * 1000 / s <= aw && bh * 1000 / s <= ah; })[0] || 20000; k = 1000 / sc; }
      var ox = M + 4 + (aw - bw * k) / 2 - bb[0] * k, oy = M + 4 + (note ? TBH : 0) + (ah - bh * k) / 2 - bb[1] * k;
      var body = list.map(function (s) { return svgOf(s, k, ox, oy, lay(s.l).color); }).join('');
      var t = function (x, y, sz, s, c) { return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" fill="' + (c || '#1d1d1b') + '" font-family="Helvetica, Arial, sans-serif">' + esc(s) + '</text>'; }, frame, ty = PH - M - TBH;
      if (note) frame = t(M, M + 4, 4, cur.name) + t(PW - M - 22, M + 4, 3, today(), '#6b6b66');
      else frame = '<rect x="' + M + '" y="' + M + '" width="' + (PW - 2 * M) + '" height="' + (PH - 2 * M) + '" fill="none" stroke="#1d1d1b" stroke-width="0.5"/>' +
        '<line x1="' + M + '" y1="' + ty + '" x2="' + (PW - M) + '" y2="' + ty + '" stroke="#1d1d1b" stroke-width="0.35"/>' +
        [150, 200, 240].map(function (x) { return '<line x1="' + (M + x) + '" y1="' + ty + '" x2="' + (M + x) + '" y2="' + (PH - M) + '" stroke="#1d1d1b" stroke-width="0.25"/>'; }).join('') +
        t(M + 4, ty + 7, 5, cur.name) + t(M + 4, ty + 12.5, 3, cur.project, '#6b6b66') +
        t(M + 154, ty + 6, 2.4, 'Masshtab', '#6b6b66') + t(M + 154, ty + 12, 4.2, '1:' + sc) +
        t(M + 204, ty + 6, 2.4, 'Sana', '#6b6b66') + t(M + 204, ty + 12, 4.2, today()) +
        t(M + 244, ty + 6, 2.4, 'O\'lchamlar', '#6b6b66') + t(M + 244, ty + 12, 4.2, 'metrda');
      var html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(cur.name) + '</title><style>@page{size:297mm 210mm;margin:0}html,body{margin:0;background:#fff}svg{display:block;width:297mm;height:210mm;max-width:100%;height:auto}</style></head><body>' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 210">' + body + frame + '</svg><script>window.onload=function(){setTimeout(function(){print()},300)}<\/script></body></html>';
      var w = window.open('', '_blank'); if (!w) return msg('Brauzer yangi oynani to\'sdi — ruxsat bering');
      w.document.open(); w.document.write(html); w.document.close();
    }

    /* --- DXF (R12): AutoCAD, BricsCAD, nanoCAD ochadi. Y o'qi teskari: ekranda pastga, CAD'da yuqoriga --- */
    function exportDXF() {
      if (!cur.shapes.length) return msg('Sahifa bo\'sh — saqlaydigan narsa yo\'q');
      var o = [];
      function g(c, v) { o.push(String(c), String(v)); }
      function n(v) { return String(Math.round(v * 10000) / 10000); }
      function ln(l) { var s = (l.name.normalize ? l.name.normalize('NFD').replace(/[̀-ͯ]/g, '') : l.name).replace(/[^A-Za-z0-9_-]/g, '_'); return s || 'QATLAM'; }
      function tx(s) { return s.replace(/[^\x20-\x7e]/g, function (c) { return '\\U+' + ('000' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-4); }); }
      function line(L, a, b, col) { g(0, 'LINE'); g(8, L); if (col) g(62, aci(col)); g(10, n(a[0])); g(20, n(-a[1])); g(30, 0); g(11, n(b[0])); g(21, n(-b[1])); g(31, 0); }
      function text(L, p, hh, s, ang, mid) { g(0, 'TEXT'); g(8, L); g(10, n(p[0])); g(20, n(-p[1])); g(30, 0); g(40, n(hh)); g(1, tx(s)); if (ang) g(50, n(ang)); if (mid) { g(72, 1); g(11, n(p[0])); g(21, n(-p[1])); g(31, 0); } }
      g(0, 'SECTION'); g(2, 'HEADER'); g(9, '$ACADVER'); g(1, 'AC1009'); g(0, 'ENDSEC');
      g(0, 'SECTION'); g(2, 'TABLES');
      g(0, 'TABLE'); g(2, 'LTYPE'); g(70, 1); g(0, 'LTYPE'); g(2, 'CONTINUOUS'); g(70, 0); g(3, 'Solid line'); g(72, 65); g(73, 0); g(40, '0.0'); g(0, 'ENDTAB');
      g(0, 'TABLE'); g(2, 'LAYER'); g(70, cur.layers.length);
      cur.layers.forEach(function (l) { g(0, 'LAYER'); g(2, ln(l)); g(70, l.lock ? 4 : 0); g(62, l.on ? aci(l.color) : -aci(l.color)); g(6, 'CONTINUOUS'); });
      g(0, 'ENDTAB'); g(0, 'ENDSEC');
      g(0, 'SECTION'); g(2, 'ENTITIES');
      cur.shapes.forEach(function (s) {
        var L = ln(lay(s.l) || { name: 'QATLAM' });
        if (s.t === 'circle') { g(0, 'CIRCLE'); g(8, L); g(10, n(s.p[0][0])); g(20, n(-s.p[0][1])); g(30, 0); g(40, n(s.r)); }
        else if (s.t === 'text') text(L, s.p[0], s.h, s.s);
        else {
          segsOf(s).forEach(function (q) { line(L, q[0], q[1], s.c); });
          if (s.t === 'dim') { var t = dimText(dimGeo(s)), a = t.ang * Math.PI / 180; text(L, [t.c[0] - Math.sin(a) * DIM_H / 2, t.c[1] + Math.cos(a) * DIM_H / 2], DIM_H, t.s, -t.ang, true); }
        }
      });
      g(0, 'ENDSEC'); g(0, 'EOF');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([o.join('\r\n') + '\r\n'], { type: 'application/dxf' })); a.download = cur.name.replace(/[\\/:*?"<>|]/g, '_') + '.dxf';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      msg('DXF saqlandi: ' + a.download);
    }

    Object.keys(TG).forEach(function (k) { TG[k].setAttribute('aria-pressed', String(st[k])); });
    syncInk(); renderInfo(); renderDocs(); setTool('pen');
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(cv); else window.addEventListener('resize', resize);
    resize(); fitF(); status();
  }

  window.Chizma = { mount: mount, blank: blank, today: today };
})();
