/* Secreto 04 · Ahu Akivi (Espera)
   Quedarse quieto 35 s delante de Ahu Akivi (con la bitácora cerrada).
   La escena: el día corre (las sombras vivas giran y se alargan, el reloj avanza) y el sol baja por su trayectoria,
   dibujada a puntos, hasta ponerse justo delante de los siete; las líneas de mirada de los siete convergen en él. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2, LC = 4.05, ESPERA = 35000, HORA = 18.95;
  var ALTOS = [0.2, 0.21, 0.205, 0.215, 0.205, 0.21, 0.2];
  var armado = true;
  function hhmm(h) { var hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return U.dos(hh) + ':' + U.dos(mm); }

  RN.registrar({
    id: 'akivi', n: 4, nombre: 'Ahu Akivi', tipo: 'Espera',
    pista: 'Siete miran al mar. Quédate con ellos hasta que el sol se ponga.',
    detectar: function (api) {
      api.en('cuadro', function (d) {
        var cerca = Math.abs(E.centro() - LC) < 0.45, abierto = document.documentElement.classList.contains('cuaderno-abierto');
        if (!cerca || d.inactivo < 1000) armado = true;
        if (armado && cerca && !abierto && d.inactivo >= ESPERA) { armado = false; api.disparar(); }
      });
    },
    escena: function () {
      var D = 13500 + E.lectura, h0, d0, objetivo, TL = [1500, 8500];
      function hora(t) { return U.lerp(h0, HORA, U.inOut(U.tramo(t, TL[0], TL[1]))); }
      return {
        duracion: D, detenerDia: true,
        tarjeta: { en: 8800, hasta: D - 400, titulo: 'Ahu Akivi', pie: 'Ahu Akivi · el equinoccio · restaurado en 1960',
          texto: 'Son siete y, a diferencia de casi todos, miran hacia el mar: están orientados hacia el punto por donde se pone el sol en el equinoccio. Según la tradición, son los siete exploradores que Hotu Matu’a envió por delante. Los volvieron a levantar William Mulloy y Gonzalo Figueroa en 1960.' },
        inicio: function () {
          E.irA(LC, 1500); h0 = Math.min(PA.hora, 16.2); if (PA.hora > HORA || PA.hora < 6) h0 = 15.2; d0 = PA.desvioSol;
          var s = (HORA - 6.9) / 12.2; objetivo = 0.5 - (0.84 - 0.56 * s);
        },
        cuadro: function (t) {
          var k = U.inOut(U.tramo(t, TL[0], TL[1]));
          PA.hora = hora(t);
          PA.desvioSol = U.lerp(d0, objetivo + (E.sx(LC, 1) / E.W) - 0.5, k);
        },
        cielo: function (c, t) {
          // la trayectoria que va a seguir el sol, a puntos, y por dónde va
          var a = U.meseta(t, 1200, 2000, TL[1] + 400, TL[1] + 1600);
          if (a > 0) {
            c.save(); c.fillStyle = 'rgba(255,240,220,' + (0.75 * a).toFixed(3) + ')';
            for (var i = 0; i <= 40; i++) { var hh = U.lerp(h0, HORA + 0.25, i / 40), p = PA.sol(hh); if (p.y > PA.HOR * E.H + 4) continue; c.beginPath(); c.arc(p.x, p.y, 1.8, 0, TAU); c.fill(); }
            c.restore();
          }
          // los rayos del sol entre los moáis, como en un cartel
          var so = PA.sol(), ar = U.meseta(t, TL[1] - 1500, TL[1], D - 2500, D - 300); if (ar <= 0) return;
          c.save(); c.globalAlpha = ar * 0.2; c.fillStyle = '#ffb48a';
          for (var r = 0; r < 9; r++) { var ang = -Math.PI + 0.12 + r * (Math.PI - 0.24) / 8; c.beginPath(); c.moveTo(so.x, so.y); c.lineTo(so.x + Math.cos(ang - 0.04) * E.W, so.y + Math.sin(ang - 0.04) * E.W); c.lineTo(so.x + Math.cos(ang + 0.04) * E.W, so.y + Math.sin(ang + 0.04) * E.W); c.fill(); }
          c.restore();
        },
        frente: function (c, t) {
          var so = PA.sol(), H = E.H;
          // las líneas de mirada: de la cabeza de cada uno al punto del ocaso; se tensan a medida que el sol llega
          var al = U.meseta(t, 3000, 5500, D - 2000, D - 400);
          if (al > 0) {
            c.save(); c.strokeStyle = S.CORAL; c.lineWidth = 1.4; c.setLineDash([4, 6]); c.lineDashOffset = -t / 40;
            for (var i = 0; i < 7; i++) {
              var m = S.moaiDeAhu(LC, 7, i, 0.08, ALTOS[i], 0.006), hx = m.cx, hy = m.base - m.h * 0.86, k = U.tramo(t, 3000 + i * 150, 6000 + i * 150);
              c.globalAlpha = al * 0.85; c.beginPath(); c.moveTo(hx, hy); c.lineTo(U.lerp(hx, so.x, k), U.lerp(hy, so.y, k)); c.stroke();
              c.setLineDash([]); c.fillStyle = S.CORAL; c.beginPath(); c.arc(hx, hy, 2.5, 0, TAU); c.fill(); c.setLineDash([4, 6]);
            }
            c.restore();
          }
          // el reloj del día que corre
          var ar = U.meseta(t, 1200, 1700, TL[1] + 600, TL[1] + 1300);
          if (ar > 0) S.rotulo(c, 'AHU AKIVI · ' + hhmm(PA.hora), E.W / 2, H * 0.14, ar, S.CREMA);
          // el rótulo: el punto exacto del ocaso del equinoccio
          var a = U.meseta(t, TL[1] - 300, TL[1] + 400, D - 2000, D - 400);
          if (a > 0) S.rotulo(c, 'OCASO DEL EQUINOCCIO', so.x, PA.HOR * H + H * 0.035, a, S.CORAL);
        }
      };
    }
  });
})();
