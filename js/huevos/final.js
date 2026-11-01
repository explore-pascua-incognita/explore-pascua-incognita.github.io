/* Pascua Incognita · el final
   Con los diez: el huevo del manutara (el huevo de Pascua de verdad) se dibuja en el cielo con los petroglifos del Hombre
   Pájaro, se abre en rayos coral y el «in» del título se tacha: «Pascua cognita». Después, los créditos. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, S = RN.esc;
  var TAU = Math.PI * 2;
  function duracion(ms) {
    var m = Math.round(ms / 60000); if (m < 60) return m + ' min';
    var h = Math.floor(m / 60); if (h < 48) return h + ' h ' + U.dos(m % 60) + ' min';
    return Math.round(h / 24) + ' días';
  }
  function fecha(ms) { var d = new Date(ms); return U.dos(d.getDate()) + '.' + U.dos(d.getMonth() + 1) + '.' + d.getFullYear(); }

  RN.registrarFinal({
    escena: function (motor, datos) {
      var D = 13000 + E.lectura, tiene = isFinite(datos.desde) && datos.hasta;
      return {
        duracion: D,
        tarjeta: { en: 6500, hasta: D - 400, titulo: 'Pascua cognita',
          texto: 'Has encontrado los diez secretos de Rapa Nui. Una de las islas habitadas más aisladas del mundo, a más de 3.500 km de cualquier continente, ya no es incógnita para ti.' + (tiene ? ' Te ha llevado ' + duracion(datos.hasta - datos.desde) + '.' : ''),
          pie: tiene ? fecha(datos.desde) + ' — ' + fecha(datos.hasta) : 'Rapa Nui · 10 / 10' },
        inicio: function () { document.documentElement.classList.add('cognita'); },
        frente: function (c, t) {
          var a = U.meseta(t, 300, 1500, D - 1500, D - 200); if (a <= 0) return;
          c.fillStyle = 'rgba(22,24,52,' + (0.5 * a).toFixed(3) + ')'; c.fillRect(0, 0, E.W, E.H);
          var x = E.W * (E.W > 800 ? 0.62 : 0.5), y = E.H * (E.W > 800 ? 0.42 : 0.3), r = Math.min(E.W, E.H) * 0.16;
          // diez luces, una por secreto, llegan desde toda la costa y entran en el huevo
          for (var q = 0; q < 10; q++) {
            var kq = U.inOut(U.tramo(t, 200 + q * 110, 1700 + q * 110)); if (kq <= 0 || kq >= 1) continue;
            var ox = E.W * (0.04 + q * 0.1), oy = E.H * (0.62 + (q % 3) * 0.08), mx = (ox + x) / 2, my = Math.min(oy, y) - E.H * 0.25;
            var lx = (1 - kq) * (1 - kq) * ox + 2 * (1 - kq) * kq * mx + kq * kq * x, ly = (1 - kq) * (1 - kq) * oy + 2 * (1 - kq) * kq * my + kq * kq * y;
            var gq = c.createRadialGradient(lx, ly, 0, lx, ly, 16); gq.addColorStop(0, 'rgba(255,236,220,.95)'); gq.addColorStop(1, 'rgba(255,127,110,0)');
            c.fillStyle = gq; c.beginPath(); c.arc(lx, ly, 16, 0, TAU); c.fill();
          }
          // los rayos al abrirse
          var ab = U.tramo(t, 4200, 6500);
          if (ab > 0) {
            c.save(); c.globalAlpha = a * ab * 0.75; c.fillStyle = S.CORAL;
            for (var i = 0; i < 24; i++) { var ang = i / 24 * TAU + t / 5000, w2 = i % 2 ? 0.018 : 0.035; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ang - w2) * r * 4 * ab, y + Math.sin(ang - w2) * r * 4 * ab); c.lineTo(x + Math.cos(ang + w2) * r * 4 * ab, y + Math.sin(ang + w2) * r * 4 * ab); c.fill(); }
            c.restore();
          }
          // el huevo: abajo la mitad que se queda; arriba la que se levanta y gira; la luz sale de dentro
          var luz = c.createRadialGradient(x, y, r * 0.2, x, y, r * (1.4 + ab * 1.2)); luz.addColorStop(0, 'rgba(255,200,170,' + (0.9 * ab * a).toFixed(3) + ')'); luz.addColorStop(1, 'rgba(255,127,110,0)');
          c.fillStyle = luz; c.beginPath(); c.arc(x, y, r * (1.4 + ab * 1.2), 0, TAU); c.fill();
          var mitad = function (arriba) {
            c.save(); c.globalAlpha = a; c.beginPath();
            for (var j = 0; j <= 10; j++) { var px = x - r * 0.8 + r * 1.6 * j / 10, py = y + (j % 2 ? -1 : 1) * r * 0.07; j ? c.lineTo(px, py) : c.moveTo(px, py); }
            if (arriba) { c.lineTo(x + r, y - r * 1.2); c.lineTo(x - r, y - r * 1.2); } else { c.lineTo(x + r, y + r * 1.2); c.lineTo(x - r, y + r * 1.2); }
            c.closePath(); c.clip();
            if (arriba && ab > 0) { c.translate(x + r * 0.5, y); c.rotate(-ab * 0.5); c.translate(-(x + r * 0.5), -(y + ab * r * 0.35)); }
            S.huevo(c, x, y, r, 0, 0);
            // la trama de sombra y los petroglifos del Hombre Pájaro sobre la cáscara
            c.strokeStyle = 'rgba(80,60,50,.25)'; c.lineWidth = 1; for (var hh = -r; hh < r * 2; hh += 5) { c.beginPath(); c.moveTo(x + r * 0.1 + hh * 0.3, y - r); c.lineTo(x + r * 0.1 + hh * 0.3 + r * 0.5, y + r); c.stroke(); }
            var g = U.tramo(t, 1500, 4000), k = r * 0.62;
            c.strokeStyle = S.CORAL; c.lineWidth = Math.max(2, r * 0.035); c.lineCap = 'round'; c.setLineDash([k * 7 * g, 9999]);
            c.beginPath(); c.moveTo(x - k * 0.3, y + k * 0.55); c.quadraticCurveTo(x - k * 0.5, y - k * 0.05, x, y - k * 0.25); c.quadraticCurveTo(x + k * 0.3, y - k * 0.5, x + k * 0.15, y - k * 0.65);
            c.quadraticCurveTo(x + k * 0.55, y - k * 0.7, x + k * 0.6, y - k * 0.45); c.moveTo(x, y - k * 0.25); c.quadraticCurveTo(x + k * 0.35, y + k * 0.05, x + k * 0.25, y + k * 0.4); c.lineTo(x + k * 0.45, y + k * 0.55); c.stroke();
            c.setLineDash([]); c.beginPath(); c.arc(x + k * 0.25, y - k * 0.53, k * 0.04, 0, TAU); c.stroke();
            c.restore();
          };
          mitad(false); mitad(true);
        }
      };
    }
  });
})();
