/* Secreto 07 · Rongorongo (Teclado)
   Escribir RONGORONGO. La escena: una tablilla de madera aparece; un diente de tiburón graba los glifos trazo a trazo;
   al acabar cada línea la tablilla da media vuelta (bustrófedon inverso) y sigue; al final, como nadie ha sabido leerlos,
   los glifos se despegan de la madera y se van volando como manutara. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2, FILAS = 5, POR_FILA = 11;
  var buffer = '';
  // los glifos: figuras, peces, aves, medias lunas, plantas, hombres pájaro (trazos en una caja de −0,5 a 0,5)
  var G = [
    [[[0, -0.5], [0, 0.2]], [[0, 0.2], [-0.25, 0.5]], [[0, 0.2], [0.25, 0.5]], [[0, -0.2], [-0.35, -0.45]], [[0, -0.2], [0.35, -0.35]]],
    [[[-0.35, 0], [0, -0.3], [0.35, 0], [0, 0.3], [-0.35, 0]], [[0.35, 0], [0.5, -0.15]], [[0.35, 0], [0.5, 0.15]]],
    [[[-0.3, -0.4], [0, -0.1], [0.3, -0.4]], [[0, -0.1], [0, 0.5]], [[-0.3, 0.2], [0.3, 0.2]]],
    [[[-0.3, -0.45], [0.2, -0.3], [0.3, 0], [0.2, 0.3], [-0.3, 0.45]]],
    [[[0, -0.5], [0, 0.5]], [[-0.3, -0.25], [0.3, -0.25]], [[-0.25, 0.15], [0.25, 0.15]]],
    [[[-0.2, -0.5], [0.25, -0.35], [0, -0.15]], [[0, -0.15], [0, 0.5]], [[0, 0.1], [-0.35, -0.05]], [[0, 0.1], [0.3, 0.35]]],
    [[[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [-0.3, -0.3]], [[0, -0.3], [0, -0.55]]],
    [[[0, -0.45], [-0.3, 0.1], [0, 0.45], [0.3, 0.1], [0, -0.45]], [[0, -0.1], [0, 0.2]]]
  ];
  var TEXTO = (function () { var r = U.azar(1864), out = []; for (var i = 0; i < FILAS * POR_FILA; i++) out.push(Math.floor(r() * G.length)); return out; })();
  var T = { aparece: 300, escribe: 1300, fin: 10300, vuelo: 10500 };

  // un glifo grabado: surco oscuro y luz en el borde; prog = cuánto de sus trazos está hecho (0…1); devuelve la punta
  function glifo(c, g, x, y, sz, prog, color) {
    var tr = G[g], total = tr.length * prog, punta = null;
    for (var i = 0; i < tr.length && i < total; i++) {
      var pts = tr[i], parte = U.clamp(total - i, 0, 1), n = (pts.length - 1) * parte;
      for (var pase = 0; pase < 2; pase++) {
        c.strokeStyle = pase ? (color || '#f1d9a8') : 'rgba(30,16,8,.8)'; c.lineWidth = Math.max(1, sz * (pase ? 0.075 : 0.13)); c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath();
        for (var j = 0; j <= Math.ceil(n); j++) {
          var f = Math.min(j, n), a = pts[Math.floor(f)], b = pts[Math.min(pts.length - 1, Math.floor(f) + 1)], k = f - Math.floor(f);
          var px = x + U.lerp(a[0], b[0], k) * sz + (pase ? 0 : 1), py = y + U.lerp(a[1], b[1], k) * sz + (pase ? 0 : 1.2);
          j ? c.lineTo(px, py) : c.moveTo(px, py); if (pase) punta = [px, py];
        }
        c.stroke();
      }
    }
    return punta;
  }

  RN.registrar({
    id: 'rongorongo', n: 7, nombre: 'Rongorongo', tipo: 'Teclado',
    pista: 'Escribe el nombre de la escritura que nadie ha sabido leer.',
    detectar: function (api) {
      api.en('tecla', function (d) {
        if (!d.key || d.key.length !== 1) return;
        buffer = (buffer + d.key.toUpperCase()).replace(/[^A-Z]/g, '').slice(-12);
        if (/RONGORONGO$/.test(buffer)) { buffer = ''; api.disparar(); }
      });
    },
    escena: function () {
      var D = 14500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 8200, hasta: D - 400, titulo: 'Rongorongo', pie: 'Kohau rongorongo · sin descifrar',
          texto: 'Quizá la única escritura inventada en toda Oceanía, y nadie ha sabido leerla. Quedan unas dos docenas de tablillas y objetos de madera, repartidos por museos del mundo. Se lee en bustrófedon inverso: al acabar una línea se gira la tablilla 180° y se sigue por la siguiente.' },
        frente: function (c, t) {
          var a = U.meseta(t, T.aparece, T.aparece + 900, D - 1200, D - 200); if (a <= 0) return;
          c.fillStyle = 'rgba(22,24,52,' + (0.5 * a).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H);
          var ancho = E.W > 800, w = Math.min(E.W * (ancho ? 0.5 : 0.88), E.H * 0.8), h = w * 0.5, x = E.W * (ancho ? 0.64 : 0.5), y = E.H * (ancho ? 0.36 : 0.28);
          var tl = U.tramo(t, T.escribe, T.fin) * FILAS, fila = Math.min(FILAS - 1, Math.floor(tl)), dentro = tl - fila;
          var escrito = U.clamp(dentro / 0.76, 0, 1), giro = (fila + U.inOut(U.tramo(dentro, 0.8, 1)) * (fila < FILAS - 1 ? 1 : 0)) * Math.PI, alza = Math.sin(Math.PI * U.tramo(dentro, 0.8, 1)) * (fila < FILAS - 1 ? 1 : 0);
          var desva = U.tramo(t, T.vuelo, T.vuelo + 1500);
          c.save(); c.globalAlpha = a * (1 - desva * 0.6); c.translate(x, y + (1 - a) * 30 - alza * 10); c.rotate(giro); c.scale(1 + alza * 0.04, 1 + alza * 0.04);
          // la sombra, la madera con su veta y su canto
          c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(8, 12 + alza * 10, w / 2, h / 2, 0, 0, TAU); c.fill();
          c.fillStyle = '#4a321e'; c.beginPath(); c.ellipse(0, 4, w / 2, h / 2, 0, 0, TAU); c.fill();
          c.fillStyle = '#6a4a30'; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.fill();
          c.save(); c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.clip();
          c.strokeStyle = 'rgba(40,26,14,.35)'; c.lineWidth = 1; for (var v = -h / 2; v < h / 2; v += 4) { c.beginPath(); c.moveTo(-w / 2, v); c.bezierCurveTo(-w / 4, v + 3, w / 4, v - 3, w / 2, v + Math.sin(v) * 2); c.stroke(); }
          var alto = h * 0.8 / FILAS, sz = alto * 0.56, paso = w * 0.84 / POR_FILA, punta = null;
          for (var f = 0; f <= fila; f++) {
            var fy = h * 0.4 - alto * (f + 0.5), inv = f % 2 ? -1 : 1, hechos = f < fila ? POR_FILA : escrito * POR_FILA;
            c.strokeStyle = 'rgba(30,18,10,.3)'; c.beginPath(); c.moveTo(-w * 0.44, inv * (fy + alto * 0.5)); c.lineTo(w * 0.44, inv * (fy + alto * 0.5)); c.stroke();
            for (var k = 0; k < Math.ceil(hechos); k++) {
              var gx = inv * (-w * 0.42 + paso * (k + 0.5)), gy = inv * fy, prog = U.clamp(hechos - k, 0, 1);
              c.save(); c.translate(gx, gy); c.rotate(f % 2 ? Math.PI : 0);
              var col = desva > 0 ? U.rgba(U.mezcla([241, 217, 168], [255, 127, 110], desva), 1) : null;
              var pt = glifo(c, TEXTO[f * POR_FILA + k], 0, 0, sz, prog, col);
              c.restore();
              if (pt && prog < 1 && f === fila) punta = [gx + (f % 2 ? -pt[0] : pt[0]), gy + (f % 2 ? -pt[1] : pt[1])];
            }
          }
          c.restore();
          c.strokeStyle = '#2a1a0e'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.stroke();
          // el diente de tiburón que graba
          if (punta && t < T.fin) { c.save(); c.translate(punta[0], punta[1]); c.rotate(-giro - 0.6); c.fillStyle = '#f2ece0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-sz * 0.35, -sz * 1.1); c.lineTo(sz * 0.35, -sz * 1.1); c.closePath(); c.fill(); c.strokeStyle = '#8a7a66'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#3a2618'; c.fillRect(-sz * 0.3, -sz * 1.9, sz * 0.6, sz * 0.8); c.restore(); }
          c.restore();
          // al final, los glifos echan a volar como manutara
          if (t > T.vuelo) {
            for (var b = 0; b < 34; b++) {
              var kb = U.tramo(t, T.vuelo + b * 60, T.vuelo + 2600 + b * 60); if (kb <= 0) continue;
              var ox = x + (U._h(b * 1.3) - 0.5) * w * 0.8, oy = y + (U._h(b * 2.7) - 0.5) * h * 0.7, dx = (U._h(b * 4.1) - 0.3) * E.W * 0.7, dy = -E.H * (0.3 + U._h(b * 5.9) * 0.4);
              var bx = ox + dx * U.entra(kb), by = oy + dy * kb + Math.sin(kb * 8 + b) * 10;
              c.globalAlpha = a * (1 - U.tramo(kb, 0.75, 1));
              if (kb < 0.15) { c.save(); c.translate(bx, by); glifo(c, TEXTO[b], 0, 0, sz * 0.9, 1, S.CORAL); c.restore(); }
              else S.manutara(c, bx, by, sz * (0.5 + kb * 0.5), t / 120 + b, kb < 0.4 ? S.CORAL : PA.paleta().ave);
            }
            c.globalAlpha = 1;
          }
          var rl = U.meseta(t, T.escribe, T.escribe + 400, T.fin, T.fin + 400);
          if (rl > 0) S.rotulo(c, 'LÍNEA ' + Math.min(FILAS, fila + 1) + ' / ' + FILAS + (dentro > 0.8 && fila < FILAS - 1 ? ' · GIRO 180°' : ''), x, y + h / 2 + 34, a * rl, S.CORAL);
          var rn = U.meseta(t, T.vuelo + 600, T.vuelo + 1200, D - 1500, D - 400);
          if (rn > 0) S.rotulo(c, 'SIN DESCIFRAR', x, y + h / 2 + 34, rn, S.CORAL);
        }
      };
    }
  });
})();
