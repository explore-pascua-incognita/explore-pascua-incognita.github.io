/* Secreto 08 · Domingo de Pascua (Teclado)
   Escribir 1722. La escena: los tres barcos de Roggeveen llegan por el horizonte, recogen velas y echan el ancla
   (salpicadura); un bote rema hacia la costa; arriba a la derecha se despliega una carta náutica con la isla
   —un triángulo— y el nombre que le pusieron, Paasch Eyland. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2, buffer = '';
  var BARCOS = [['Arend', 0.44, 1], ['Thienhoven', 0.66, 0.84], ['Afrikaansche Galey', 0.84, 0.7]];
  var T = { llegan: 600, ancla: 6800, bote: 7600, carta: 7400 };

  RN.registrar({
    id: 'roggeveen', n: 8, nombre: 'Domingo de Pascua', tipo: 'Teclado',
    pista: 'Un domingo de abril llegaron tres barcos holandeses y le pusieron nombre.',
    detectar: function (api) {
      api.en('tecla', function (d) {
        if (!d.key || d.key.length !== 1) return;
        buffer = (buffer + d.key).replace(/[^0-9]/g, '').slice(-4);
        if (buffer === '1722') { buffer = ''; api.disparar(); }
      });
    },
    escena: function () {
      var D = 14000 + E.lectura;
      function pos(i, t) {
        var b = BARCOS[i], k = U.sale(U.tramo(t, T.llegan + i * 400, T.ancla + i * 200));
        return { x: E.W * U.lerp(-0.18 - i * 0.08, b[1], k), y: E.H * (PA.HOR + 0.02 + i * 0.012) + Math.sin(t / 700 + i) * 1.5, s: E.H * U.lerp(0.1, 0.2, k) * b[2], k: k };
      }
      return {
        duracion: D,
        tarjeta: { en: 7600, hasta: D - 400, titulo: 'Domingo de Pascua, 1722', pie: 'Jacob Roggeveen · 5 de abril de 1722',
          texto: 'El 5 de abril de 1722, Domingo de Pascua, la flota holandesa de Jacob Roggeveen —el <i>Arend</i>, el <i>Thienhoven</i> y el <i>Afrikaansche Galey</i>— llegó a la isla y la llamó <i>Paasch-Eyland</i>: Isla de Pascua. Fueron los primeros europeos en verla.' },
        inicio: function () { E.irA(5.0, 1400); },
        mar: function (c, t) {
          var P = PA.paleta(), noche = PA.peso('noche') > 0.5;
          for (var i = 2; i >= 0; i--) {
            var p = pos(i, t), recoge = U.tramo(t, T.ancla - 800 + i * 200, T.ancla + 600 + i * 200);
            // la estela mientras navega
            if (p.k < 1) { c.save(); c.strokeStyle = P.espuma; c.globalAlpha = 0.55 * (1 - p.k); c.lineWidth = 1.4; c.beginPath(); c.moveTo(p.x - p.s * 0.5, p.y); c.lineTo(p.x - p.s * 2, p.y + 3); c.moveTo(p.x - p.s * 0.5, p.y); c.lineTo(p.x - p.s * 1.8, p.y - 3); c.stroke(); c.restore(); }
            S.barco(c, p.x, p.y, p.s, P, t / 700 + i, noche, recoge);
            // el ancla: salpicadura y anillos
            var sp = U.tramo(t, T.ancla + i * 200, T.ancla + 1000 + i * 200);
            if (sp > 0 && sp < 1) { c.strokeStyle = P.espuma; c.fillStyle = P.espuma; c.globalAlpha = 1 - sp; c.lineWidth = 1.5; var ax = p.x + p.s * 0.45, ay = p.y + 2; c.beginPath(); c.ellipse(ax, ay, p.s * 0.25 * sp, p.s * 0.05 * sp, 0, 0, TAU); c.stroke(); for (var g = 0; g < 5; g++) { c.beginPath(); c.arc(ax + (g - 2) * 4, ay - Math.sin(Math.PI * sp) * p.s * 0.15 * (1 - Math.abs(g - 2) / 3), 2, 0, TAU); c.fill(); } c.globalAlpha = 1; }
            if (t > 2400 + i * 500) S.rotulo(c, BARCOS[i][0].toUpperCase(), p.x, p.y - p.s * 1.05, U.meseta(t, 2400 + i * 500, 3000 + i * 500, D - 1800, D - 600) * 0.95);
          }
        },
        costa: function (c, t) {
          // el bote de remos: del Arend hacia la playa
          var kb = U.inOut(U.tramo(t, T.bote, T.bote + 5200)); if (t < T.bote) return;
          var P = PA.paleta(), p = pos(0, t), dest = [E.sx(5.0, 1) - E.u * 0.1, (PA.suelo(5.0) - 0.004) * E.H];
          var x = U.lerp(p.x + p.s * 0.2, dest[0], kb), y = U.lerp(p.y + 4, dest[1], kb), s = E.H * U.lerp(0.025, 0.05, kb), rem = Math.sin(t / 220);
          if (kb < 1) { c.strokeStyle = P.espuma; c.globalAlpha = 0.6; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x - s * 1.6, y - s * 0.3); c.stroke(); c.globalAlpha = 1; }
          c.fillStyle = P.moaiSombra; c.beginPath(); c.moveTo(x - s, y - s * 0.15); c.lineTo(x + s, y - s * 0.15); c.lineTo(x + s * 0.75, y + s * 0.2); c.lineTo(x - s * 0.8, y + s * 0.2); c.closePath(); c.fill();
          c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(1, s * 0.06);
          for (var r = 0; r < 3; r++) { var rx = x - s * 0.5 + r * s * 0.45; S.figura(c, rx, y - s * 0.12, s * 0.7, P.moaiSombra, { inclina: rem * 0.15 }); c.beginPath(); c.moveTo(rx, y - s * 0.3); c.lineTo(rx - s * 0.5 - rem * s * 0.3, y + s * 0.35); c.stroke(); }
        },
        frente: function (c, t) {
          // la carta náutica que se despliega
          var a = U.meseta(t, T.carta, T.carta + 400, D - 1400, D - 300), ab = U.inOut(U.tramo(t, T.carta, T.carta + 1400)); if (a <= 0) return;
          var w = Math.min(E.W * 0.32, E.H * 0.48), h = w * 0.68, x = E.W - w - E.u * 0.06, y = E.H * 0.1;
          c.save(); c.globalAlpha = a;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 8, y + 10, w * ab, h);
          c.fillStyle = '#ead9b4'; c.fillRect(x, y, w * ab, h);
          c.save(); c.beginPath(); c.rect(x, y, w * ab, h); c.clip();
          c.fillStyle = 'rgba(120,90,50,.18)'; for (var p = 0; p < 90; p++) { c.beginPath(); c.arc(x + U._h(p) * w, y + U._h(p * 2.3) * h, 2 + U._h(p * 3.7) * 6, 0, TAU); c.fill(); }
          c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = 1; for (var lz = 0; lz < 6; lz++) { c.beginPath(); c.moveTo(x, y + h * (0.15 + lz * 0.15)); c.lineTo(x + w, y + h * (0.15 + lz * 0.15)); c.stroke(); }
          // la isla: un triángulo con un volcán en cada esquina
          var cx = x + w * 0.42, cy = y + h * 0.52, r = h * 0.3, isla = [[-1.05, 0.55], [0.1, -0.85], [1.0, 0.6]], ki = U.tramo(t, T.carta + 900, T.carta + 2400);
          c.strokeStyle = '#3a2618'; c.lineWidth = 2; c.setLineDash([r * 7 * ki, 9999]); c.beginPath();
          for (var i = 0; i <= 3; i++) { var q = isla[i % 3], n = isla[(i + 1) % 3]; for (var s = 0; s < 10 && i < 3; s++) { var f = s / 10, px = cx + U.lerp(q[0], n[0], f) * r + Math.sin(f * 12 + i) * 3, py = cy + U.lerp(q[1], n[1], f) * r + Math.cos(f * 10 + i) * 3; (i === 0 && s === 0) ? c.moveTo(px, py) : c.lineTo(px, py); } }
          c.closePath(); c.stroke(); c.setLineDash([]);
          isla.forEach(function (q) { c.fillStyle = 'rgba(58,38,24,' + (0.6 * ki).toFixed(2) + ')'; c.beginPath(); c.arc(cx + q[0] * r * 0.82, cy + q[1] * r * 0.82, r * 0.08, 0, TAU); c.fill(); });
          // la ruta de los barcos, a puntos, con un ancla
          var kr = U.tramo(t, T.carta + 1600, T.carta + 3000);
          c.fillStyle = '#8a2a22'; for (var d = 0; d < 20 * kr; d++) { c.beginPath(); c.arc(x + w * 0.05 + d * w * 0.022, y + h * 0.9 - d * h * 0.012, 1.4, 0, TAU); c.fill(); }
          // la rosa de los vientos
          var rx = x + w * 0.84, ry = y + h * 0.26, rr = h * 0.12; c.strokeStyle = '#3a2618'; c.lineWidth = 1; c.beginPath(); c.arc(rx, ry, rr, 0, TAU); c.stroke();
          for (var k = 0; k < 8; k++) { var aa = k * Math.PI / 4, l = k % 2 ? 0.55 : 1; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + Math.sin(aa) * rr * l, ry - Math.cos(aa) * rr * l); c.stroke(); }
          c.fillStyle = '#8a2a22'; c.beginPath(); c.moveTo(rx, ry - rr); c.lineTo(rx + 3, ry); c.lineTo(rx - 3, ry); c.fill();
          // el nombre, a pluma
          var kn = U.tramo(t, T.carta + 2200, T.carta + 3400);
          if (kn > 0) {
            c.fillStyle = '#2a1a0e'; c.font = 'italic 400 ' + Math.round(h * 0.13) + 'px "Instrument Serif", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
            var txt = 'Paasch Eyland'; c.fillText(txt.slice(0, Math.ceil(txt.length * kn)), cx, y + h * 0.15);
            c.font = '500 ' + Math.round(h * 0.06) + 'px "IBM Plex Mono", monospace'; c.fillStyle = '#8a2a22'; c.fillText('5 APRIL 1722', cx, y + h * 0.95);
          }
          c.restore();
          c.strokeStyle = '#3a2618'; c.lineWidth = 1.5; c.strokeRect(x + 5, y + 5, w * ab - 10, h - 10);
          // el rollo que se va desenrollando
          if (ab < 1) { c.fillStyle = '#d2bd92'; c.fillRect(x + w * ab - 6, y - 4, 12, h + 8); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w * ab + 2, y - 4, 4, h + 8); }
          c.restore();
        }
      };
    }
  });
})();
