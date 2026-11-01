/* Secreto 03 · Los ojos del mana (Lugar)
   Pulsar en la cara de uno de los moáis de Ahu Nau Nau (Anakena), donde en 1978 apareció el ojo de coral: se les ponen
   los ojos y despierta su mana. Una vez encontrado, los moáis de Nau Nau se quedan mirando.
   La escena: la luz baja; una chispa coral cae del cielo en cada cuenca y el ojo se abre; una onda de mana recorre el
   suelo y mueve la hierba; a la derecha, la lámina del ojo de coral encontrado en 1978. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2;
  var LC = 6.6, N = 7, SEP = 0.082, ALTOS = [0.21, 0.23, 0.24, 0.235, 0.245, 0.23, 0.22], CON_OJOS = [2, 3, 4, 5, 6];
  var T = { velo: 600, ojos: 1800, porMoai: 650, onda: 5200, lamina: 6200 };
  function moai(i) { return S.moaiDeAhu(LC, N, i, SEP, ALTOS[i]); }
  // un ojo de coral blanco con la pupila de escoria roja; abre = cuánto se ha abierto (0 cerrado … 1)
  function ojo(c, o, abre) {
    var ex = o[0][0], ey = o[0][1] + o[2] * 0.1, ew = o[1] * 0.95, eh = o[2] * 0.95 * abre;
    if (abre <= 0.02) return;
    c.save(); c.beginPath(); c.moveTo(ex - ew, ey); c.quadraticCurveTo(ex, ey - eh * 1.5, ex + ew, ey); c.quadraticCurveTo(ex, ey + eh * 1.5, ex - ew, ey); c.closePath();
    c.fillStyle = '#f4ede0'; c.fill(); c.clip();
    c.fillStyle = '#8a2a22'; c.beginPath(); c.arc(ex, ey + o[2] * 0.05, o[2] * 0.62, 0, TAU); c.fill();
    c.fillStyle = '#16141a'; c.beginPath(); c.arc(ex, ey + o[2] * 0.05, o[2] * 0.3, 0, TAU); c.fill();
    c.restore();
  }
  function ojos(c, abre) { CON_OJOS.forEach(function (i, j) { var m = moai(i); if (m.cx < -100 || m.cx > E.W + 100) return; var a = typeof abre === 'function' ? abre(j) : abre; ojo(c, m.ojoI, a); ojo(c, m.ojoD, a); }); }
  var hallado = function () { return false; };
  PA.enCosta(function (c) { if (hallado() && !(E.escena && E.escena.h.id === 'mata')) ojos(c, 1); });

  RN.registrar({
    id: 'mata', n: 3, nombre: 'Los ojos del mana', tipo: 'Lugar',
    pista: 'Sin ojos, un moái es solo piedra.',
    lugar: function () { return LC; }, radio: 0.3,
    detectar: function (api) {
      hallado = api.hallado;
      api.en('clic', function (d) {
        for (var j = 0; j < CON_OJOS.length; j++) {
          var m = moai(CON_OJOS[j]);
          if (Math.abs(d.x - m.cx) < m.u * 0.75 && d.y > m.base - m.h * 1.02 && d.y < m.base - m.h * 0.45) { api.disparar(); return; }
        }
      });
    },
    escena: function () {
      var D = 12500 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7000, hasta: D - 400, titulo: 'Mata, los ojos', pie: 'Ahu Nau Nau · Anakena · 1978',
          texto: 'Sin ojos, un moái era solo piedra: al ponérselos despertaba su <i>mana</i> y miraba a su gente. En 1978, al restaurar Ahu Nau Nau en Anakena, apareció un ojo de coral blanco con el hueco para una pupila de escoria roja. Así se supo que los moáis de los ahu tuvieron ojos.' },
        inicio: function () { E.irA(LC - 0.05, 1400); },
        cuadro: function (t) { if (t > T.onda && t < T.onda + 2500) E.viento = Math.max(E.viento, 0.9 * (1 - U.tramo(t, T.onda, T.onda + 2500))); },
        costa: function (c, t) {
          var W = E.W, H = E.H;
          // la luz baja un poco: los ojos son lo que brilla
          var velo = U.meseta(t, T.velo, T.velo + 900, D - 2000, D - 400);
          c.fillStyle = 'rgba(10,8,30,' + (0.28 * velo).toFixed(3) + ')'; c.fillRect(0, 0, W, H);
          CON_OJOS.forEach(function (i, j) {
            var m = moai(i), t0 = T.ojos + j * T.porMoai, cae = U.tramo(t, t0, t0 + 380), abierto = U.sale(U.tramo(t, t0 + 380, t0 + 800));
            var ox = (m.ojoI[0][0] + m.ojoD[0][0]) / 2, oy = m.ojoI[0][1];
            // la chispa que cae del cielo a la cara
            if (cae > 0 && cae < 1) { var sy = U.lerp(-20, oy, U.entra(cae)); c.strokeStyle = S.CORAL; c.lineWidth = 2; c.beginPath(); c.moveTo(ox, sy - 60); c.lineTo(ox, sy); c.stroke(); c.fillStyle = '#fff1e0'; c.beginPath(); c.arc(ox, sy, 3, 0, TAU); c.fill(); }
            // el destello al abrirse
            if (abierto > 0) {
              var fl = 1 - U.tramo(t, t0 + 380, t0 + 1300);
              var g = c.createRadialGradient(ox, oy, 0, ox, oy, m.h * (0.25 + 0.5 * (1 - fl))); g.addColorStop(0, 'rgba(255,190,160,' + (0.6 * fl + 0.12).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,127,110,0)');
              c.fillStyle = g; c.beginPath(); c.arc(ox, oy, m.h * 0.8, 0, TAU); c.fill();
            }
          });
          ojos(c, function (j) { var t0 = T.ojos + j * T.porMoai; return U.sale(U.tramo(t, t0 + 380, t0 + 800)); });
          // la onda de mana: anillos que salen del ahu y recorren el suelo
          var ka = U.tramo(t, T.onda, T.onda + 3200);
          if (ka > 0 && ka < 1) {
            var cx = E.sx(LC + 0.08, 1), cy = (PA.suelo(LC) + 0.03) * H;
            c.save(); c.strokeStyle = S.CORAL;
            for (var r = 0; r < 4; r++) { var kk = U.clamp(ka * 1.4 - r * 0.12, 0, 1); if (kk <= 0) continue; c.globalAlpha = (1 - kk) * 0.8; c.lineWidth = 3 * (1 - kk) + 0.6; c.beginPath(); c.ellipse(cx, cy, W * 1.1 * kk, H * 0.22 * kk, 0, 0, TAU); c.stroke(); }
            c.restore();
          }
        },
        frente: function (c, t) {
          // la lámina del ojo de 1978
          var a = U.meseta(t, T.lamina, T.lamina + 700, D - 1400, D - 300); if (a <= 0) return;
          var w = Math.min(E.W * 0.3, E.H * 0.42), h = w * 0.78, x = E.W - w - E.u * 0.06, y = E.H * 0.1 + (1 - a) * 20;
          S.vineta(c, x, y, w, h, a, function (vx, vy, vw, vh) {
            c.fillStyle = '#3b3530'; c.fillRect(vx, vy, vw, vh);
            c.fillStyle = 'rgba(0,0,0,.25)'; for (var p = 0; p < 160; p++) { c.beginPath(); c.arc(vx + U._h(p) * vw, vy + U._h(p * 3.3) * vh, 0.6 + U._h(p * 7) * 1.6, 0, TAU); c.fill(); }
            var ex = vx + vw / 2, ey = vy + vh * 0.46, ew = vw * 0.36, eh = vh * 0.24;
            c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(ex + 6, ey + 8, ew, eh, 0, 0, TAU); c.fill();
            c.fillStyle = '#efe7d8'; c.beginPath(); c.moveTo(ex - ew, ey); c.quadraticCurveTo(ex, ey - eh * 1.9, ex + ew, ey); c.quadraticCurveTo(ex, ey + eh * 1.9, ex - ew, ey); c.fill();
            c.fillStyle = 'rgba(160,140,120,.45)'; for (p = 0; p < 70; p++) { var a2 = U._h(p * 1.7) * TAU, rr = Math.sqrt(U._h(p * 2.9)) * ew * 0.9; c.beginPath(); c.arc(ex + Math.cos(a2) * rr, ey + Math.sin(a2) * rr * 0.45, 0.8, 0, TAU); c.fill(); }
            c.fillStyle = '#8a2a22'; c.beginPath(); c.arc(ex, ey, eh * 0.62, 0, TAU); c.fill();
            c.fillStyle = 'rgba(40,10,10,.5)'; for (p = 0; p < 18; p++) { c.beginPath(); c.arc(ex + (U._h(p * 4.1) - 0.5) * eh, ey + (U._h(p * 5.3) - 0.5) * eh, 1 + U._h(p) * 1.5, 0, TAU); c.fill(); }
            c.strokeStyle = S.CORAL; c.lineWidth = 2; c.beginPath(); c.moveTo(ex - ew, ey); c.quadraticCurveTo(ex, ey - eh * 1.9, ex + ew, ey); c.stroke();
            c.font = '500 ' + Math.round(Math.min(vh * 0.07, vw * 0.034)) + 'px "IBM Plex Mono", monospace'; c.fillStyle = '#f2e3c6'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
            c.fillText('OJO DE CORAL · AHU NAU NAU · 1978', ex, vy + vh - vh * 0.08);
          });
        }
      };
    }
  });
})();
