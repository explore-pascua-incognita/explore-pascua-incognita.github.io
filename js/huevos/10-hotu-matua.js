/* Secreto 10 · Las estrellas de Hotu Matu'a (Mirada)
   De noche, dejar el cursor 1,5 s sobre la Cruz del Sur (o tocarla).
   La escena: la Cruz se une con líneas y alrededor se dibuja una brújula de estrellas; un camino de luz baja del cielo
   hasta Anakena; llegan las dos canoas, la gente baja a la playa y se enciende un fuego. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2, ANAKENA = 6.35;
  var T = { cruz: 200, rosa: 900, camino: 2200, camara: 1500, canoas: 4200, playa: 10200, fuego: 10800 };
  var mirando = 0, armado = true;
  function sobreCruz(x, y) { if (PA.peso('noche') < 0.6) return false; var c = PA.cruz(); return Math.hypot(x - c.x, y - c.y) < c.r; }

  RN.registrar({
    id: 'hotu-matua', n: 10, nombre: 'Las estrellas de Hotu Matu’a', tipo: 'Mirada',
    pista: 'De noche, las estrellas llevan a la playa donde desembarcó el primer rey.',
    detectar: function (api) {
      api.en('cuadro', function (d) {
        var p = E.puntero;
        if (p.sobre && p.tipo === 'mouse' && sobreCruz(p.x, p.y)) { mirando += d.dt; if (armado && mirando > 1500) { armado = false; api.disparar(); } }
        else { mirando = 0; armado = true; }
      });
      api.en('clic', function (d) { if (sobreCruz(d.x, d.y)) api.disparar(); });
    },
    escena: function () {
      var D = 14500 + E.lectura, movida = false;
      function canoa(i, t) {
        var kk = U.inOut(U.tramo(t, T.canoas + i * 700, T.playa + i * 300)), x = E.sx(ANAKENA, 1) + (i ? 1 : -1) * E.u * (0.05 + 0.04 * kk);
        return { x: x, y: U.lerp(PA.HOR * E.H + 4, (PA.suelo(ANAKENA) + 0.012) * E.H, kk), s: E.H * (0.03 + kk * 0.1), k: kk };
      }
      return {
        duracion: D, detenerDia: true,
        tarjeta: { en: 9200, hasta: D - 400, titulo: 'Hotu Matu’a', pie: 'Anakena · según la tradición',
          texto: 'Según la tradición, el primer rey de Rapa Nui llegó desde Hiva guiado por el sueño de su sacerdote, Hau Maka, que había visto la isla. Mandó siete exploradores por delante y desembarcó con dos grandes canoas en Anakena. Los navegantes polinesios cruzaban el océano leyendo las estrellas.' },
        cuadro: function (t) { if (t > T.camara && !movida) { movida = true; E.irA(ANAKENA, 3000); } },
        cielo: function (c, t) {
          var a = U.meseta(t, T.cruz, T.cruz + 800, D - 1500, D - 300), cz = PA.cruz();
          // el brillo y las líneas de la constelación
          var g = c.createRadialGradient(cz.x, cz.y, 0, cz.x, cz.y, cz.r * 2); g.addColorStop(0, 'rgba(255,127,110,' + (0.28 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,127,110,0)');
          c.fillStyle = g; c.beginPath(); c.arc(cz.x, cz.y, cz.r * 2, 0, TAU); c.fill();
          var p = cz.pts, kl = U.tramo(t, T.cruz, T.cruz + 1200);
          c.save(); c.strokeStyle = S.CORAL; c.lineWidth = 1.5; c.globalAlpha = a * kl;
          c.beginPath(); c.moveTo(p[0][0], p[0][1]); c.lineTo(p[2][0], p[2][1]); c.moveTo(p[1][0], p[1][1]); c.lineTo(p[3][0], p[3][1]); c.moveTo(p[5][0], p[5][1]); c.lineTo(p[6][0], p[6][1]); c.stroke();
          p.forEach(function (q, i) { c.fillStyle = '#fff4ec'; c.beginPath(); c.arc(q[0], q[1], i < 5 ? 2.4 : 2, 0, TAU); c.fill(); });
          // la brújula de estrellas: un anillo de 32 casas alrededor de la Cruz
          var kr = U.sale(U.tramo(t, T.rosa, T.rosa + 1600)), R = E.H * 0.2;
          c.globalAlpha = a * 0.7; c.strokeStyle = 'rgba(242,227,198,.8)'; c.lineWidth = 1;
          c.beginPath(); c.arc(cz.x, cz.y, R, -Math.PI / 2, -Math.PI / 2 + TAU * kr); c.stroke();
          for (var i = 0; i < 32 * kr; i++) { var an = -Math.PI / 2 + i / 32 * TAU, l = i % 8 === 0 ? 14 : i % 4 === 0 ? 9 : 5; c.beginPath(); c.moveTo(cz.x + Math.cos(an) * R, cz.y + Math.sin(an) * R); c.lineTo(cz.x + Math.cos(an) * (R - l), cz.y + Math.sin(an) * (R - l)); c.stroke(); }
          c.restore();
          // el camino de luz: puntos que bajan de la Cruz hasta el horizonte de Anakena, y una chispa que lo recorre
          var k = U.tramo(t, T.camino, T.camino + 2600), fin = [E.sx(ANAKENA, 1), PA.HOR * E.H], ctl = [U.lerp(cz.x, fin[0], 0.2), U.lerp(cz.y, fin[1], 0.85)];
          var punto = function (f) { return [(1 - f) * (1 - f) * cz.x + 2 * (1 - f) * f * ctl[0] + f * f * fin[0], (1 - f) * (1 - f) * cz.y + 2 * (1 - f) * f * ctl[1] + f * f * fin[1]]; };
          c.save(); c.globalAlpha = a; c.fillStyle = S.CORAL;
          for (var d = 0; d <= 40 * k; d++) { var q = punto(d / 40); c.beginPath(); c.arc(q[0], q[1], 1.6 + (d % 4 === 0 ? 1 : 0), 0, TAU); c.fill(); }
          if (k > 0 && k < 1) { var sp = punto(k), gs = c.createRadialGradient(sp[0], sp[1], 0, sp[0], sp[1], 18); gs.addColorStop(0, 'rgba(255,240,230,.95)'); gs.addColorStop(1, 'rgba(255,127,110,0)'); c.fillStyle = gs; c.beginPath(); c.arc(sp[0], sp[1], 18, 0, TAU); c.fill(); }
          c.restore();
        },
        costa: function (c, t) {
          var P = PA.paleta();
          // las dos canoas, con su estela
          for (var i = 0; i < 2; i++) {
            if (t < T.canoas + i * 700) continue;
            var cn = canoa(i, t);
            if (cn.k < 1) { c.save(); c.strokeStyle = P.espuma; c.globalAlpha = 0.6 * (1 - cn.k * 0.6); c.lineWidth = 1.5; c.beginPath(); c.moveTo(cn.x - cn.s * 0.5, cn.y + 2); c.lineTo(cn.x - cn.s * 1.1, cn.y - cn.s * 0.25); c.moveTo(cn.x + cn.s * 0.5, cn.y + 2); c.lineTo(cn.x + cn.s * 1.1, cn.y - cn.s * 0.25); c.stroke(); c.restore(); }
            S.vaka(c, cn.x, cn.y, cn.s, P, t / 500 + i);
          }
          // la gente baja a la playa
          var kp = U.tramo(t, T.playa, T.playa + 2600), yb = (PA.suelo(ANAKENA) + 0.03) * E.H, x0 = E.sx(ANAKENA, 1);
          if (kp > 0) for (var j = 0; j < 7; j++) { var kj = U.clamp(kp * 1.6 - j * 0.1, 0, 1); if (kj <= 0) continue; S.figura(c, x0 + (j - 3) * E.u * 0.022 + kj * E.u * 0.02 * ((j % 2) ? 1 : -1), U.lerp(yb - E.H * 0.012, yb + E.H * 0.03 * (j % 3), kj), E.H * 0.04, '#0e0c18', { fase: t / 180 + j, brazos: j === 3 ? 1.3 : 0.3 }); }
          // el fuego en la playa
          var kf = U.tramo(t, T.fuego, T.fuego + 1200);
          if (kf > 0) {
            var fx = x0 + E.u * 0.09, fy = yb + E.H * 0.035, fl = 0.85 + 0.15 * Math.sin(t / 60) * Math.sin(t / 97);
            var gf = c.createRadialGradient(fx, fy, 0, fx, fy, E.H * 0.14 * kf); gf.addColorStop(0, 'rgba(255,170,110,' + (0.5 * kf * fl).toFixed(3) + ')'); gf.addColorStop(1, 'rgba(255,127,110,0)');
            c.fillStyle = gf; c.beginPath(); c.arc(fx, fy, E.H * 0.14, 0, TAU); c.fill();
            c.fillStyle = '#ffd08a'; c.beginPath(); c.moveTo(fx - 7 * kf, fy); c.quadraticCurveTo(fx - 4, fy - 16 * kf * fl, fx, fy - 24 * kf * fl); c.quadraticCurveTo(fx + 4, fy - 16 * kf * fl, fx + 7 * kf, fy); c.fill();
            c.fillStyle = S.CORAL; c.beginPath(); c.moveTo(fx - 4 * kf, fy); c.quadraticCurveTo(fx, fy - 12 * kf * fl, fx + 4 * kf, fy); c.fill();
            for (var e = 0; e < 6; e++) { var ke = ((t / 900) + e / 6) % 1; c.fillStyle = 'rgba(255,200,140,' + (1 - ke).toFixed(2) + ')'; c.fillRect(fx + Math.sin(e * 3 + t / 300) * 8, fy - 20 - ke * 50, 2, 2); }
          }
        }
      };
    }
  });
})();
