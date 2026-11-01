/* Secreto 05 · Te Pito o te Henua (Lugar)
   Pulsar la piedra redonda junto a Ahu Te Pito Kura.
   La escena: la piedra se enciende; alrededor, como limaduras de hierro sobre un papel, se dibuja su campo magnético
   desde dentro hacia fuera; las piedrecitas tiemblan; la brújula apunta al norte y luego gira sin rumbo. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, S = RN.esc;
  var TAU = Math.PI * 2, LC = PA.lugar('pito');
  function piedra() { var y = PA.suelo(LC) + 0.07, r = 0.028; return { x: E.sx(LC, 1), y: (y - r * 0.85) * E.H, r: r * E.u, base: y * E.H }; }
  // las limaduras: puntos fijos alrededor de la piedra (en el plano del suelo, aplastado)
  var LIMA = (function () { var r = U.azar(808), out = []; for (var i = 0; i < 900; i++) { var a = r() * TAU, d = 1.3 + Math.pow(r(), 0.7) * 7.5; out.push([Math.cos(a) * d, Math.sin(a) * d, r()]); } return out; })();

  RN.registrar({
    id: 'pito', n: 5, nombre: 'Te Pito o te Henua', tipo: 'Lugar',
    pista: 'En el ombligo del mundo, la brújula pierde el norte.',
    lugar: function () { return LC; }, radio: 0.25,
    detectar: function (api) {
      api.en('clic', function (d) { var p = piedra(); if (Math.hypot(d.x - p.x, d.y - p.y) < p.r * 1.5) api.disparar(); });
    },
    escena: function () {
      var D = 12000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 6200, hasta: D - 400, titulo: 'Te Pito o te Henua', pie: 'Ahu Te Pito Kura · costa norte',
          texto: '«El ombligo del mundo»: una piedra casi esférica de unos 80 cm, pulida y rodeada por un círculo de piedras junto a Ahu Te Pito Kura. Según la tradición la trajo Hotu Matu’a desde su tierra, Hiva. Tiene tanto hierro que, dicen, encima de ella las brújulas pierden el norte.' },
        inicio: function () { E.irA(LC + 0.2, 1400); },
        costa: function (c, t) {
          var p = piedra(), a = U.meseta(t, 1200, 2000, D - 1500, D - 200); if (a <= 0) return;
          var cy = p.base - p.r * 0.2, F = 0.42, R = p.r, k = U.sale(U.tramo(t, 1600, 5200));
          // el campo de un imán con el eje norte-sur en horizontal: cada limadura se orienta por el campo
          c.save(); c.strokeStyle = 'rgba(20,18,30,.75)'; c.lineCap = 'round';
          for (var i = 0; i < LIMA.length; i++) {
            var q = LIMA[i], d = Math.hypot(q[0], q[1]); if (d > 1.3 + k * 7.5) continue;
            var ux = q[0] / d, uy = q[1] / d, dot = ux;   // m = (1, 0)
            var bx = 3 * dot * ux - 1, by = 3 * dot * uy, ang = Math.atan2(by, bx) + Math.sin(t / 300 + q[2] * 20) * 0.08 * (1 - k);
            var x = p.x + q[0] * R, y = cy + q[1] * R * F, l = R * 0.22 * (1.2 - d / 10);
            c.globalAlpha = a * (0.4 + 0.6 * (1 - d / 9));
            c.lineWidth = 1.3; c.beginPath(); c.moveTo(x - Math.cos(ang) * l, y - Math.sin(ang) * l * F); c.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l * F); c.stroke();
          }
          c.restore();
          // líneas de campo principales, en coral, que se dibujan
          c.save(); c.strokeStyle = S.CORAL; c.lineWidth = 1.6; c.globalAlpha = a * 0.85;
          for (var j = 1; j <= 4; j++) {
            var Lj = 2.2 * j, n = 60, lado;
            for (lado = -1; lado <= 1; lado += 2) {
              c.beginPath();
              for (var s = 0; s <= n * k; s++) { var th = s / n * Math.PI, rr = Lj * Math.pow(Math.sin(th), 2); var x2 = p.x + rr * Math.cos(th) * R, y2 = cy + lado * rr * Math.sin(th) * R * F; s ? c.lineTo(x2, y2) : c.moveTo(x2, y2); }
              c.stroke();
            }
          }
          c.restore();
          // la piedra se enciende
          var g = c.createRadialGradient(p.x, p.y, R * 0.4, p.x, p.y, R * 3); g.addColorStop(0, 'rgba(255,127,110,' + (0.35 * a * (0.8 + 0.2 * Math.sin(t / 250))).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,127,110,0)');
          c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, R * 3, 0, TAU); c.fill();
          // las piedrecitas que tiemblan
          var P = PA.paleta(), tiembla = U.tramo(t, 2600, 3400);
          for (var m = 0; m < 10; m++) { var aa = m / 10 * TAU + 0.4, dd = R * (2.2 + (m % 3) * 0.6), px = p.x + Math.cos(aa) * dd + Math.sin(t / 37 + m) * 1.6 * tiembla, py = cy + Math.sin(aa) * dd * F + Math.cos(t / 41 + m) * 1.2 * tiembla; c.fillStyle = P.roca; c.beginPath(); c.ellipse(px, py, 3.5, 2.4, 0, 0, TAU); c.fill(); c.strokeStyle = P.rocaLuz; c.lineWidth = 1; c.beginPath(); c.ellipse(px, py, 3, 2, 0, Math.PI, Math.PI * 1.6); c.stroke(); }
        },
        frente: function (c, t) {
          var a = U.meseta(t, 1400, 2200, D - 1500, D - 200); if (a <= 0) return;
          var loca = U.tramo(t, 3000, 4000), ang = U.lerp(0, Math.sin(t / 170) * 2.2 + t / 260 + Math.sin(t / 53) * 0.6, loca);
          var r = Math.min(E.W, E.H) * 0.11, x = E.W - r - E.u * 0.06, y = E.H * 0.3;
          S.brujula(c, x, y, r, ang, a);
          S.rotulo(c, loca > 0.5 ? 'RUMBO · ' + ((Math.round(ang * 57.3) % 360 + 360) % 360) + '°' : 'RUMBO · N 000°', x, y + r + 22, a, loca > 0.5 ? S.CORAL : S.CREMA);
        }
      };
    }
  });
})();
