/* Pascua Incognita · piezas de las escenas
   Lo que dibujan los secretos en vivo, en la misma serigrafía que la isla: figuras, canoas, barcos holandeses, la ola,
   la grúa, la tablilla rongorongo, la brújula, el huevo del manutara y una viñeta enmarcada. Todo en píxeles de pantalla. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, A = RN.arte, PA = RN.paisaje;
  var TAU = Math.PI * 2, CORAL = '#ff7f6e', CREMA = '#f2e3c6';
  var S = RN.esc = { CORAL: CORAL, CREMA: CREMA };

  // dónde está en pantalla algo de la costa (λ, y en altos de pantalla)
  S.pantalla = function (l, y) { return [E.sx(l, 1), y * E.H]; };
  // la geometría de un moái de un ahu (la misma que pinta el paisaje), en píxeles de pantalla
  S.moaiDeAhu = function (lc, n, i, sep, altura, dy, ancho) {
    var u = E.u, y = PA.suelo(lc) + (dy || 0.008), x = (lc + (i - (n - 1) / 2) * sep) * u - E.camX;
    return A.moaiGeo(x, y * u - 2, altura * u, (i - (n - 1) / 2) * 0.003, ancho || 0.3);
  };

  // una figura humana sencilla, de tinta (para los nadadores, los equipos de las cuerdas, la escala)
  S.figura = function (c, x, y, h, color, op) {
    op = op || {}; var t = op.fase || 0, ba = op.brazos == null ? 0.3 : op.brazos;
    c.save(); c.translate(x, y); if (op.izquierda) c.scale(-1, 1);
    c.strokeStyle = color; c.fillStyle = color; c.lineCap = 'round'; c.lineWidth = Math.max(1.4, h * 0.11);
    var pierna = Math.sin(t) * 0.35, cad = -h * 0.48, hom = -h * 0.82;
    c.beginPath(); c.moveTo(0, cad); c.lineTo(Math.sin(pierna) * h * 0.48, 0); c.moveTo(0, cad); c.lineTo(-Math.sin(pierna) * h * 0.48, 0);
    c.moveTo(0, cad); c.lineTo(h * (op.inclina || 0), hom);
    c.moveTo(h * (op.inclina || 0), hom + h * 0.05); c.lineTo(h * (op.inclina || 0) + Math.cos(-ba) * h * 0.38, hom + h * 0.05 - Math.sin(ba) * h * 0.38);
    c.moveTo(h * (op.inclina || 0), hom + h * 0.05); c.lineTo(h * (op.inclina || 0) + Math.cos(-ba - 0.5) * h * 0.34, hom + h * 0.12 - Math.sin(ba - 0.3) * h * 0.3);
    c.stroke();
    c.beginPath(); c.arc(h * (op.inclina || 0) * 1.1, hom - h * 0.11, h * 0.11, 0, TAU); c.fill();
    c.restore();
  };

  // el huevo del manutara (el huevo de Pascua de verdad), con su brillo coral
  S.huevo = function (c, x, y, r, brillo, rot) {
    if (brillo > 0) { var g = c.createRadialGradient(x, y, r * 0.5, x, y, r * (3 + brillo * 3)); g.addColorStop(0, 'rgba(255,127,110,' + (0.55 * brillo).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,127,110,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * (3 + brillo * 3), 0, TAU); c.fill(); }
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = '#efe2c8'; c.beginPath(); c.ellipse(0, 0, r * 0.78, r, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(120,90,70,.45)'; for (var i = 0; i < 9; i++) { c.beginPath(); c.arc(Math.sin(i * 2.4) * r * 0.45, Math.cos(i * 1.7) * r * 0.6, r * 0.07 * (1 + (i % 3) * 0.4), 0, TAU); c.fill(); }
    c.strokeStyle = CORAL; c.lineWidth = Math.max(1, r * 0.08); c.beginPath(); c.ellipse(0, 0, r * 0.78, r, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    c.restore();
  };

  // un manutara (charrán sombrío): alas largas en flecha y cola ahorquillada
  S.manutara = function (c, x, y, s, fase, color) {
    var a = Math.sin(fase) * 0.6;
    c.fillStyle = color; c.beginPath();
    c.moveTo(x - s, y - s * 0.25 * (1 + a)); c.quadraticCurveTo(x - s * 0.4, y - s * 0.2 * (1 + a), x - s * 0.08, y);
    c.lineTo(x + s * 0.35, y - s * 0.02); c.lineTo(x + s * 0.08, y + s * 0.05);
    c.quadraticCurveTo(x - s * 0.4, y - s * 0.05 * (1 + a), x - s, y - s * 0.25 * (1 + a)); c.fill();
    c.beginPath(); c.moveTo(x + s * 0.05, y); c.quadraticCurveTo(x + s * 0.45, y - s * 0.22 * (1 - a), x + s, y - s * 0.3 * (1 - a)); c.quadraticCurveTo(x + s * 0.4, y - s * 0.05 * (1 - a), x + s * 0.05, y + s * 0.05); c.fill();
    c.beginPath(); c.moveTo(x - s * 0.1, y + s * 0.02); c.lineTo(x - s * 0.32, y + s * 0.16); c.lineTo(x - s * 0.18, y + s * 0.03); c.lineTo(x - s * 0.34, y + s * 0.08); c.fill();
  };

  // una canoa doble polinesia (vaka) con su vela de pinza de cangrejo
  S.vaka = function (c, x, y, s, P, fase) {
    var b = Math.sin(fase || 0) * s * 0.04;
    c.save(); c.translate(x, y + b);
    c.fillStyle = P.tronco || '#5a4030';
    [[-0.06, 0], [0.06, 0.04]].forEach(function (q) { c.beginPath(); c.moveTo(-s * 0.5, q[1] * s); c.quadraticCurveTo(-s * 0.55, -s * 0.06 + q[1] * s, -s * 0.6, -s * 0.12 + q[1] * s); c.lineTo(s * 0.55, -s * 0.1 + q[1] * s); c.quadraticCurveTo(s * 0.5, -s * 0.04 + q[1] * s, s * 0.45, q[1] * s); c.closePath(); c.fill(); });
    c.fillRect(-s * 0.3, -s * 0.12, s * 0.62, s * 0.03);
    // la vela: dos pértigas curvas con la tela entre ellas
    c.fillStyle = '#efe3c9'; c.beginPath(); c.moveTo(-s * 0.05, -s * 0.12); c.quadraticCurveTo(-s * 0.35, -s * 0.55, -s * 0.15, -s * 0.85); c.quadraticCurveTo(s * 0.05, -s * 0.55, s * 0.3, -s * 0.7); c.quadraticCurveTo(s * 0.12, -s * 0.4, -s * 0.05, -s * 0.12); c.fill();
    c.strokeStyle = P.tronco || '#5a4030'; c.lineWidth = Math.max(1, s * 0.015); c.stroke();
    c.strokeStyle = CORAL; c.lineWidth = Math.max(1.5, s * 0.025); c.globalAlpha = 0.9; c.beginPath(); c.moveTo(-s * 0.15, -s * 0.85); c.quadraticCurveTo(s * 0.02, -s * 0.5, s * 0.3, -s * 0.7); c.stroke(); c.globalAlpha = 1;
    c.restore();
  };

  // un barco holandés de 1722: casco alto, tres palos con sus velas y la bandera roja, blanca y azul
  S.barco = function (c, x, y, s, P, fase, luz, recoge) {
    var rc = 1 - 0.72 * (recoge || 0);
    var b = Math.sin(fase || 0) * s * 0.025;
    c.save(); c.translate(x, y + b); c.rotate(Math.sin((fase || 0) * 0.8) * 0.02);
    c.fillStyle = P.moaiSombra || '#2a2420';
    c.beginPath(); c.moveTo(-s * 0.5, -s * 0.12); c.lineTo(s * 0.42, -s * 0.12); c.lineTo(s * 0.5, -s * 0.22); c.lineTo(s * 0.36, -s * 0.02); c.lineTo(-s * 0.42, -s * 0.02); c.lineTo(-s * 0.55, -s * 0.26); c.lineTo(-s * 0.4, -s * 0.24); c.closePath(); c.fill();
    c.fillStyle = luz ? '#ffcf7a' : (P.ahuLuz || '#8a7a60'); for (var v = 0; v < 5; v++) c.fillRect(-s * 0.3 + v * s * 0.13, -s * 0.09, s * 0.035, s * 0.03);
    c.strokeStyle = P.moaiSombra || '#2a2420'; c.lineWidth = Math.max(1, s * 0.012);
    [-0.25, 0.02, 0.27].forEach(function (mx, k) {
      var alto = s * (k === 1 ? 0.78 : 0.62);
      c.beginPath(); c.moveTo(mx * s, -s * 0.12); c.lineTo(mx * s, -s * 0.12 - alto); c.stroke();
      c.fillStyle = P.nube || '#efe6d4';
      for (var v2 = 0; v2 < 3; v2++) { var vy = -s * 0.16 - alto * (0.3 * v2 + 0.08), vw = s * (0.2 - v2 * 0.04); var sa = alto * 0.22 * rc, sb = vy - alto * 0.22; c.beginPath(); c.moveTo(mx * s - vw, sb); c.lineTo(mx * s + vw, sb); c.quadraticCurveTo(mx * s + vw * 1.15, sb + sa * 0.55, mx * s + vw * 0.95, sb + sa); c.lineTo(mx * s - vw * 0.95, sb + sa); c.quadraticCurveTo(mx * s - vw * 1.15, sb + sa * 0.55, mx * s - vw, sb); c.fill(); }
    });
    // la bandera de las Provincias Unidas en lo alto del palo mayor
    var fx = 0.02 * s, fy = -s * 0.12 - s * 0.78, ond = Math.sin((fase || 0) * 3) * s * 0.01;
    [['#c8323a', 0], ['#f2ece0', 1], ['#2a4a8c', 2]].forEach(function (q) { c.fillStyle = q[0]; c.fillRect(fx, fy + q[1] * s * 0.03 + ond * q[1] * 0.3, s * 0.13, s * 0.03); });
    c.restore();
  };

  // la ola: una pared de agua que se curva y rompe en garras de espuma (la serigrafía de la ola)
  S.ola = function (c, x0, base, ancho, alto, k, P) {
    var curva = alto * 0.55 * U.clamp(k * 1.4, 0, 1);
    // el perfil: una pared casi pareja de lado a lado, que baja solo en los extremos, con alguna cresta más alta
    var perfil = function (t) { return Math.pow(U.clamp(Math.min(t * 5, (1 - t) * 5), 0, 1), 0.5) * (0.84 + 0.1 * Math.sin(t * 9 + 1) + 0.06 * Math.sin(t * 23)); };
    c.save();
    var g = c.createLinearGradient(0, base - alto, 0, base); g.addColorStop(0, P.ola); g.addColorStop(0.35, P.mar[0]); g.addColorStop(1, P.mar[1]);
    c.fillStyle = g; c.beginPath(); c.moveTo(x0, base + 4);
    for (var i = 0; i <= 60; i++) { var t = i / 60; c.lineTo(x0 + ancho * t, base - alto * perfil(t)); }
    c.lineTo(x0 + ancho, base + 4); c.closePath(); c.fill();
    // las líneas de la pared del agua
    c.strokeStyle = P.ola; c.globalAlpha = 0.5; c.lineWidth = 1.5;
    for (var l = 1; l < 8; l++) { c.beginPath(); for (i = 0; i <= 40; i++) { var tt = i / 40, yy = base - alto * (1 - l / 8) * perfil(tt) + Math.sin(tt * 30 + l) * 2; i ? c.lineTo(x0 + ancho * tt, yy) : c.moveTo(x0 + ancho * tt, yy); } c.stroke(); }
    c.globalAlpha = 1;
    // la espuma: garras que caen desde la cresta y se deshacen en gotas
    c.fillStyle = P.espuma;
    for (var e = 0; e < 70; e++) {
      var te = 0.02 + e / 72, tx = x0 + ancho * te, ty = base - alto * perfil(te);
      c.beginPath(); c.moveTo(tx - alto * 0.02, ty); c.quadraticCurveTo(tx + curva * 0.15, ty - alto * 0.05, tx + curva * 0.3, ty + curva * 0.08); c.quadraticCurveTo(tx + curva * 0.12, ty + alto * 0.01, tx + alto * 0.02, ty + alto * 0.02); c.fill();
      for (var d = 0; d < 3; d++) { c.beginPath(); c.arc(tx + curva * (0.34 + d * 0.08), ty + curva * (0.12 + d * 0.07), Math.max(1, alto * (0.012 - d * 0.003)), 0, TAU); c.fill(); }
    }
    c.restore();
  };

  // la grúa que volvió a levantar Tongariki, con un moái colgando
  S.grua = function (c, x, y, s, k, P) {
    c.save(); c.translate(x, y);
    c.fillStyle = '#e0b23c'; c.fillRect(-s * 0.18, -s * 0.12, s * 0.36, s * 0.12);
    c.fillStyle = '#2a2420'; [-0.12, 0.12].forEach(function (q) { c.beginPath(); c.arc(q * s, 0, s * 0.05, 0, TAU); c.fill(); });
    var ang = -0.9 + k * 0.25, lx = Math.cos(ang) * s * 1.1, ly = Math.sin(ang) * s * 1.1;
    c.strokeStyle = '#e0b23c'; c.lineWidth = s * 0.05; c.lineCap = 'round'; c.beginPath(); c.moveTo(-s * 0.05, -s * 0.12); c.lineTo(lx, ly - s * 0.12); c.stroke();
    c.strokeStyle = '#2a2420'; c.lineWidth = 1.2; var cy = ly - s * 0.12 + s * (0.25 + (1 - k) * 0.25); c.beginPath(); c.moveTo(lx, ly - s * 0.12); c.lineTo(lx, cy); c.stroke();
    var m = A.moaiGeo(lx, cy + s * 0.5, s * 0.5, 0, 0.3); A.moai(c, P, m, { semilla: 5 });
    c.restore();
  };

  // una viñeta enmarcada en papel (como una lámina dentro de la lámina) para contar algo de cerca
  S.vineta = function (c, x, y, w, h, a, dibujo) {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 8, y + 10, w, h);
    c.fillStyle = '#efe3c9'; c.fillRect(x, y, w, h);
    c.save(); c.beginPath(); c.rect(x + 8, y + 8, w - 16, h - 16); c.clip(); dibujo(x + 8, y + 8, w - 16, h - 16); c.restore();
    c.strokeStyle = '#161834'; c.lineWidth = 1.5; c.strokeRect(x + 8, y + 8, w - 16, h - 16);
    c.restore();
  };

  // la tablilla rongorongo: madera con filas de glifos; se gira 180° al cambiar de línea (bustrófedon inverso)
  var GLIFOS = null;
  function glifos() {
    if (GLIFOS) return GLIFOS;
    GLIFOS = [];
    var r = U.azar(1864);
    for (var g = 0; g < 28; g++) {
      var tipo = g % 7, trazos = [];
      if (tipo === 0) trazos = [[[0, -0.5], [0, 0.2]], [[0, 0.2], [-0.25, 0.5]], [[0, 0.2], [0.25, 0.5]], [[0, -0.2], [-0.35, -0.45]], [[0, -0.2], [0.35, -0.1 - r() * 0.4]]];   // figura con brazos
      else if (tipo === 1) trazos = [[[-0.35, 0], [0, -0.3], [0.35, 0], [0, 0.3], [-0.35, 0]], [[0.35, 0], [0.5, -0.15]], [[0.35, 0], [0.5, 0.15]]];                           // pez
      else if (tipo === 2) trazos = [[[-0.3, -0.4], [0, -0.1], [0.3, -0.4]], [[0, -0.1], [0, 0.5]], [[-0.3, 0.2], [0.3, 0.2]]];                                                  // ave de frente
      else if (tipo === 3) trazos = [[[-0.3, -0.45], [0.2, -0.3], [0.3, 0], [0.2, 0.3], [-0.3, 0.45]]];                                                                           // media luna
      else if (tipo === 4) trazos = [[[0, -0.5], [0, 0.5]], [[-0.3, -0.25], [0.3, -0.25]], [[-0.25, 0.15], [0.25, 0.15]]];                                                       // planta
      else if (tipo === 5) trazos = [[[-0.2, -0.5], [0.25, -0.35], [0, -0.15]], [[0, -0.15], [0, 0.5]], [[0, 0.1], [-0.35, -0.05]], [[0, 0.1], [0.3, 0.35]]];                     // hombre pájaro
      else trazos = [[[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [-0.3, -0.3]], [[0, -0.3], [0, -0.55]]];                                                                // casa
      GLIFOS.push(trazos.map(function (t) { return t.map(function (p) { return [p[0] + (r() - 0.5) * 0.08, p[1] + (r() - 0.5) * 0.08]; }); }));
    }
    return GLIFOS;
  }
  S.tablilla = function (c, x, y, w, h, filas, hecho, giro) {
    c.save(); c.translate(x, y); c.rotate(giro || 0);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(8, 10, w / 2, h / 2, 0, 0, TAU); c.fill();
    c.fillStyle = '#6a4a30'; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.clip();
    c.strokeStyle = 'rgba(40,26,14,.4)'; c.lineWidth = 1; for (var v = -h / 2; v < h / 2; v += 5) { c.beginPath(); c.moveTo(-w / 2, v); c.bezierCurveTo(-w / 4, v + 3, w / 4, v - 3, w / 2, v + 1); c.stroke(); }
    var G = glifos(), alto = h * 0.78 / filas, ancho = alto * 0.75, r = U.azar(22);
    for (var f = 0; f < filas; f++) {
      var fy = -h * 0.39 + alto * (f + 0.5), n = Math.floor(w * 0.86 / ancho), lleno = U.clamp(hecho - f, 0, 1);
      c.strokeStyle = 'rgba(30,18,10,.35)'; c.beginPath(); c.moveTo(-w * 0.45, fy + alto * 0.5); c.lineTo(w * 0.45, fy + alto * 0.5); c.stroke();
      for (var k = 0; k < n * lleno; k++) {
        var gx = -w * 0.43 + ancho * (k + 0.5), gl = G[Math.floor(r() * G.length)], sz = alto * 0.38, inv = f % 2 ? -1 : 1;
        c.strokeStyle = '#f1d9a8'; c.lineWidth = Math.max(1, alto * 0.06); c.lineCap = 'round'; c.lineJoin = 'round';
        gl.forEach(function (t) { c.beginPath(); t.forEach(function (p, j) { var px = gx + p[0] * sz * inv, py = fy + p[1] * sz * inv; j ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); });
      }
    }
    c.restore();
    c.strokeStyle = '#3a2618'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU); c.stroke();
    c.restore();
  };

  // una brújula grande (para Te Pito o te Henua)
  S.brujula = function (c, x, y, r, ang, a) {
    c.save(); c.globalAlpha = a; c.translate(x, y);
    c.fillStyle = 'rgba(22,24,52,.85)'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(242,227,198,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, r * 0.92, 0, TAU); c.stroke();
    for (var i = 0; i < 32; i++) { var aa = i / 32 * TAU, l = i % 8 === 0 ? 0.16 : i % 4 === 0 ? 0.1 : 0.05; c.beginPath(); c.moveTo(Math.cos(aa) * r * 0.9, Math.sin(aa) * r * 0.9); c.lineTo(Math.cos(aa) * r * (0.9 - l), Math.sin(aa) * r * (0.9 - l)); c.stroke(); }
    c.fillStyle = CREMA; c.font = '500 ' + Math.round(r * 0.18) + 'px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    ['N', 'E', 'S', 'O'].forEach(function (t, k) { var aa = k * Math.PI / 2 - Math.PI / 2; c.fillText(t, Math.cos(aa) * r * 0.6, Math.sin(aa) * r * 0.6); });
    c.rotate(ang);
    c.fillStyle = CORAL; c.beginPath(); c.moveTo(0, -r * 0.78); c.lineTo(r * 0.09, 0); c.lineTo(-r * 0.09, 0); c.fill();
    c.fillStyle = 'rgba(242,227,198,.6)'; c.beginPath(); c.moveTo(0, r * 0.78); c.lineTo(r * 0.09, 0); c.lineTo(-r * 0.09, 0); c.fill();
    c.fillStyle = CREMA; c.beginPath(); c.arc(0, 0, r * 0.05, 0, TAU); c.fill();
    c.restore();
  };

  // anillos de mana: ondas coral que salen de un punto
  S.mana = function (c, x, y, r, t, a) {
    c.save(); c.strokeStyle = CORAL;
    for (var i = 0; i < 3; i++) { var k = ((t / 1600) + i / 3) % 1; c.globalAlpha = a * (1 - k) * 0.8; c.lineWidth = 2 * (1 - k) + 0.5; c.beginPath(); c.ellipse(x, y, r * (0.4 + k * 1.6), r * (0.4 + k * 1.6) * 0.75, 0, 0, TAU); c.stroke(); }
    c.restore();
  };
  // un rótulo en la escena (mono, versalitas)
  S.rotulo = function (c, txt, x, y, a, color) {
    c.save(); c.globalAlpha = a; c.font = '500 11px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = '2px';
    var w = c.measureText(txt).width + 18; c.fillStyle = 'rgba(22,24,52,.82)'; c.fillRect(x - w / 2, y - 11, w, 22);
    c.fillStyle = color || CREMA; c.fillText(txt, x, y + 0.5); c.restore();
  };
})();
