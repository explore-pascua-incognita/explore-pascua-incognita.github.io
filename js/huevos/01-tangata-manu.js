/* Secreto 01 · Tangata Manu (Gesto)
   Arrastrar desde lo alto del acantilado de Orongo hasta Motu Nui y volver: la carrera del Hombre Pájaro. Mientras se
   arrastra, la estela del nadador queda dibujada sobre el mar.
   La escena: 1. llegan los manutara a Motu Nui;  2. tres hopu bajan la pared del acantilado;  3. cruzan nadando sobre
   sus flotadores de junco;  4. en el islote, uno encuentra el primer huevo;  5. vuelve el primero, sube la pared;
   6. arriba alza el huevo y el Hombre Pájaro de los petroglifos se dibuja en el cielo. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2;
  // la pared del acantilado, de arriba (λ, y) abajo; y null = el borde del suelo
  var PARED = [[0.62, null], [0.47, 0.62], [0.405, 0.672], [0.36, 0.712], [0.34, 0.765], [0.3, 0.805], [0.29, 0.86], [0.25, 0.905], [0.225, 0.975]];
  var T = { baja: 1200, nada: 3000, isla: 6400, huevo: 6900, vuelta: 7700, llega: 10300, sube: 10300, arriba: 11500 };
  var VEL = [1, 0.86, 0.78];
  function motu() { return [E.sx(0.116, 0.12), E.H * (PA.HOR - 0.014)]; }
  function enOrongo(d) { return d.l > 0.42 && d.l < 1.35 && d.yu > PA.suelo(Math.max(0.5, d.l)) - 0.06 && d.yu < PA.suelo(Math.max(0.5, d.l)) + 0.12; }
  // un punto de la pared (k = 0 arriba … 1 al pie)
  function pared(k) {
    var pts = PARED.map(function (q) { return [E.sx(q[0], 1), (q[1] == null ? PA.suelo(q[0]) : q[1]) * E.H]; }), L = [0], i;
    for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var d = U.clamp(k, 0, 1) * L[L.length - 1];
    for (i = 1; i < pts.length; i++) if (d <= L[i]) { var f = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [U.lerp(pts[i - 1][0], pts[i][0], f), U.lerp(pts[i - 1][1], pts[i][1], f)]; }
    return pts[pts.length - 1];
  }
  // el camino a nado, del pie del acantilado a Motu Nui, abriéndose al mar para no cruzar la tierra
  function aNado(k, carril) {
    var a = pared(1), m = motu(), cx = a[0] - E.u * (0.34 + carril * 0.05), cy = a[1] - (a[1] - m[1]) * (0.62 - carril * 0.04);
    a = [a[0] - carril * 12, a[1] + carril * 4]; m = [m[0] + (carril - 1) * 14, m[1] + 6];
    return [(1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * cx + k * k * m[0], (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * cy + k * k * m[1]];
  }
  // un hopu nadando sobre su pora (un haz de juncos); z = escala, dir = 1 hacia el islote, −1 de vuelta
  function nadador(c, P, p, z, t, dir, coral, huevo) {
    var x = p[0], y = p[1];
    c.save(); c.strokeStyle = P.espuma; c.globalAlpha = 0.65; c.lineWidth = Math.max(1, 1.4 * z);
    c.beginPath(); c.moveTo(x - dir * 14 * z, y + 2 * z); c.lineTo(x - dir * 34 * z, y - 4 * z); c.moveTo(x - dir * 14 * z, y + 2 * z); c.lineTo(x - dir * 34 * z, y + 8 * z); c.stroke(); c.restore();
    c.fillStyle = P.tronco; c.beginPath(); c.ellipse(x, y, 17 * z, 4.5 * z, 0, 0, TAU); c.fill();
    c.strokeStyle = P.troncoLuz; c.lineWidth = Math.max(0.6, z); for (var j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(x - 14 * z, y + j * 1.2 * z); c.lineTo(x + 14 * z, y + j * 1.2 * z); c.stroke(); }
    var hx = x + dir * 5 * z, hy = y - 6 * z, br = Math.sin(t / 170);
    c.strokeStyle = '#1a1420'; c.lineCap = 'round'; c.lineWidth = Math.max(1.2, 2.6 * z);
    c.beginPath(); c.moveTo(hx - dir * 2 * z, hy + 3 * z); c.lineTo(hx + dir * (6 + br * 6) * z, hy + (2 - Math.abs(br) * 6) * z); c.stroke();
    c.fillStyle = '#1a1420'; c.beginPath(); c.arc(hx, hy, 4.5 * z, 0, TAU); c.fill();
    if (coral) { c.strokeStyle = S.CORAL; c.lineWidth = Math.max(1, 1.6 * z); c.beginPath(); c.arc(hx, hy, 4.6 * z, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    c.strokeStyle = P.espuma; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y + 2, (14 + br * 2) * z, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
    if (huevo) S.huevo(c, hx, hy - 9 * z, 4.5 * z, 0.8);
  }
  var rastro = null;

  RN.registrar({
    id: 'tangata-manu', n: 1, nombre: 'Tangata Manu', tipo: 'Gesto',
    pista: 'Desde lo alto del acantilado, el primero en volver con un huevo manda un año entero.',
    detectar: function (api) {
      api.en('bajar', function (d) { if (E.camX < E.u * 0.9 && enOrongo(d)) { d.tomar(); rastro = { pts: [[d.x, d.y]], motu: false }; } });
      api.en('arrastrar', function (d) {
        if (!rastro) return;
        rastro.pts.push([d.x, d.y]);
        var m = motu(); if (Math.hypot(d.x - m[0], d.y - m[1]) < Math.max(46, E.u * 0.06)) rastro.motu = true;
      });
      api.en('soltar', function (d) { var r = rastro; rastro = null; if (r && r.motu && enOrongo(d)) api.disparar(); });
      api.capa(function (c) {
        if (!rastro || rastro.pts.length < 2) return;
        c.save(); c.strokeStyle = rastro.motu ? S.CORAL : 'rgba(242,227,198,.8)'; c.lineWidth = 2; c.setLineDash([2, 6]); c.lineCap = 'round';
        c.beginPath(); rastro.pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke(); c.restore();
      });
    },
    escena: function () {
      var D = 14200 + E.lectura;
      function kIda(i, t) { return U.inOut(U.tramo(t, T.nada + i * 180, T.nada + i * 180 + (T.isla - T.nada) / VEL[i])); }
      return {
        duracion: D,
        tarjeta: { en: 11200, hasta: D - 400, titulo: 'Tangata Manu', pie: 'Orongo · Motu Nui · hasta 1866–1867',
          texto: 'Cada primavera, los <i>hopu</i> bajaban el acantilado de Orongo, nadaban sobre flotadores de junco hasta Motu Nui y esperaban la primera puesta del manutara. El primero que volvía con el huevo intacto convertía a su jefe en el Hombre Pájaro durante un año. La última carrera se celebró hacia 1866–1867.' },
        inicio: function () { E.irA(0.75, 1400); },
        mar: function (c, t) {
          var P = PA.paleta(), m = motu(), z0 = E.H / 800, zn = z0 * 1.8;
          // 1 · la bandada: llegan desde arriba a la derecha y giran sobre el islote
          for (var b = 0; b < 16; b++) {
            var llega = U.sale(U.tramo(t, b * 90, 1800 + b * 90)), a = t / 1100 + b * 0.7, rr = (22 + (b % 4) * 12) * z0;
            var bx = U.lerp(E.W * 1.1, m[0] + Math.cos(a) * rr * 1.8, llega), by = U.lerp(E.H * 0.1, m[1] - 30 * z0 - Math.sin(a) * rr * 0.55, llega);
            S.manutara(c, bx, by, (6 + (b % 3) * 2.5) * z0, t / 130 + b, P.ave);
          }
          // 3 · los tres nadadores (el coral es el que ganará)
          for (var i = 2; i >= 0; i--) {
            var k = kIda(i, t); if (t < T.nada || (i > 0 && t > T.vuelta + 2600)) continue;
            if (i === 0 && t >= T.vuelta) {
              var kv = U.inOut(U.tramo(t, T.vuelta, T.llega));
              if (kv < 1) nadador(c, P, aNado(1 - kv, 0), U.lerp(0.3, 1, kv) * zn, t, -1, true, true);
              continue;
            }
            if (k >= 1) continue;   // en el islote
            nadador(c, P, aNado(k, i), U.lerp(1, 0.3, k) * zn, t + i * 300, 1, i === 0, false);
          }
          // 4 · el primer huevo, en el islote: brilla y alguien lo coge
          var hh = U.meseta(t, T.isla - 200, T.huevo, T.vuelta - 200, T.vuelta + 200);
          if (hh > 0) { S.huevo(c, m[0] + 6, m[1] - 8 * z0, 4.5 * z0, hh); S.figura(c, m[0] - 4, m[1] + 2, 12 * z0, '#1a1420', { brazos: 1 + hh * 0.4 }); }
          if (t > T.isla && t < T.vuelta + 2600) { S.figura(c, m[0] - 16 * z0, m[1] + 3, 11 * z0, '#1a1420', { fase: t / 300 }); S.figura(c, m[0] + 14 * z0, m[1] + 3, 11 * z0, '#1a1420', { fase: t / 260 + 1 }); }
        },
        costa: function (c, t) {
          var z = E.H / 800 * 1.7;
          // 2 · los tres bajan la pared, uno tras otro
          for (var i = 0; i < 3; i++) {
            var k = U.tramo(t, T.baja + i * 260, T.nada + i * 180); if (k <= 0 || k >= 1) continue;
            var p = pared(k); S.figura(c, p[0] - 4, p[1], 20 * z, '#1a1420', { fase: t / 140 + i, brazos: 1.3, inclina: 0.12 });
          }
          // 5 · el ganador sube con el huevo
          var ks = U.tramo(t, T.sube, T.arriba);
          if (ks > 0 && ks < 1) { var q = pared(1 - ks); S.figura(c, q[0] - 4, q[1], 20 * z, '#1a1420', { fase: t / 120, brazos: 1.3, inclina: -0.12 }); S.huevo(c, q[0] - 4, q[1] - 26 * z, 5 * z, 0.8); }
          // 6 · arriba, alza el huevo; los demás miran
          if (t >= T.arriba) {
            var top = [E.sx(0.98, 1), (PA.suelo(0.98) + 0.02) * E.H], sube = U.sale(U.tramo(t, T.arriba, T.arriba + 900));
            S.figura(c, top[0], top[1], 26 * z, '#1a1420', { brazos: 1.25 + sube * 0.35 });
            S.huevo(c, top[0] + 9 * z, top[1] - 34 * z - sube * 10 * z, 6 * z, 0.9 + 0.1 * Math.sin(t / 300));
            [[-0.07, 1], [0.09, -1], [0.14, -1]].forEach(function (o, j) { S.figura(c, top[0] + o[0] * E.u, top[1] + 3, 22 * z, '#1a1420', { brazos: 0.6 + sube * 0.6, izquierda: o[1] < 0 }); });
          }
        },
        frente: function (c, t) {
          var g = U.tramo(t, T.arriba + 300, T.arriba + 2600), a = U.meseta(t, T.arriba + 300, T.arriba + 700, D - 1200, D - 200);
          if (g <= 0) return;
          var cx = E.W * 0.66, cy = E.H * 0.32, k2 = E.H * 0.2;
          c.save(); c.globalAlpha = a; c.strokeStyle = S.CORAL; c.lineWidth = 3.5; c.lineCap = 'round'; c.setLineDash([k2 * 6 * g, 9999]);
          c.beginPath(); c.moveTo(cx - k2 * 0.3, cy); c.quadraticCurveTo(cx - k2 * 0.5, cy - k2 * 0.6, cx, cy - k2 * 0.8); c.quadraticCurveTo(cx + k2 * 0.3, cy - k2 * 1.05, cx + k2 * 0.15, cy - k2 * 1.2);
          c.quadraticCurveTo(cx + k2 * 0.55, cy - k2 * 1.25, cx + k2 * 0.6, cy - k2 * 1.0); c.moveTo(cx, cy - k2 * 0.8); c.quadraticCurveTo(cx + k2 * 0.35, cy - k2 * 0.5, cx + k2 * 0.25, cy - k2 * 0.15); c.lineTo(cx + k2 * 0.45, cy); c.stroke();
          c.setLineDash([]); c.beginPath(); c.arc(cx + k2 * 0.25, cy - k2 * 1.08, k2 * 0.04, 0, TAU); c.stroke();
          c.restore();
          S.huevo(c, cx + k2 * 0.62, cy - k2 * 0.62, k2 * 0.12, g * a);
          S.rotulo(c, 'TANGATA MANU · UN AÑO', cx + k2 * 0.15, cy + 26, a * U.tramo(t, T.arriba + 1800, T.arriba + 2400), S.CORAL);
        }
      };
    }
  });
})();
