/* Secreto 06 · El Gigante (Mirada)
   Encontrarlo: dejar el cursor 1,5 s encima de Te Tokanga, tumbado en la pared de Rano Raraku (en pantalla táctil,
   tocarlo). La escena: se dibuja su contorno como si se tallara (saltan esquirlas), se mide (unos 21 m) y a la derecha
   se levanta una comparación en coral: una persona, un moái típico, Paro y el propio Gigante de pie. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, A = RN.arte, S = RN.esc;
  var TAU = Math.PI * 2, LC = 7.77;
  function silueta() {
    var u = E.u, y = PA.suelo(LC) + 0.052, largo = 0.3 * u, cx = LC * u - E.camX, cy = y * u, ang = -Math.PI / 2 - 0.05;
    var m = A.moaiGeo(0, largo / 2, largo, 0, 0.26), ca = Math.cos(ang), sa = Math.sin(ang);
    var tr = function (q) { return [cx + q[0] * ca - q[1] * sa, cy + q[0] * sa + q[1] * ca]; };
    return { pts: m.silueta.map(tr), cabeza: tr([0, -largo / 2]), pies: tr([0, largo / 2]), largo: largo, cx: cx, cy: cy };
  }
  function dentro(x, y) { var s = silueta(), d = Math.hypot(x - s.cx, y - s.cy); return d < s.largo * 0.52 && Math.abs(y - s.cy) < s.largo * 0.14; }
  function puntoContorno(pts, f) {
    var L = [0], i; for (i = 1; i <= pts.length; i++) { var a = pts[i - 1], b = pts[i % pts.length]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    var d = f * L[L.length - 1]; for (i = 1; i < L.length; i++) if (d <= L[i]) { var k = (d - L[i - 1]) / (L[i] - L[i - 1] || 1), a2 = pts[i - 1], b2 = pts[i % pts.length]; return [U.lerp(a2[0], b2[0], k), U.lerp(a2[1], b2[1], k)]; }
    return pts[0];
  }
  var mirando = 0, armado = true;
  var COMPARA = [[1.7, '1,7 M', 'persona'], [4, '≈ 4 M', 'moái'], [10, 'PARO ≈ 10 M', 'moái'], [21, 'TE TOKANGA ≈ 21 M', 'moái']];

  RN.registrar({
    id: 'gigante', n: 6, nombre: 'El Gigante', tipo: 'Mirada',
    pista: 'El más grande de todos nunca salió de la roca.',
    detectar: function (api) {
      api.en('cuadro', function (d) {
        var p = E.puntero;
        if (p.sobre && p.tipo === 'mouse' && dentro(p.x, p.y)) { mirando += d.dt; if (armado && mirando > 1500) { armado = false; api.disparar(); } }
        else { mirando = 0; armado = true; }
      });
      api.en('clic', function (d) { if (dentro(d.x, d.y)) api.disparar(); });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 8200, hasta: D - 400, titulo: 'El Gigante', pie: 'Te Tokanga · Rano Raraku · sin terminar',
          texto: 'En la cantera de Rano Raraku sigue tumbado Te Tokanga, «el Gigante»: unos 21 metros, el moái más grande que se empezó a tallar. Nunca se despegó de la roca. Pesaría entre 150 y 270 toneladas, según quién lo calcule. El mayor que llegó a levantarse, Paro, mide unos 10; la media ronda los 4.' },
        inicio: function () { E.irA(LC + 0.25, 1500); },
        frente: function (c, t) {
          var s = silueta(), k = U.tramo(t, 1600, 4400), a = U.meseta(t, 1600, 2000, D - 1200, D - 200), P = PA.paleta();
          if (a <= 0) return;
          // el contorno que se talla, con esquirlas que saltan del cincel
          var per = 0, i; for (i = 0; i < s.pts.length; i++) { var p0 = s.pts[i], p1 = s.pts[(i + 1) % s.pts.length]; per += Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); }
          c.save(); c.globalAlpha = a; c.strokeStyle = S.CORAL; c.lineWidth = 3; c.lineJoin = 'round'; c.setLineDash([per * k, per]);
          c.beginPath(); s.pts.forEach(function (q, j) { j ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.stroke(); c.restore();
          if (k > 0 && k < 1) { var cz = puntoContorno(s.pts, k); c.fillStyle = '#fff1e0'; c.beginPath(); c.arc(cz[0], cz[1], 3.5, 0, TAU); c.fill(); }
          for (var n = 0; n < 34; n++) {
            var tb = 1600 + n * 82, edad = (t - tb) / 700; if (edad < 0 || edad > 1) continue;
            var o = puntoContorno(s.pts, (tb - 1600) / 2800), vx = (U._h(n * 3.1) - 0.5) * 70, vy = -40 - U._h(n * 5.7) * 50;
            c.fillStyle = P.cantera; c.globalAlpha = 1 - edad; c.fillRect(o[0] + vx * edad - 2, o[1] + vy * edad + 160 * edad * edad - 2, 3 + (n % 3), 3);
          }
          c.globalAlpha = 1;
          // la medida: 21 m, con sus topes
          var m = U.tramo(t, 4200, 5400);
          if (m > 0) {
            var y0 = Math.min(s.cabeza[1], s.pies[1]) - E.H * 0.07, x0 = s.pies[0], x1 = U.lerp(s.pies[0], s.cabeza[0], m);
            c.save(); c.globalAlpha = a; c.strokeStyle = S.CREMA; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(x0, y0 - 6); c.lineTo(x0, y0 + 6); c.moveTo(x0, y0); c.lineTo(x1, y0); if (m >= 1) { c.moveTo(x1, y0 - 6); c.lineTo(x1, y0 + 6); } c.stroke(); c.restore();
            if (m >= 1) S.rotulo(c, 'TE TOKANGA · ≈ 21 M', (x0 + x1) / 2, y0 - 18, a, S.CORAL);
          }
          // la comparación: se levantan en fila, en coral, a la misma escala
          var ppm = s.largo / 21, yb = Math.min(E.H * 0.93, s.cy + s.largo * 1.08), xs = E.W * (E.W > 800 ? 0.66 : 0.2), paso = Math.min(E.W * 0.09, s.largo * 0.42);
          var linea = U.meseta(t, 5600, 6000, D - 1200, D - 200);
          if (linea > 0) { c.save(); c.globalAlpha = linea * 0.7; c.strokeStyle = S.CREMA; c.lineWidth = 1; c.beginPath(); c.moveTo(xs - paso * 0.6, yb); c.lineTo(xs + paso * 3.8, yb); c.stroke(); c.restore(); }
          COMPARA.forEach(function (q, j) {
            var g = U.sale(U.tramo(t, 6000 + j * 550, 6900 + j * 550)), x = xs + paso * (j === 3 ? 3.15 : j * 0.95), h = q[0] * ppm; if (g <= 0) return;
            c.save(); c.globalAlpha = a; c.translate(x, yb); c.scale(1, g); c.translate(-x, -yb);
            if (q[2] === 'persona') S.figura(c, x, yb, h, S.CORAL, { brazos: 0.2 });
            else { var gm = A.moaiGeo(x, yb, h, 0, 0.3); c.fillStyle = 'rgba(255,127,110,.14)'; c.fill(A.camino(gm.silueta)); c.strokeStyle = S.CORAL; c.lineWidth = 1.8; c.stroke(A.camino(gm.silueta)); }
            c.restore();
            S.rotulo(c, q[1], x, yb + 16 + (j % 2) * 18, a * U.tramo(t, 6600 + j * 550, 7000 + j * 550), j === 3 ? S.CORAL : S.CREMA);
          });
        }
      };
    }
  });
})();
