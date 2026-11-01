/* Secreto 09 · Ahu Tongariki (Distancia)
   Seguir empujando más allá del final de la costa. La escena, en la vista principal:
     1. el mar se retira y deja ver el arrecife;  2. una ola crece en el horizonte y se acerca: los quince se recortan
     contra la pared de agua;  3. rompe y lo cubre todo;  4. el agua se va: el ahu vacío y los moáis tumbados tierra
     adentro, el suelo mojado (1960);  5. una grúa los vuelve a poner en pie uno a uno (1992–1996).
   Mientras están caídos, el paisaje se pinta sin ellos (PA.ocultos.tongariki) y los moáis se dibujan en vivo. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, A = RN.arte, S = RN.esc;
  var TAU = Math.PI * 2, LC = PA.lugar('tongariki'), N = 15, SEP = 0.083;
  var ALTOS = [0.24, 0.27, 0.25, 0.28, 0.26, 0.29, 0.25, 0.27, 0.3, 0.26, 0.28, 0.25, 0.27, 0.24, 0.26];
  var T = { ola: 1300, rompe: 4600, cubierto: 5400, baja: 5900, seco: 7400, grua: 8600, porMoai: 330 };
  // dónde quedó cada uno tras la ola: arrastrados tierra adentro, girados, casi todos boca abajo
  var CAIDOS = (function () {
    var r = U.azar(1960), out = [];
    for (var i = 0; i < N; i++) out.push({ dl: (i - (N - 1) / 2) * SEP * 1.1 + (r() - 0.5) * 0.06 - 0.04, dy: 0.07 + r() * 0.13, ang: (r() < 0.5 ? -1 : 1) * (Math.PI / 2 - 0.25 - r() * 0.5), espalda: r() < 0.75 });
    return out;
  })();
  function opMoai(i) { return { pukao: i === 9, roto: i === 0 || i === 13, semilla: Math.round(LC * 1000) + i }; }
  function caido(c, P, i, a) {
    var q = CAIDOS[i], u = E.u, h = ALTOS[i] * u, x = E.sx(LC + q.dl, 1), y = (PA.suelo(LC) + q.dy) * E.H;
    c.save(); c.globalAlpha = a;
    A.contacto(c, x, y + h * 0.04, h * 0.55, h * 0.07, 0.45);
    c.translate(x, y); c.scale(1, 0.55); c.rotate(q.ang);
    A.moai(c, P, A.moaiGeo(0, h / 2, h, 0, 0.3), { espalda: q.espalda, semilla: opMoai(i).semilla, roto: true });
    c.restore();
  }

  RN.registrar({
    id: 'tongariki', n: 9, nombre: 'Ahu Tongariki', tipo: 'Distancia',
    pista: 'Quince se levantaron dos veces. Ve hasta el final… y un poco más.',
    detectar: function (api) {
      api.en('empujar', function (d) { if (d.lado === 'fin' && d.total > Math.max(900, E.W * 0.7)) { E.empuje = 0; api.disparar(); } });
    },
    escena: function () {
      var D = 15500 + E.lectura, extra = [];
      function restaurado(i, t) { return t >= T.grua + (i + 1) * T.porMoai; }
      return {
        duracion: D,
        tarjeta: { en: 8800, hasta: D - 400, titulo: 'Ahu Tongariki', pie: 'Ahu Tongariki · 1960 · 1992–1996',
          texto: 'Es el mayor ahu de la isla. Sus quince moáis ya estaban derribados cuando, en 1960, el tsunami del gran terremoto de Chile los arrastró tierra adentro. Entre 1992 y 1996, un equipo dirigido por Claudio Cristino y Patricia Vargas los volvió a levantar con una grúa de la empresa japonesa Tadano.' },
        inicio: function () { E.irA(LC, 1200); },
        fin: function () { PA.ocultos.tongariki = false; extra.forEach(function (o) { var k = PA.sombrasExtra.indexOf(o); if (k >= 0) PA.sombrasExtra.splice(k, 1); }); },
        cuadro: function (t) {
          if (t > T.cubierto && t < T.grua && !PA.ocultos.tongariki) PA.ocultos.tongariki = true;
          // las sombras de los que ya están otra vez en pie
          for (var i = extra.length; i < N && restaurado(i, t); i++) { var o = { tipo: 'moai', l: LC + (i - (N - 1) / 2) * SEP, y: PA.suelo(LC) + 0.006, h: ALTOS[i], w: ALTOS[i] * 0.142 }; extra.push(o); PA.sombrasExtra.push(o); }
        },
        mar: function (c, t) {
          var P = PA.paleta(), W = E.W, H = E.H, costa = PA.suelo(LC) * H;
          // 1 · el mar se retira: aparece una franja de arrecife y arena mojada junto a la orilla
          var ret = U.meseta(t, 300, 1600, T.rompe - 400, T.rompe);
          if (ret > 0) {
            c.fillStyle = P.arenaMojada; c.beginPath(); c.moveTo(-10, costa + 4);
            for (var x = -10; x <= W + 10; x += 20) c.lineTo(x, costa - ret * H * (0.03 + 0.01 * Math.sin(x * 0.03)));
            c.lineTo(W + 10, costa + 4); c.closePath(); c.fill();
            c.fillStyle = P.roca; for (var k = 0; k < 40; k++) { var rx = (k * 97) % W, ry = costa - ret * H * 0.012 * (1 + (k % 3)); c.beginPath(); c.ellipse(rx, ry, 4 + (k % 4) * 2, 2 + (k % 3), 0, 0, TAU); c.fill(); }
          }
          // 2 · la ola: nace en el horizonte, crece y se acerca; los moáis quedan delante, contra el agua
          var k2 = U.tramo(t, T.ola, T.rompe + 600);
          if (k2 > 0 && t < T.baja) {
            var base = U.lerp(PA.HOR * H + 2, costa - 2, U.inOut(k2)), alto = U.lerp(H * 0.012, H * 0.56, Math.pow(k2, 1.5));
            S.ola(c, -W * 0.15, base, W * 1.3, alto, k2, P);
          }
        },
        costa: function (c, t) {
          var P = PA.paleta(), H = E.H, W = E.W;
          if (!PA.ocultos.tongariki) return;
          // el suelo mojado y los charcos, que se secan
          var moja = 1 - U.tramo(t, T.seco, T.grua + 2500);
          if (moja > 0) {
            c.fillStyle = 'rgba(14,22,48,' + (0.3 * moja).toFixed(3) + ')'; c.fillRect(0, PA.suelo(LC) * H, W, H);
            c.fillStyle = P.ola; for (var p = 0; p < 9; p++) { c.globalAlpha = 0.45 * moja; c.beginPath(); c.ellipse((p * 0.13 + 0.05) * W, (PA.suelo(LC) + 0.09 + (p % 3) * 0.05) * H, W * 0.04, H * 0.008, 0, 0, TAU); c.fill(); }
            c.globalAlpha = 1;
          }
          // 4 · los caídos (desaparecen cuando la grúa se los lleva) y 5 · los que ya están en pie
          for (var i = 0; i < N; i++) { if (t < T.grua + i * T.porMoai) caido(c, P, i, 1); }
          for (i = 0; i < N; i++) if (restaurado(i, t)) A.moai(c, P, S.moaiDeAhu(LC, N, i, SEP, ALTOS[i]), opMoai(i));
          // la grúa telescópica: lleva el moái de su sitio en la hierba hasta el ahu, colgado del cable
          if (t >= T.grua - 600 && t < T.grua + N * T.porMoai + 900) {
            var j = U.clamp(Math.floor((t - T.grua) / T.porMoai), 0, N - 1), f = U.clamp((t - T.grua - j * T.porMoai) / T.porMoai, 0, 1);
            var dest = S.moaiDeAhu(LC, N, j, SEP, ALTOS[j]), q = CAIDOS[j], ox = E.sx(LC + q.dl, 1), oy = (PA.suelo(LC) + q.dy) * H;
            var mx = U.lerp(ox, dest.cx, U.inOut(f)), base = U.lerp(oy, dest.base, U.inOut(f)) - Math.sin(Math.PI * f) * H * 0.08;
            var aparece = U.tramo(t, T.grua - 600, T.grua), xc = E.sx(LC + 0.46, 1) + (1 - aparece) * W * 0.3, yc = (PA.suelo(LC) + 0.11) * H;
            c.save();
            // el camión
            c.fillStyle = '#e0b23c'; c.fillRect(xc - H * 0.07, yc - H * 0.05, H * 0.14, H * 0.05); c.fillRect(xc + H * 0.05, yc - H * 0.075, H * 0.05, H * 0.03);
            c.fillStyle = '#2a2420'; [-0.045, 0, 0.045].forEach(function (w) { c.beginPath(); c.arc(xc + w * H, yc, H * 0.015, 0, TAU); c.fill(); });
            // la pluma: de la base a la punta, encima del moái
            var px = xc - H * 0.02, py = yc - H * 0.05, tx = mx, ty = Math.min(base - ALTOS[j] * E.u - H * 0.06, py - H * 0.2);
            if (t < T.grua) { tx = U.lerp(px - H * 0.2, tx, aparece); ty = U.lerp(py - H * 0.15, ty, aparece); }
            c.strokeStyle = '#e0b23c'; c.lineCap = 'round'; c.lineWidth = H * 0.016; c.beginPath(); c.moveTo(px, py); c.lineTo(tx, ty); c.stroke();
            c.strokeStyle = '#8a6a1c'; c.lineWidth = 1; c.beginPath(); for (var s = 0; s < 1; s += 0.08) { var lx = U.lerp(px, tx, s), ly = U.lerp(py, ty, s); c.moveTo(lx - 3, ly + 3); c.lineTo(lx + 3, ly - 3); } c.stroke();
            if (t >= T.grua) {
              c.strokeStyle = '#2a2420'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(mx, base - ALTOS[j] * E.u); c.stroke();
              A.moai(c, P, A.moaiGeo(mx, base, ALTOS[j] * E.u, 0, 0.3), opMoai(j));
            }
            c.restore();
          }
        },
        frente: function (c, t) {
          var P = PA.paleta(), W = E.W, H = E.H;
          // 3 · rompe: el agua cae de arriba abajo y lo cubre todo; luego se escurre hacia delante
          var cubre = U.tramo(t, T.rompe, T.cubierto), baja = U.tramo(t, T.baja, T.seco);
          if (cubre > 0 && baja < 1) {
            var y0 = baja > 0 ? H * U.entra(baja) * 1.05 : 0, y1 = H * U.sale(cubre) * 1.05;
            var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.ola); g.addColorStop(0.3, P.mar[0]); g.addColorStop(1, P.mar[1]);
            c.fillStyle = g; c.fillRect(0, y0, W, Math.max(0, y1 - y0));
            // líneas de agua y la espuma en el borde que avanza
            c.strokeStyle = P.ola; c.globalAlpha = 0.5;
            for (var l = 0; l < 14; l++) { var ly = y0 + (l + 0.5) * (y1 - y0) / 14; c.lineWidth = 1 + l * 0.1; c.beginPath(); for (var x = 0; x <= W; x += 30) { var yy = ly + Math.sin(x * 0.015 + t / 200 + l) * 4; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
            c.globalAlpha = 1;
            var dentro = U.meseta(t, T.rompe + 300, T.cubierto, T.baja, T.baja + 900);
            if (dentro > 0) {
              for (var mi = 0; mi < 7; mi++) {
                var fx = (0.1 + mi * 0.13) * W + (t - T.rompe) * 0.05, fy = H * (0.35 + (mi % 3) * 0.15) + Math.sin(t / 400 + mi) * 20, hm = E.u * ALTOS[mi * 2] * 0.8;
                c.save(); c.globalAlpha = dentro * 0.55; c.translate(fx, fy); c.rotate((t - T.rompe) / 900 * (mi % 2 ? 1 : -1) + mi);
                var gm = A.moaiGeo(0, hm / 2, hm, 0, 0.3); c.fillStyle = P.mar[1]; c.fill(A.camino(gm.silueta)); c.restore();
              }
              c.fillStyle = P.ola; for (var bu = 0; bu < 50; bu++) { var bx = (bu * 131) % W, by = H - ((t / 3 + bu * 97) % H); c.globalAlpha = dentro * 0.5; c.beginPath(); c.arc(bx, by, 1.5 + (bu % 3), 0, TAU); c.stroke(); }
              c.globalAlpha = 1;
            }
            c.fillStyle = P.espuma;
            var borde = baja > 0 ? y0 : y1;
            for (var e = 0; e < 60; e++) { var ex = (e / 60) * W + Math.sin(e * 7.1) * 10, ey = borde + Math.sin(e * 3.3 + t / 90) * 8 * (baja > 0 ? 1 : -1); c.beginPath(); c.arc(ex, ey, 4 + (e % 4) * 2.5, 0, TAU); c.fill(); }
          }
          // los años
          if (t > T.seco - 400 && t < T.grua) S.rotulo(c, '1960', W / 2, H * 0.14, U.meseta(t, T.seco - 400, T.seco, T.grua - 400, T.grua), S.CORAL);
          var r = U.tramo(t, T.grua, T.grua + N * T.porMoai);
          if (t >= T.grua) S.rotulo(c, (r < 1 ? '1992 → ' : '') + Math.round(U.lerp(1992, 1996, r)) + ' · ' + Math.min(N, Math.floor(r * N + (r >= 1 ? 0 : 0))) + ' / 15 EN PIE', W / 2, H * 0.14, U.meseta(t, T.grua, T.grua + 300, D - 1500, D - 400), S.CORAL);
        }
      };
    }
  });
})();
