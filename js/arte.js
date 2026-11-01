/* Pascua Incognita · arte
   Las piezas de la costa en serigrafía: tintas planas, trama de líneas en las sombras, la luz de borde del sol (o de la
   luna) y, en las paletas de día, la tinta coral impresa un poco movida (desregistro), como en un cartel de verdad.
   Cada pieza se pinta con una paleta (A.PALETAS: dia, ocaso, noche); el paisaje las cachea por teselas.
   Todo en píxeles; la anatomía de los moáis sigue la real (cabeza alargada, frente pesada, nariz larga y ancha abajo,
   labios hacia fuera, orejas largas, manos de dedos largos sobre el vientre y el cinturón «hami»). */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util;
  var TAU = Math.PI * 2;
  var A = RN.arte = {};

  /* ---------- las paletas ---------- */
  A.PALETAS = {
    dia: {
      nombre: 'dia', desregistro: true, sombra: [0.18, 0.16, 0.22],
      sol: '#fff4d6', halo: 'rgba(255,245,215,.5)', nube: '#fbf8f1', nubeSombra: '#e3d9cc', ave: '#263049',
      mar: ['#356aa8', '#1e4479'], ola: '#a9cdee', reflejo: '#ffffff', espuma: '#ffffff',
      lejos: '#5f7690', lejosLuz: '#8aa2b8',
      volcan: '#6c7a50', volcanLuz: '#97a46b', volcanSombra: '#4d5a3a', cantera: '#b7a27a', bruma: 'rgba(225,235,245,.4)',
      medio: '#5b7743', medioLuz: '#89a35c', medioSombra: '#435a31',
      hierba: ['#7f9d48', '#4a632d'], loma: 'rgba(20,40,10,', mata: '#3b5026', mataLuz: '#d6dd8a', crestaLuz: '#e6eaa0',
      tierra: '#9a7c56', arena: '#efdfbf', arenaSombra: '#d3bf98', arenaMojada: '#b9a684',
      roca: '#3b3834', rocaCara: '#625c53', rocaLuz: '#b8ae9c',
      acantilado: '#7a5240', acantiladoLuz: '#b07a5c', acantiladoSombra: '#4e3328',
      ahu: '#5f584d', ahuLuz: '#9a8f7b', ahuLinea: '#3b352e', canto: '#4b463f',
      moai: '#857867', moaiSombra: '#4c4437', labio: '#6b5f4f', borde: '#e7dcc3', poro: '#5e5446', trama: 'rgba(40,34,30,.42)',
      pukao: '#94442f', pukaoLuz: '#bd6446', ojo: '#f4efe4', pupila: '#16141a', liquen: '#d9a63c',
      casa: '#77705f', casaLinea: '#4f4a40', cesped: '#6f8c3e',
      palma: '#36552c', palmaLuz: '#7fa04c', tronco: '#7b6347', troncoLuz: '#a88d6a',
      caballo: '#5a3f2c', crin: '#2a1d14'
    },
    dorada: {
      nombre: 'dorada', desregistro: true, sombra: [0.35, 0.4, 0.26],
      sol: '#ffd27a', halo: 'rgba(255,215,140,.45)', nube: '#f6e4c6', nubeSombra: '#eaa57a', ave: '#262640',
      mar: ['#3a5d93', '#22406e'], ola: '#e8c9a0', reflejo: '#ffe2a8', espuma: '#fff3dc',
      lejos: '#6a6884', lejosLuz: '#c9a07a',
      volcan: '#59613f', volcanLuz: '#cfa760', volcanSombra: '#3f4630', cantera: '#a68b62', bruma: 'rgba(255,210,150,.32)',
      medio: '#4f6439', medioLuz: '#cba45a', medioSombra: '#384a29',
      hierba: ['#738b3d', '#3d5123'], loma: 'rgba(20,20,0,', mata: '#33461f', mataLuz: '#f0c56a', crestaLuz: '#f4c870',
      tierra: '#8c6c47', arena: '#e8cfa0', arenaSombra: '#c9a97a', arenaMojada: '#a88a64',
      roca: '#34302b', rocaCara: '#5c5246', rocaLuz: '#f2b876',
      acantilado: '#70473a', acantiladoLuz: '#e48e5c', acantiladoSombra: '#422920',
      ahu: '#554d42', ahuLuz: '#b48c62', ahuLinea: '#302a24', canto: '#413c36',
      moai: '#6f6353', moaiSombra: '#3a3229', labio: '#594e41', borde: '#ffc47c', poro: '#4d4439', trama: 'rgba(40,28,20,.45)',
      pukao: '#8e3f2a', pukaoLuz: '#c9603e', ojo: '#f6ecd8', pupila: '#16141a', liquen: '#e0a23e',
      casa: '#63594b', casaLinea: '#3e372e', cesped: '#5f7735',
      palma: '#2e4724', palmaLuz: '#b59a4c', tronco: '#6c5338', troncoLuz: '#d69c62',
      caballo: '#4e3424', crin: '#20150d'
    },
    ocaso: {
      nombre: 'ocaso', desregistro: true, sombra: [0.5, 0.62, 0.3],
      sol: '#ff7f6e', halo: 'rgba(255,160,120,.4)', nube: '#463056', nubeSombra: '#ef8a74', ave: '#1b1b30',
      mar: ['#2a3961', '#18213f'], ola: '#6d7bb0', reflejo: '#ffae8c', espuma: '#e9dcc8',
      lejos: '#2f2741', lejosLuz: '#6a4a66',
      volcan: '#33302a', volcanLuz: '#7a5a48', volcanSombra: '#24221d', cantera: '#5a5040', bruma: 'rgba(240,140,120,.18)',
      medio: '#2f3322', medioLuz: '#7a6a44', medioSombra: '#21251a',
      hierba: ['#4c5a33', '#232b18'], loma: 'rgba(0,0,0,', mata: '#1f2814', mataLuz: '#e8a66c', crestaLuz: '#e8a66c',
      tierra: '#5a4632', arena: '#a07e66', arenaSombra: '#7a5e4c', arenaMojada: '#6a5040',
      roca: '#1e1c19', rocaCara: '#3a332b', rocaLuz: '#e08a64',
      acantilado: '#3a2a26', acantiladoLuz: '#c06a4e', acantiladoSombra: '#221816',
      ahu: '#3d362d', ahuLuz: '#6b5b49', ahuLinea: '#221e19', canto: '#2b2722',
      moai: '#3b3129', moaiSombra: '#1b1612', labio: '#2c241d', borde: '#ff8a6e', poro: '#2a221c', trama: 'rgba(12,10,8,.5)',
      pukao: '#7e3626', pukaoLuz: '#b2523a', ojo: '#f2e3c6', pupila: '#120f0c', liquen: '#b8683a',
      casa: '#3a342b', casaLinea: '#1f1b16', cesped: '#3a4426',
      palma: '#1a2014', palmaLuz: '#9a6a44', tronco: '#3a2c22', troncoLuz: '#a8664a',
      caballo: '#2a1e18', crin: '#120c08'
    },
    noche: {
      nombre: 'noche', desregistro: false, sombra: [-0.28, 0.4, 0.22],
      sol: '#f2ead6', halo: 'rgba(200,215,255,.22)', nube: '#1d2244', nubeSombra: '#4f5a8c', ave: '#0a0c1c',
      mar: ['#16204a', '#0a1028'], ola: '#3d5193', reflejo: '#cdd8ff', espuma: '#8fa2d8',
      lejos: '#121634', lejosLuz: '#2c3566',
      volcan: '#14172c', volcanLuz: '#2e3768', volcanSombra: '#0c0e1d', cantera: '#252a48', bruma: 'rgba(90,110,180,.14)',
      medio: '#121a26', medioLuz: '#2c3a62', medioSombra: '#0a1018',
      hierba: ['#18291f', '#0a130e'], loma: 'rgba(0,0,8,', mata: '#08100b', mataLuz: '#6f8cc4', crestaLuz: '#5f7cb6',
      tierra: '#262536', arena: '#4f5676', arenaSombra: '#3a4060', arenaMojada: '#2c3150',
      roca: '#0b0b12', rocaCara: '#1a1c2b', rocaLuz: '#8296cc',
      acantilado: '#191726', acantiladoLuz: '#4a5486', acantiladoSombra: '#0c0b14',
      ahu: '#1a1924', ahuLuz: '#3c4064', ahuLinea: '#0b0a10', canto: '#121119',
      moai: '#25232e', moaiSombra: '#0e0d14', labio: '#1c1a24', borde: '#aebff2', poro: '#17161e', trama: 'rgba(0,0,10,.5)',
      pukao: '#4c2434', pukaoLuz: '#7c3e4c', ojo: '#d9dcec', pupila: '#06060a', liquen: '#3e4058',
      casa: '#1e1d29', casaLinea: '#0b0a12', cesped: '#14221a',
      palma: '#0a1210', palmaLuz: '#3a4f78', tronco: '#1a1820', troncoLuz: '#4a5482',
      caballo: '#121018', crin: '#06050a'
    }
  };

  /* ---------- ayudas ---------- */
  function camino(pts) { var p = new Path2D(); for (var i = 0; i < pts.length; i++) p[i ? 'lineTo' : 'moveTo'](pts[i][0], pts[i][1]); p.closePath(); return p; }
  function trazo(pts) { var p = new Path2D(); for (var i = 0; i < pts.length; i++) p[i ? 'lineTo' : 'moveTo'](pts[i][0], pts[i][1]); return p; }
  A.camino = camino; A.trazo = trazo;
  A.mezclar = function (a, b, t) { var x = U.mezcla(U.rgb(a), U.rgb(b), t); return '#' + ((1 << 24) + (x[0] << 16) + (x[1] << 8) + x[2]).toString(16).slice(1); };
  // una franja de semitono: puntos de una tinta que se hacen pequeños al alejarse de una línea (la transición entre dos
  // tintas planas de la serigrafía). linea(x) da la y; alto = cuánto sube la franja (hacia arriba si alto > 0)
  A.semitono = function (c, color, x0, x1, linea, alto, paso) {
    paso = paso || 7; c.fillStyle = color; c.beginPath();
    var xa = Math.floor(x0 / paso) * paso;
    for (var x = xa; x <= x1; x += paso) {
      var y0 = linea(x), fila = 0;
      for (var d = paso * 0.5; d < Math.abs(alto); d += paso, fila++) {
        var r = paso * 0.62 * (1 - d / Math.abs(alto)); if (r < 0.5) break;
        var xx = x + (fila % 2) * paso * 0.5, yy = y0 - Math.sign(alto) * d;
        c.moveTo(xx + r, yy); c.arc(xx, yy, r, 0, TAU);
      }
    }
    c.fill();
  };
  // un campo de piedras de basalto sueltas (la isla está sembrada de ellas)
  A.piedras = function (c, P, x, y, w, esc, semilla) {
    var r = U.azar(semilla), n = 8 + Math.floor(r() * 10), lista = [];
    for (var i = 0; i < n; i++) lista.push([x + (r() - 0.5) * w, y + (r() - 0.5) * w * 0.22, (2 + r() * 4.5) * esc]);
    lista.sort(function (a, b) { return a[1] - b[1]; });
    lista.forEach(function (q) {
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(q[0] + q[2] * 0.4, q[1] + q[2] * 0.25, q[2] * 1.3, q[2] * 0.3, 0, 0, TAU); c.fill();
      c.fillStyle = P.roca; c.beginPath(); c.ellipse(q[0], q[1], q[2] * 1.2, q[2] * 0.72, 0, 0, TAU); c.fill();
      c.strokeStyle = P.rocaLuz; c.lineWidth = Math.max(0.8, q[2] * 0.25); c.beginPath(); c.ellipse(q[0], q[1], q[2] * 1.1, q[2] * 0.62, 0, Math.PI * 1.08, Math.PI * 1.62); c.stroke();
    });
  };
  // trama de líneas diagonales dentro de un camino (las sombras de la serigrafía)
  A.trama = function (c, path, x0, y0, x1, y1, color, paso, ancho) {
    c.save(); c.clip(path); c.strokeStyle = color; c.lineWidth = ancho || 1.1; c.beginPath();
    var h = y1 - y0; paso = paso || 5;
    for (var x = x0 - h; x < x1; x += paso) { c.moveTo(x, y0); c.lineTo(x + h * 0.55, y1); }
    c.stroke(); c.restore();
  };
  // la tinta coral impresa un poco movida (solo en las paletas de día)
  A.desregistro = function (c, P, fn) {
    if (!P.desregistro) return;
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; c.translate(3.5, 2.5); fn(); c.restore();
  };

  /* ---------- el moái de frente ---------- */
  A.moaiGeo = function (cx, base, h, lean, ancho) {
    var u = h * (ancho || 0.3) / 2;
    var P = function (x, y) { var X = cx + x * u, Y = base - h + y * h; return [X + (base - Y) * (lean || 0), Y]; };
    return {
      silueta: [P(-0.56, 0.01), P(-0.2, 0), P(0.2, 0), P(0.56, 0.01), P(0.62, 0.11), P(0.66, 0.135), P(0.6, 0.15), P(0.58, 0.3), P(0.56, 0.41), P(0.5, 0.47), P(0.36, 0.535), P(0.42, 0.565),
        P(0.88, 0.6), P(0.96, 0.74), P(0.93, 1), P(-0.93, 1), P(-0.96, 0.74), P(-0.88, 0.6), P(-0.42, 0.565), P(-0.36, 0.535), P(-0.5, 0.47), P(-0.56, 0.41), P(-0.58, 0.3), P(-0.6, 0.15), P(-0.66, 0.135), P(-0.62, 0.11)],
      orejaI: [P(-0.6, 0.13), P(-0.73, 0.15), P(-0.75, 0.42), P(-0.66, 0.47), P(-0.56, 0.42)], orejaD: [P(0.6, 0.13), P(0.73, 0.15), P(0.75, 0.42), P(0.66, 0.47), P(0.56, 0.42)],
      frente: [P(-0.64, 0.11), P(0.64, 0.11), P(0.6, 0.165), P(-0.6, 0.165)],
      ojoI: [P(-0.27, 0.192), 0.16 * u, 0.022 * h], ojoD: [P(0.27, 0.192), 0.16 * u, 0.022 * h],
      nariz: [P(-0.06, 0.15), P(0.06, 0.15), P(0.15, 0.33), P(0.19, 0.375), P(-0.19, 0.375), P(-0.15, 0.33)],
      labios: [P(-0.27, 0.405), P(0.27, 0.405), P(0.24, 0.45), P(-0.24, 0.45)], boca: [P(-0.25, 0.427), P(0, 0.433), P(0.25, 0.427)],
      menton: [P(-0.3, 0.5), P(0, 0.525), P(0.3, 0.5)],
      brazoI: [P(-0.9, 0.64), P(-0.8, 0.82), P(-0.62, 0.89), P(-0.08, 0.885)], brazoD: [P(0.9, 0.64), P(0.8, 0.82), P(0.62, 0.89), P(0.08, 0.885)],
      dedosI: [[P(-0.55, 0.875), P(-0.1, 0.87)], [P(-0.55, 0.9), P(-0.12, 0.898)]], dedosD: [[P(0.55, 0.875), P(0.1, 0.87)], [P(0.55, 0.9), P(0.12, 0.898)]],
      hami: [P(-0.92, 0.955), P(0, 0.965), P(0.92, 0.955)],
      pukao: [P(-0.44, -0.13), P(0.44, -0.13), P(0.5, -0.02), P(0.46, 0.015), P(-0.46, 0.015), P(-0.5, -0.02)],
      borde: [P(-0.93, 1), P(-0.96, 0.74), P(-0.88, 0.6), P(-0.42, 0.565), P(-0.36, 0.535), P(-0.5, 0.47), P(-0.56, 0.41), P(-0.58, 0.3), P(-0.6, 0.15), P(-0.66, 0.135), P(-0.62, 0.11), P(-0.56, 0.01), P(-0.2, 0), P(0.2, 0)],
      u: u, h: h, cx: cx, base: base, P: P
    };
  };
  // la sombra de un moái sobre el suelo, que cae hacia el espectador (el sol está detrás); y0 = donde empieza en el suelo
  A.sombraMoai = function (c, P, m, y0) {
    var s = P.sombra, dx = s[0] * m.h, dy = s[1] * m.h, w = m.u * 0.95;
    var p = new Path2D(); p.moveTo(m.cx - w, y0); p.lineTo(m.cx + w, y0);
    p.lineTo(m.cx + dx + w * 0.62, y0 + dy * 0.82); p.quadraticCurveTo(m.cx + dx, y0 + dy * 1.12, m.cx + dx - w * 0.62, y0 + dy * 0.82); p.closePath();
    c.fillStyle = 'rgba(8,6,20,' + s[2] + ')'; c.fill(p);
    A.trama(c, p, m.cx - w + Math.min(0, dx), y0, m.cx + w + Math.max(0, dx), y0 + dy * 1.15, 'rgba(8,6,20,' + (s[2] * 0.8).toFixed(2) + ')', 5);
  };
  // op: pukao, ojos, roto (sin nariz, erosionado), espalda, borde (grosor de la luz de borde), semilla
  A.moai = function (c, P, m, op) {
    op = op || {};
    var r = U.azar(op.semilla || Math.round(m.cx * 7 + m.h * 3));
    if (op.pukao) {
      var izq = m.P(-0.47, 0.012), der = m.P(0.47, 0.012), ai = m.P(-0.44, -0.1), ad = m.P(0.44, -0.1), rx = (ad[0] - ai[0]) / 2, ry = m.h * 0.022;
      var pk = new Path2D(); pk.moveTo(izq[0], izq[1]); pk.lineTo(ai[0], ai[1]); pk.ellipse((ai[0] + ad[0]) / 2, (ai[1] + ad[1]) / 2, rx, ry, 0, Math.PI, 0, false); pk.lineTo(der[0], der[1]); pk.ellipse((izq[0] + der[0]) / 2, (izq[1] + der[1]) / 2, (der[0] - izq[0]) / 2, ry, 0, 0, Math.PI, false); pk.closePath();
      c.fillStyle = P.pukao; c.fill(pk);
      c.save(); c.clip(pk); c.fillStyle = P.moaiSombra; c.globalAlpha = 0.35; c.fillRect(m.cx + m.u * 0.1, ai[1] - ry * 2, m.u, m.h * 0.2); c.globalAlpha = 1; c.restore();
      c.fillStyle = P.pukaoLuz; c.beginPath(); c.ellipse((ai[0] + ad[0]) / 2, (ai[1] + ad[1]) / 2, rx, ry, 0, 0, TAU); c.fill();
      c.fillStyle = P.pukao; c.beginPath(); c.ellipse((ai[0] + ad[0]) / 2, (ai[1] + ad[1]) / 2 - ry * 0.3, rx * 0.42, ry * 0.5, 0, 0, TAU); c.fill();
      c.strokeStyle = P.borde; c.lineWidth = Math.max(1, m.h * 0.007); c.beginPath(); c.moveTo(izq[0], izq[1]); c.lineTo(ai[0], ai[1]); c.stroke();
      A.desregistro(c, P, function () { c.globalAlpha = 0.25; c.fillStyle = P.pukaoLuz; c.fill(pk); });
    }
    var sil = camino(m.silueta);
    c.fillStyle = P.moai; c.fill(camino(m.orejaI)); c.fill(camino(m.orejaD)); c.fill(sil);
    // la toba porosa
    c.save(); c.clip(sil); c.fillStyle = P.poro;
    for (var k = 0; k < 90; k++) { c.globalAlpha = 0.45; c.beginPath(); c.arc(m.cx + (r() - 0.5) * m.u * 2, m.base - r() * m.h, r() * 1.4 + 0.4, 0, TAU); c.fill(); }
    c.globalAlpha = 1; c.restore();
    // el volumen: el plano de la cara y del pecho, un poco más claros, como una tinta más
    if (!op.espalda) {
      c.save(); c.clip(sil); c.fillStyle = A.mezclar(P.moai, P.borde, 0.12);
      c.fill(camino([m.P(-0.5, 0.17), m.P(0.38, 0.17), m.P(0.34, 0.47), m.P(0.1, 0.53), m.P(-0.4, 0.47)]));
      c.fill(camino([m.P(-0.82, 0.62), m.P(0.5, 0.6), m.P(0.4, 0.86), m.P(-0.7, 0.88)]));
      c.restore();
    }
    // líquenes (manchas de puntitos ocres, como los de verdad) y grietas
    c.save(); c.clip(sil); c.fillStyle = P.liquen;
    for (var lq = 0; lq < 3; lq++) {
      var lx = m.cx + (r() - 0.5) * m.u * 1.4, ly = m.base - m.h * (0.25 + r() * 0.7), lr = m.h * (0.02 + r() * 0.025);
      c.globalAlpha = 0.55; for (var d = 0; d < 14; d++) { var a = r() * TAU, rr = Math.sqrt(r()) * lr; c.beginPath(); c.arc(lx + Math.cos(a) * rr, ly + Math.sin(a) * rr * 0.8, Math.max(0.5, m.h * 0.004 * (0.5 + r())), 0, TAU); c.fill(); }
    }
    c.globalAlpha = 1; c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(0.7, m.h * 0.003);
    for (var g = 0; g < 2; g++) { var gx = m.cx + (r() - 0.5) * m.u * 1.2, gy = m.base - m.h * (0.1 + r() * 0.5); c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + (r() - 0.5) * m.u * 0.2, gy + m.h * 0.04); c.lineTo(gx + (r() - 0.5) * m.u * 0.3, gy + m.h * 0.08); c.stroke(); }
    c.restore();
    if (!op.espalda) {
      // la frente pesada hace sombra sobre las cuencas de los ojos
      c.fillStyle = P.moaiSombra; c.fill(camino(m.frente));
      [m.ojoI, m.ojoD].forEach(function (o) { c.beginPath(); c.ellipse(o[0][0], o[0][1], o[1], o[2], 0, 0, TAU); c.fill(); });
      if (op.ojos) [m.ojoI, m.ojoD].forEach(function (o) {
        var ex = o[0][0], ey = o[0][1] + o[2] * 0.1, ew = o[1] * 0.95, eh = o[2] * 0.95;
        c.fillStyle = P.ojo; c.beginPath(); c.moveTo(ex - ew, ey); c.quadraticCurveTo(ex, ey - eh * 1.5, ex + ew, ey); c.quadraticCurveTo(ex, ey + eh * 1.5, ex - ew, ey); c.fill();
        c.fillStyle = P.pupila; c.beginPath(); c.arc(ex, ey + eh * 0.08, eh * 0.62, 0, TAU); c.fill();
      });
      if (!op.roto) { c.fillStyle = P.moaiSombra; c.fill(camino(m.nariz)); }
      else { c.fillStyle = P.moaiSombra; c.globalAlpha = 0.5; c.fill(camino(m.nariz)); c.globalAlpha = 1; }
      // las aletas de la nariz, la luz en el caballete y en la ceja, y el ombligo
      c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(0.8, m.h * 0.005);
      c.beginPath(); c.arc(m.P(-0.12, 0.37)[0], m.P(-0.12, 0.37)[1], m.u * 0.07, Math.PI * 0.2, Math.PI * 1.1); c.stroke();
      c.beginPath(); c.arc(m.P(0.12, 0.37)[0], m.P(0.12, 0.37)[1], m.u * 0.07, -Math.PI * 0.1, Math.PI * 0.8); c.stroke();
      c.strokeStyle = P.borde; c.globalAlpha = 0.55; c.lineWidth = Math.max(0.8, m.h * 0.005);
      c.stroke(trazo([m.P(-0.04, 0.17), m.P(-0.1, 0.3), m.P(-0.16, 0.36)])); c.stroke(trazo([m.P(-0.6, 0.11), m.P(-0.2, 0.105)]));
      c.globalAlpha = 1;
      c.fillStyle = P.moaiSombra; c.beginPath(); c.arc(m.P(0, 0.8)[0], m.P(0, 0.8)[1], Math.max(1, m.u * 0.045), 0, TAU); c.fill();
      c.fillStyle = P.labio; c.fill(camino(m.labios));
      c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(1, m.h * 0.008); c.lineCap = 'round';
      c.stroke(trazo(m.boca)); c.stroke(trazo(m.menton)); c.stroke(trazo(m.brazoI)); c.stroke(trazo(m.brazoD)); c.stroke(trazo(m.hami));
      c.lineWidth = Math.max(0.8, m.h * 0.005); m.dedosI.concat(m.dedosD).forEach(function (d) { c.stroke(trazo(d)); });
    } else {
      // de espaldas: la columna, los omóplatos y el cinturón con su anillo (los grabados de la espalda)
      c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(1, m.h * 0.008); c.lineCap = 'round';
      c.stroke(trazo([m.P(0, 0.56), m.P(0.02, 0.75), m.P(0, 0.93)]));
      c.stroke(trazo([m.P(-0.7, 0.66), m.P(-0.35, 0.62), m.P(-0.2, 0.72)])); c.stroke(trazo([m.P(0.7, 0.66), m.P(0.35, 0.62), m.P(0.2, 0.72)]));
      c.stroke(trazo([m.P(-0.92, 0.9), m.P(0, 0.91), m.P(0.92, 0.9)])); c.stroke(trazo(m.hami));
      c.beginPath(); c.ellipse(m.P(0, 0.84)[0], m.P(0, 0.84)[1], m.u * 0.14, m.h * 0.025, 0, 0, TAU); c.stroke();
      c.stroke(trazo([m.P(-0.6, 0.11), m.P(0, 0.1), m.P(0.6, 0.11)]));
    }
    // la sombra del lado contrario a la luz, en trama
    A.trama(c, sil, m.cx - m.u * 0.1, m.base - m.h, m.cx + m.u * 1.1, m.base, P.trama, Math.max(3.5, m.h * 0.022), Math.max(0.8, m.h * 0.005));
    // luz de borde (el sol o la luna, detrás a la izquierda)
    c.strokeStyle = P.borde; c.lineWidth = op.borde || Math.max(1.4, m.h * 0.011); c.lineJoin = 'round'; c.lineCap = 'round';
    c.stroke(trazo(m.borde)); c.lineWidth *= 0.7; c.stroke(trazo([m.orejaI[0], m.orejaI[1], m.orejaI[2]]));
    var bm = m;
    A.desregistro(c, P, function () { c.strokeStyle = '#ff7f6e'; c.lineWidth = Math.max(1.2, bm.h * 0.008); c.stroke(trazo(bm.borde)); });
  };

  /* ---------- el moái tumbado, de perfil (caído boca abajo, o el Gigante en la roca, boca arriba) ----------
     (x, y) = la base; ang = hacia dónde va la cabeza; largo en px; cara: 1 boca arriba, −1 boca abajo */
  var PERFIL = [[0, -0.1], [0.12, -0.11], [0.3, -0.105], [0.46, -0.1], [0.52, -0.112], [0.585, -0.135], [0.63, -0.15], [0.655, -0.14], [0.68, -0.165], [0.745, -0.19], [0.765, -0.16], [0.8, -0.15], [0.86, -0.13], [0.94, -0.12], [1, -0.1],
    [1, 0.07], [0.93, 0.09], [0.8, 0.095], [0.62, 0.085], [0.5, 0.1], [0.3, 0.11], [0.1, 0.11], [0, 0.105]];
  A.moaiPerfil = function (c, P, x, y, largo, ang, cara, op) {
    op = op || {};
    var ca = Math.cos(ang), sa = Math.sin(ang), k = cara || 1;
    var pt = function (q) { var lx = q[0] * largo, ly = q[1] * largo * k; return [x + lx * ca - ly * sa, y + lx * sa + ly * ca]; };
    var pts = PERFIL.map(pt), sil = camino(pts);
    c.fillStyle = op.color || P.moai; c.fill(sil);
    // la oreja larga y la línea del brazo
    c.strokeStyle = P.moaiSombra; c.lineWidth = Math.max(1, largo * 0.006); c.lineCap = 'round';
    c.stroke(trazo([pt([0.82, 0.02]), pt([0.86, 0.06]), pt([0.68, 0.06]), pt([0.66, 0.02])]));
    c.stroke(trazo([pt([0.5, 0.03]), pt([0.3, 0.05]), pt([0.12, 0.02])]));
    if (k > 0) { c.fillStyle = P.moaiSombra; c.fill(camino([pt([0.76, -0.15]), pt([0.8, -0.13]), pt([0.82, -0.09]), pt([0.78, -0.09])])); }   // la cuenca del ojo
    var minx = Math.min.apply(null, pts.map(function (q) { return q[0]; })), maxx = Math.max.apply(null, pts.map(function (q) { return q[0]; }));
    var miny = Math.min.apply(null, pts.map(function (q) { return q[1]; })), maxy = Math.max.apply(null, pts.map(function (q) { return q[1]; }));
    A.trama(c, sil, minx, (miny + maxy) / 2, maxx, maxy, P.trama, Math.max(3.5, largo * 0.012));
    c.strokeStyle = P.borde; c.lineWidth = Math.max(1.3, largo * 0.006); c.lineJoin = 'round';
    c.stroke(trazo(pts.slice(0, 15)));
    return pts;
  };

  /* ---------- el ahu: la plataforma de piedras encajadas, la hilada de arriba más clara y la rampa de cantos ---------- */
  A.ahu = function (c, P, x0, x1, base, alto, semilla) {
    var r = U.azar(semilla || Math.round(x0)), w = x1 - x0;
    c.fillStyle = P.ahu; c.fillRect(x0, base - 3, w, alto);
    c.fillStyle = P.ahuLuz; c.fillRect(x0, base - 3, w, Math.max(3, alto * 0.14));
    c.strokeStyle = P.ahuLinea; c.lineWidth = 1.2;
    for (var fila = 0; fila < 2; fila++) {
      var y0 = base - 3 + fila * alto / 2, x = x0 + (fila ? alto * 0.5 : 0);
      while (x < x1) { var bw = alto * (0.8 + r() * 1.1); c.strokeRect(x, y0, Math.min(bw, x1 - x), alto / 2); x += bw; }
    }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0, base - 3 + alto - 3, w, 3);
    // la explanada de losas delante del ahu
    c.fillStyle = A.mezclar(P.ahu, P.hierba[0], 0.35);
    var py = base - 3 + alto;
    for (var k = 0, xx = x0 - alto * 0.3; xx < x1 + alto * 0.3; k++) { var lw = alto * (0.9 + r() * 0.8), lh = alto * (0.18 + r() * 0.12); c.fillRect(xx, py + (k % 2) * alto * 0.12, lw - 2, lh); xx += lw; }
    // la rampa de cantos rodados delante (poro)
    c.fillStyle = P.canto;
    for (var i = 0, n = Math.round(w / alto * 3); i < n; i++) { var cx = x0 - alto * 0.5 + r() * (w + alto), cy = base + alto - 3 + r() * alto * 0.7, cr = alto * (0.08 + r() * 0.12); c.beginPath(); c.ellipse(cx, cy, cr * 1.5, cr, 0, 0, TAU); c.fill(); }
    // hierba contra el pie de la plataforma
    for (i = 0; i < w / alto * 1.4; i++) A.mata(c, P, x0 + r() * w, base - 3 + alto + r() * 3, alto / 30, Math.round(x0 + i * 13), 5);
  };

  // la sombra de contacto: oscurece el suelo justo debajo de lo que se apoya en él (que nada flote)
  A.contacto = function (c, x, y, w, h, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, 'rgba(6,6,14,' + (a || 0.38) + ')'); g.addColorStop(1, 'rgba(6,6,14,0)');
    c.save(); c.translate(x, y); c.scale(1, h / w); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, TAU); c.fill(); c.restore();
  };

  /* ---------- rocas, matas, piedras ---------- */
  A.roca = function (c, P, x, y, s, semilla) {
    var r = U.azar(semilla || Math.round(x * 3 + y)), pts = [], n = 8;
    for (var i = 0; i < n; i++) { var a = TAU * i / n, rr = s * (0.75 + r() * 0.4); pts.push([x + Math.cos(a) * rr * 1.3, y + Math.min(0.2, Math.sin(a)) * rr * 0.9]); }
    var p = camino(pts);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + s * 0.5, y + s * 0.22, s * 1.5, s * 0.22, 0, 0, TAU); c.fill();
    c.fillStyle = P.roca; c.fill(p);
    c.save(); c.clip(p); c.fillStyle = P.rocaCara; c.beginPath(); c.moveTo(x - s * 1.6, y - s); c.lineTo(x + s * 0.2, y - s); c.lineTo(x - s * 0.3, y + s * 0.2); c.lineTo(x - s * 1.6, y + s * 0.2); c.fill();
    c.fillStyle = 'rgba(0,0,0,.35)'; for (var k = 0; k < 6; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * s * 2, y - r() * s * 0.6, 0.8 + r() * 1.8, 0, TAU); c.fill(); } c.restore();
    c.strokeStyle = P.rocaLuz; c.lineWidth = Math.max(1.2, s * 0.06); c.lineJoin = 'round'; c.stroke(trazo(pts.slice(3, 7)));
  };
  // una mata de hierba a contraluz (la punta se enciende)
  A.mata = function (c, P, x, y, esc, semilla, hojas) {
    var r = U.azar(semilla), n = hojas || 7;
    c.lineCap = 'round';
    for (var k = 0; k < n; k++) {
      var l = (12 + r() * 20) * esc, dx = (r() - 0.5) * 24 * esc;
      c.strokeStyle = P.mata; c.lineWidth = (1 + r()) * esc; c.beginPath(); c.moveTo(x + (k - n / 2) * 2 * esc, y); c.quadraticCurveTo(x + dx * 0.3, y - l * 0.6, x + dx, y - l); c.stroke();
      if (k % 2) { c.strokeStyle = P.mataLuz; c.lineWidth = 0.8 * esc; c.beginPath(); c.moveTo(x + dx * 0.55, y - l * 0.78); c.lineTo(x + dx, y - l); c.stroke(); }
    }
  };
  // un pipi horeko: el montón de piedras que marcaba los límites
  A.pipi = function (c, P, x, y, s, semilla) {
    var r = U.azar(semilla || 5);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + s * 0.3, y, s * 1.3, s * 0.2, 0, 0, TAU); c.fill();
    var filas = [[3, 1], [2, 0.8], [1, 0.6]], yy = y;
    filas.forEach(function (f) {
      for (var i = 0; i < f[0]; i++) {
        var px = x + (i - (f[0] - 1) / 2) * s * 0.75 * f[1], rr = s * 0.42 * f[1] * (0.85 + r() * 0.3);
        c.fillStyle = P.roca; c.beginPath(); c.ellipse(px, yy - rr * 0.7, rr, rr * 0.75, 0, 0, TAU); c.fill();
        c.strokeStyle = P.rocaLuz; c.lineWidth = 1.2; c.beginPath(); c.ellipse(px, yy - rr * 0.7, rr, rr * 0.75, 0, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
      }
      yy -= s * 0.55 * f[1];
    });
  };
  // los cimientos de una hare paenga: la casa en forma de barca, con su bordillo de basalto encajado
  A.hare = function (c, P, x, y, w, semilla) {
    var r = U.azar(semilla || 9), n = 40, hh = w * 0.15;
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x, y, w * 0.47, hh * 0.85, 0, 0, TAU); c.fill();
    var piedras = [];
    for (var i = 0; i < n; i++) { var a = TAU * i / n; piedras.push([x + Math.cos(a) * w / 2 * (1 - 0.12 * Math.pow(Math.sin(a), 2)), y + Math.sin(a) * hh, Math.sin(a)]); }
    piedras.sort(function (p, q) { return p[1] - q[1]; });
    piedras.forEach(function (q) {
      var bw = w * 0.045 * (0.85 + r() * 0.3), bh = bw * (0.7 + 0.25 * (q[2] + 1));
      c.fillStyle = P.roca; c.fillRect(q[0] - bw / 2, q[1] - bh, bw + 0.5, bh);
      c.fillStyle = P.rocaLuz; c.globalAlpha = 0.75; c.fillRect(q[0] - bw / 2, q[1] - bh, bw + 0.5, Math.max(1, bh * 0.22)); c.globalAlpha = 1;
    });
  };

  /* ---------- Orongo: las casas de losas, medio enterradas, con su puerta-túnel ---------- */
  A.casa = function (c, P, x, y, w, h, semilla) {
    var r = U.azar(semilla || 3);
    var p = new Path2D(); p.moveTo(x - w / 2, y); p.bezierCurveTo(x - w * 0.48, y - h * 1.05, x + w * 0.48, y - h * 1.05, x + w / 2, y); p.closePath();
    c.fillStyle = P.casa; c.fill(p);
    // las losas, en hiladas
    c.save(); c.clip(p); c.strokeStyle = P.casaLinea; c.lineWidth = 1;
    for (var f = 1; f < 6; f++) { var yy = y - h * f / 6; c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x + w, yy); c.stroke(); for (var xx = x - w / 2 + r() * 10; xx < x + w / 2; xx += 8 + r() * 14) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + h / 6); c.stroke(); } }
    // el techo de tierra con hierba
    c.fillStyle = P.cesped; c.beginPath(); c.ellipse(x, y - h * 0.86, w * 0.36, h * 0.2, 0, 0, TAU); c.fill();
    A.trama(c, p, x, y - h, x + w / 2, y, P.trama, 4);
    c.restore();
    // la puerta, baja y estrecha, con su dintel
    c.fillStyle = P.moaiSombra; c.fillRect(x - w * 0.06, y - h * 0.32, w * 0.12, h * 0.32);
    c.fillStyle = P.ahuLuz; c.fillRect(x - w * 0.09, y - h * 0.36, w * 0.18, h * 0.05);
    c.strokeStyle = P.borde; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - w / 2, y); c.bezierCurveTo(x - w * 0.48, y - h * 1.05, x - w * 0.1, y - h * 0.78, x, y - h * 0.79); c.stroke();
  };
  // una roca con petroglifos del Hombre Pájaro (cuerpo agachado, cabeza de ave) y el rostro de Make-make
  A.petroglifo = function (c, P, x, y, s, semilla) {
    var r = U.azar(semilla || 11), pts = [];
    for (var i = 0; i < 12; i++) { var a = Math.PI + Math.PI * i / 11, rr = s * (0.9 + r() * 0.15); pts.push([x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr * 0.75]); }
    var p = camino(pts);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + s * 0.3, y, s * 1.5, s * 0.18, 0, 0, TAU); c.fill();
    c.fillStyle = P.rocaCara; c.fill(p);
    A.trama(c, p, x, y - s, x + s * 1.3, y, P.trama, 4);
    c.strokeStyle = P.rocaLuz; c.lineWidth = Math.max(1.2, s * 0.05); c.lineCap = 'round'; c.lineJoin = 'round';
    // el Hombre Pájaro: de perfil, agachado, con el pico curvo
    var bx = x - s * 0.45, by = y - s * 0.2, k = s * 0.5;
    c.beginPath(); c.moveTo(bx - k * 0.3, by); c.quadraticCurveTo(bx - k * 0.5, by - k * 0.6, bx, by - k * 0.8); c.quadraticCurveTo(bx + k * 0.3, by - k * 1.05, bx + k * 0.15, by - k * 1.2);
    c.quadraticCurveTo(bx + k * 0.55, by - k * 1.25, bx + k * 0.6, by - k * 1.0); c.moveTo(bx, by - k * 0.8); c.quadraticCurveTo(bx + k * 0.35, by - k * 0.5, bx + k * 0.25, by - k * 0.15); c.lineTo(bx + k * 0.45, by); c.stroke();
    c.beginPath(); c.arc(bx + k * 0.25, by - k * 1.08, k * 0.04, 0, TAU); c.stroke();
    // Make-make: el rostro de ojos grandes
    var mx = x + s * 0.45, my = y - s * 0.45, mk = s * 0.3;
    c.beginPath(); c.ellipse(mx, my, mk, mk * 1.1, 0, 0, TAU); c.stroke();
    c.beginPath(); c.arc(mx - mk * 0.38, my - mk * 0.2, mk * 0.22, 0, TAU); c.arc(mx + mk * 0.38, my - mk * 0.2, mk * 0.22, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(mx, my - mk * 0.05); c.lineTo(mx, my + mk * 0.35); c.stroke();
    c.strokeStyle = P.borde; c.lineWidth = Math.max(1.2, s * 0.04); c.stroke(trazo(pts.slice(0, 6)));
  };

  /* ---------- Anakena: los cocoteros ---------- */
  A.palmera = function (c, P, x, y, h, inclina, semilla) {
    var r = U.azar(semilla || 7), tx = x + inclina * h, ty = y - h;
    // el tronco, curvo y anillado
    var p = new Path2D(), w0 = h * 0.045, w1 = h * 0.025;
    var cx = x + inclina * h * 0.2, cy = y - h * 0.55;
    p.moveTo(x - w0, y); p.quadraticCurveTo(cx - w0, cy, tx - w1, ty); p.lineTo(tx + w1, ty); p.quadraticCurveTo(cx + w0, cy, x + w0, y); p.closePath();
    c.fillStyle = P.tronco; c.fill(p);
    c.save(); c.clip(p); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1;
    for (var k = 1; k < 18; k++) { var t = k / 18, ax = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * tx, ay = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ty; c.beginPath(); c.moveTo(ax - w0 * 1.5, ay); c.lineTo(ax + w0 * 1.5, ay - 2); c.stroke(); }
    c.fillStyle = P.troncoLuz; c.globalAlpha = 0.8; c.fillRect(x - h, y - h * 1.1, h - w0 * 0.2 + (inclina > 0 ? 0 : 0), h * 1.2); c.restore(); c.globalAlpha = 1;
    // la corona: hojas largas que cuelgan, con su nervio
    var n = 9;
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42 + (r() - 0.5) * 0.18, l = h * (0.42 + r() * 0.18), cae = 0.55 + r() * 0.35;
      var ex = tx + Math.cos(a) * l, ey = ty + Math.sin(a) * l * 0.5 + l * cae * 0.6, mx = tx + Math.cos(a) * l * 0.55, my = ty + Math.sin(a) * l * 0.55 - l * 0.12;
      var hoja = new Path2D(), an = l * 0.11;
      hoja.moveTo(tx, ty); hoja.quadraticCurveTo(mx, my - an, ex, ey); hoja.quadraticCurveTo(mx, my + an, tx, ty);
      c.fillStyle = i % 2 ? P.palma : P.palmaLuz; c.fill(hoja);
      c.strokeStyle = P.palma; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      // los foliolos: pequeñas muescas en el borde
      c.strokeStyle = i % 2 ? P.palmaLuz : P.palma; c.lineWidth = 0.9;
      for (var f = 0.25; f < 0.95; f += 0.1) { var qx = (1 - f) * (1 - f) * tx + 2 * (1 - f) * f * mx + f * f * ex, qy = (1 - f) * (1 - f) * ty + 2 * (1 - f) * f * my + f * f * ey; c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx + Math.cos(a + 1.6) * an * 0.9, qy + an * 0.9); c.stroke(); }
    }
    c.fillStyle = P.tronco; c.beginPath(); c.arc(tx, ty + 2, h * 0.03, 0, TAU); c.fill();
  };

  /* ---------- Te Pito o te Henua: la piedra redonda pulida, sus cuatro piedras y el muro bajo que la rodea ---------- */
  A.pito = function (c, P, x, y, rad, semilla) {
    var r = U.azar(semilla || 13);
    // el muro bajo, una elipse de piedras
    for (var i = 0; i < 28; i++) {
      var a = TAU * i / 28; if (Math.sin(a) > 0.2) continue;
      A.roca(c, P, x + Math.cos(a) * rad * 3.2, y + Math.sin(a) * rad * 0.9, rad * (0.28 + r() * 0.1), 900 + i);
    }
    // las cuatro piedras pequeñas
    [[-1.35, 0.15], [1.35, 0.1], [-0.5, 0.42], [0.65, 0.45]].forEach(function (q, j) { A.roca(c, P, x + q[0] * rad, y + q[1] * rad, rad * 0.32, 950 + j); });
    // la piedra grande, redonda y lisa
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + rad * 0.3, y + rad * 0.05, rad * 1.25, rad * 0.22, 0, 0, TAU); c.fill();
    var cy = y - rad * 0.85;
    c.fillStyle = P.roca; c.beginPath(); c.arc(x, cy, rad, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(x, cy, rad, 0, TAU); c.clip();
    c.fillStyle = P.rocaCara; c.beginPath(); c.arc(x - rad * 0.3, cy - rad * 0.3, rad * 0.95, 0, TAU); c.fill();
    A.trama(c, new Path2D('M' + (x - rad) + ' ' + (cy - rad) + 'h' + rad * 2 + 'v' + rad * 2 + 'h' + (-rad * 2) + 'z'), x + rad * 0.1, cy - rad, x + rad, cy + rad, P.trama, 4);
    c.restore();
    c.strokeStyle = P.rocaLuz; c.lineWidth = Math.max(1.4, rad * 0.06); c.beginPath(); c.arc(x, cy, rad * 0.97, Math.PI * 0.95, Math.PI * 1.6); c.stroke();
    c.fillStyle = P.rocaLuz; c.globalAlpha = 0.6; c.beginPath(); c.ellipse(x - rad * 0.4, cy - rad * 0.45, rad * 0.16, rad * 0.1, -0.6, 0, TAU); c.fill(); c.globalAlpha = 1;
  };

  /* ---------- un caballo (en Rapa Nui hay miles, sueltos): de perfil, mirando a la derecha; s = alto a la cruz ---------- */
  A.caballo = function (c, P, x, y, s, paso, pastando, izquierda) {
    c.save(); c.translate(x, y); c.scale(izquierda ? -s : s, s);
    var pata = function (px, fase, trasera) {
      var a = Math.sin(paso + fase) * 0.32, rod = Math.max(0, Math.sin(paso + fase + 1.2)) * 0.5 * (trasera ? -1 : 1);
      c.save(); c.translate(px, -0.6); c.rotate(a);
      c.beginPath(); c.moveTo(-0.055, 0); c.lineTo(0.055, 0); c.lineTo(0.035, 0.3); c.lineTo(-0.03, 0.3); c.closePath(); c.fill();
      c.translate(0, 0.29); c.rotate(rod);
      c.beginPath(); c.moveTo(-0.03, 0); c.lineTo(0.035, 0); c.lineTo(0.03, 0.3); c.lineTo(0.06, 0.32); c.lineTo(-0.035, 0.32); c.closePath(); c.fill();
      c.restore();
    };
    c.fillStyle = P.caballo;
    pata(-0.34, Math.PI, true); pata(0.36, 0, false);
    // el cuerpo: grupa, lomo, cruz, pecho y vientre
    c.beginPath(); c.moveTo(-0.5, -0.86); c.bezierCurveTo(-0.3, -1.02, 0.1, -0.94, 0.36, -0.99); c.bezierCurveTo(0.52, -0.95, 0.58, -0.78, 0.5, -0.62);
    c.bezierCurveTo(0.2, -0.56, -0.2, -0.56, -0.42, -0.62); c.bezierCurveTo(-0.58, -0.66, -0.6, -0.8, -0.5, -0.86); c.fill();
    // la cola
    c.fillStyle = P.crin; c.beginPath(); c.moveTo(-0.5, -0.88); c.quadraticCurveTo(-0.66, -0.72, -0.62, -0.42); c.lineTo(-0.56, -0.42); c.quadraticCurveTo(-0.58, -0.7, -0.46, -0.84); c.fill();
    // el cuello y la cabeza (baja a pastar)
    c.save(); c.translate(0.4, -0.92); c.rotate(pastando ? 1.15 : 0);
    c.fillStyle = P.caballo; c.beginPath(); c.moveTo(-0.1, -0.06); c.bezierCurveTo(0.0, -0.3, 0.12, -0.44, 0.22, -0.5); c.lineTo(0.48, -0.26); c.lineTo(0.44, -0.18); c.lineTo(0.26, -0.27); c.bezierCurveTo(0.2, -0.12, 0.18, 0.02, 0.14, 0.14); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0.2, -0.5); c.lineTo(0.17, -0.6); c.lineTo(0.25, -0.52); c.fill();   // la oreja
    c.fillStyle = P.crin; c.beginPath(); c.moveTo(-0.12, -0.04); c.bezierCurveTo(-0.04, -0.3, 0.08, -0.44, 0.2, -0.52); c.lineTo(0.16, -0.42); c.bezierCurveTo(0.06, -0.32, -0.02, -0.2, -0.04, -0.02); c.fill();
    c.restore();
    c.fillStyle = P.caballo;
    pata(-0.26, 0, true); pata(0.44, Math.PI, false);
    c.strokeStyle = P.borde; c.globalAlpha = 0.7; c.lineWidth = 1.2 / s; c.beginPath(); c.moveTo(-0.5, -0.86); c.bezierCurveTo(-0.3, -1.02, 0.1, -0.94, 0.36, -0.99); c.stroke(); c.globalAlpha = 1;
    c.restore();
  };
})();
