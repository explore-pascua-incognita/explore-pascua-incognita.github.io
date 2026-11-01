/* Pascua Incognita · paisaje
   La costa de Rapa Nui, de Orongo a Tongariki, que se recorre de lado. Capas con paralaje:
     lejos (p 0,12: los islotes del Hombre Pájaro) · el mar (vivo) · volcanes (p 0,3: Rano Kau, Terevaka, Poike) ·
     medio (p 0,6: cabos lejanos) · costa (p 1: el suelo, los ahu y sus moáis, Orongo, Anakena, Rano Raraku) ·
     cerca (p 1,35: hierba, piedras, cimientos de casas) · la hierba viva de delante (p 1,6, se mece con el viento).
   Las capas fijas se pintan por teselas (TW px de ancho) con cada paleta y se guardan; el taller las pinta a trozos,
   esperando a WebKit tras cada una, primero lo que se ve. El día pasa solo (PA.hora): día → atardecer → noche → alba,
   y entre dos paletas las teselas se funden. El cielo es CSS (tres degradados que se funden y una trama de puntos). */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, A = RN.arte, PAL = A.PALETAS;
  var TAU = Math.PI * 2;
  var PA = RN.paisaje = {};
  var HOR = PA.HOR = 0.56;          // el horizonte, en altos de pantalla (el CSS del cielo usa el mismo 56 %)
  var TW = 512;                     // ancho de una tesela, en px CSS
  var L = E.largo;

  /* ================================================================== el suelo de la costa (capa p = 1) */
  function meseta(l, a, b, borde) { return U.suave(U.tramo(l, a, a + borde)) * (1 - U.suave(U.tramo(l, b - borde, b))); }
  function raraku(l) {
    if (l < 7.0 || l > 8.6) return 0;
    var r = l < 7.8 ? Math.pow(U.suave(U.tramo(l, 7.0, 7.8)), 1.25) : 1 - U.suave(U.tramo(l, 7.8, 8.6));
    return r * 0.25 - meseta(l, 7.68, 7.98, 0.1) * 0.025;   // la muesca del cráter arriba
  }
  // la y (en altos de pantalla) del borde de arriba del suelo en la λ de la costa
  var suelo = PA.suelo = function (l) {
    var y = 0.655 + (U.fbm(l * 3.1, 4, 3) - 0.5) * 0.014;
    y -= (1 - U.suave(U.tramo(l, 1.35, 1.95))) * 0.052;     // Orongo, en lo alto del acantilado de Rano Kau
    y -= meseta(l, 3.45, 4.7, 0.35) * 0.034;                // la loma de Ahu Akivi, tierra adentro
    y += meseta(l, 5.8, 7.0, 0.2) * 0.014;                  // la playa de Anakena, más baja
    y -= raraku(l);
    return y;
  };
  var ACANTILADO = [[0.2, 1.02], [0.232, 0.955], [0.25, 0.905], [0.288, 0.865], [0.3, 0.805], [0.338, 0.765], [0.358, 0.712], [0.405, 0.672], [0.44, 0.64], [0.47, 0.618], [0.5, 0.0]];   // la cara del acantilado de Orongo (la última y = suelo)
  PA.esTierra = function (l, y) { return l > 0.5 ? y > suelo(l) : (function () { for (var i = 0; i < ACANTILADO.length - 1; i++) { var a = ACANTILADO[i], b = ACANTILADO[i + 1]; var by = b[1] || suelo(0.5); if (y <= a[1] && y >= by) { var k = (y - a[1]) / (by - a[1]); return l > a[0] + (b[0] - a[0]) * k; } } return false; })(); };

  /* ================================================================== los lugares */
  // (λ de la costa). Los secretos los piden con PA.lugar(nombre)
  var LUGARES = {
    orongo: 0.9, acantilado: 0.4, petroglifos: 1.33, vaiuri: 2.05, tahai: 2.42, koteriku: 2.8, akivi: 4.05, pito: 4.86, tepitokura: 5.3, paro: 5.42,
    atureHuki: 6.02, naunau: 6.6, anakena: 6.35, raraku: 7.8, gigante: 7.72, tongariki: 9.3
  };
  PA.LUGARES = LUGARES;
  PA.lugar = function (n) { return LUGARES[n]; };
  var NOMBRES = [[0, 'Orongo'], [1.65, 'Tahai'], [3.3, 'Ahu Akivi'], [4.55, 'Te Pito Kura'], [5.8, 'Anakena'], [7.05, 'Rano Raraku'], [8.6, 'Tongariki']];
  PA.nombreLugar = function (l) { var n = NOMBRES[0][1]; for (var i = 0; i < NOMBRES.length; i++) if (l >= NOMBRES[i][0]) n = NOMBRES[i][1]; return n; };
  // hacia dónde miras (al mar) en cada tramo de costa, en grados: la costa gira de suroeste a sureste
  var RUMBOS = [[0, 222], [1.6, 262], [3.3, 278], [4.55, 352], [5.8, 2], [7.05, 128], [8.6, 152], [10, 156]];
  PA.rumbo = function (l) {
    for (var i = 0; i < RUMBOS.length - 1; i++) {
      var a = RUMBOS[i], b = RUMBOS[i + 1];
      if (l <= b[0]) { var d = ((b[1] - a[1] + 540) % 360) - 180; return (a[1] + d * U.suave(U.tramo(l, a[0], b[0])) + 360) % 360; }
    }
    return RUMBOS[RUMBOS.length - 1][1];
  };

  /* ================================================================== las capas y sus piezas */
  var CAPAS = [
    { id: 'lejos', p: 0.12, y0: 0.42, y1: 0.6, res: 1, els: [] },
    { id: 'volcanes', p: 0.3, y0: 0.3, y1: 0.6, res: 0.8, els: [] },
    { id: 'medio', p: 0.6, y0: 0.46, y1: 0.66, res: 1, els: [] },
    { id: 'costa', p: 1, y0: 0.3, y1: 1, res: 1, els: [] },
    { id: 'cerca', p: 1.35, y0: 0.74, y1: 1, res: 1, els: [] }
  ];
  var CAPA = {}; CAPAS.forEach(function (c) { CAPA[c.id] = c; });
  // una pieza: de l0 a l1 (en u de su capa), y = profundidad (se pinta antes lo de más arriba), f(c, P, u, t0, t1)
  function pieza(capa, l0, l1, y, f) { CAPA[capa].els.push({ l0: l0, l1: l1, y: y, f: f }); }
  // lo que proyecta sombra (se pinta en vivo, según dónde esté el sol o la luna): tipo, λ, y de la base, alto y medio ancho (u)
  var SOMBRAS = [];
  function sombra(tipo, l, y, h, w, extra) { SOMBRAS.push({ tipo: tipo, l: l, y: y, h: h, w: w, extra: extra || 0 }); }

  function construir() {
    var r = U.azar(2026);
    /* ---- lejos: Motu Nui, Motu Iti y la aguja de Motu Kao Kao, frente a Orongo ---- */
    pieza('lejos', -0.05, 0.45, 0, function (c, P, u) {
      var b = HOR * u + 1, M = [
        [[0.0, 0], [0.02, -0.016], [0.05, -0.024], [0.085, -0.019], [0.11, -0.007], [0.12, 0]],
        [[0.135, 0], [0.145, -0.008], [0.16, -0.011], [0.17, 0]],
        [[0.185, 0], [0.188, -0.034], [0.191, -0.039], [0.195, -0.03], [0.199, 0]]];
      M.forEach(function (m) {
        var pts = m.map(function (q) { return [(0.02 + q[0] * 1.6) * u, b + q[1] * 1.5 * u]; });
        c.fillStyle = P.lejos; c.fill(A.camino(pts));
        c.strokeStyle = P.lejosLuz; c.lineWidth = 1.2; c.stroke(A.trazo(pts.slice(0, Math.ceil(pts.length / 2))));
      });
    });
    /* ---- volcanes en el horizonte ---- */
    function volcan(l0, l1, alto, forma, semilla) {
      pieza('volcanes', l0, l1, 0, function (c, P, u) {
        var b = HOR * u + 2, pts = [[l0 * u, b]], n = 60;
        for (var i = 0; i <= n; i++) { var t = i / n, l = l0 + (l1 - l0) * t; pts.push([l * u, b - forma(t) * alto * u - (U.fbm(l * 9, semilla, 3) - 0.5) * 0.008 * u]); }
        pts.push([l1 * u, b]);
        var p = A.camino(pts); c.fillStyle = P.volcan; c.fill(p);
        c.save(); c.clip(p);
        // la ladera en sombra (a la derecha de la cima) y la bruma sobre la base
        var cima = 0, ym = 1e9; pts.forEach(function (q) { if (q[1] < ym) { ym = q[1]; cima = q[0]; } });
        c.fillStyle = P.volcanSombra; c.fillRect(cima, ym, l1 * u - cima, b - ym);
        A.trama(c, p, cima, ym, l1 * u, b, P.trama, 5);
        // los barrancos que bajan de la cima
        var rb = U.azar(semilla * 3);
        for (var k = 0; k < 16; k++) {
          var t0b = 0.15 + rb() * 0.7, q0 = pts[1 + Math.round(t0b * n)], lado = q0[0] < cima ? -1 : 1, largo = (b - q0[1]) * (0.5 + rb() * 0.45);
          c.strokeStyle = lado < 0 ? P.volcanLuz : P.volcanSombra; c.globalAlpha = lado < 0 ? 0.3 : 0.6; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(q0[0], q0[1] + 3); c.quadraticCurveTo(q0[0] + lado * largo * 0.15, q0[1] + largo * 0.5, q0[0] + lado * largo * 0.35, q0[1] + largo); c.stroke();
        }
        c.globalAlpha = 1;
        var g = c.createLinearGradient(0, b - alto * u, 0, b); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, P.bruma);
        c.fillStyle = g; c.fillRect(l0 * u, b - alto * u, (l1 - l0) * u, alto * u);
        c.restore();
        c.strokeStyle = P.volcanLuz; c.lineWidth = 1.6; c.stroke(A.trazo(pts.slice(1, Math.round(n * 0.55))));
      });
    }
    // Rano Kau: el cono ancho con la caldera (la muesca de arriba), detrás de Orongo
    volcan(-0.62, 0.62, 0.105, function (t) { var x = (t - 0.5) * 2; return Math.max(0, 1 - Math.pow(Math.abs(x), 1.6)) * (1 - 0.18 * Math.exp(-x * x * 18)) * (x > 0.55 ? 1 - (x - 0.55) * 0.6 : 1); }, 31);
    // Terevaka, el más alto (507 m), largo y suave, con conos pequeños
    volcan(0.85, 2.55, 0.12, function (t) { return Math.pow(Math.sin(Math.PI * t), 1.4) + 0.06 * Math.exp(-Math.pow((t - 0.32) * 14, 2)) + 0.05 * Math.exp(-Math.pow((t - 0.7) * 16, 2)); }, 47);
    // Poike, la península del este, redonda
    volcan(2.7, 3.7, 0.075, function (t) { return Math.pow(Math.sin(Math.PI * t), 0.9) * (1 + 0.08 * Math.sin(t * 9)); }, 53);
    /* ---- medio: cabos que entran en el mar, con algún ahu lejano ---- */
    function cabo(l0, l1, alto, semilla, moais) {
      pieza('medio', l0, l1, 0, function (c, P, u) {
        var b = HOR * u + 3, arriba = [], abajo = [], n = 48;
        for (var i = 0; i <= n; i++) {
          var t = i / n, l = l0 + (l1 - l0) * t, f = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.25)), 0.6) * (t > 0.8 ? U.suave((1 - t) / 0.2) : 1);
          arriba.push([l * u, b - f * alto * u - (U.fbm(l * 12, semilla, 3) - 0.5) * 0.006 * u * f]);
          abajo.unshift([l * u, b + 0.024 * u * Math.sqrt(f)]);
        }
        var p = A.camino(arriba.concat(abajo)); c.fillStyle = P.medio; c.fill(p);
        // el acantilado del cabo, que cae al mar, y su lado en sombra
        c.save(); c.clip(p);
        c.fillStyle = A.mezclar(P.acantilado, P.medio, 0.45); c.fill(A.camino(arriba.map(function (q, i) { return [q[0], Math.max(q[1], b - 0.006 * u)]; }).concat(abajo)));
        c.fillStyle = P.medioSombra; c.globalAlpha = 0.6; c.fillRect((l0 + (l1 - l0) * 0.55) * u, b - alto * u, (l1 - l0) * 0.45 * u, alto * u + 0.03 * u); c.globalAlpha = 1;
        c.restore();
        c.strokeStyle = P.medioLuz; c.lineWidth = 1.4; c.stroke(A.trazo(arriba.slice(0, Math.round(n * 0.6))));
        c.strokeStyle = P.espuma; c.lineWidth = 1.3; c.setLineDash([6, 5, 14, 6]); c.stroke(A.trazo(abajo.slice(Math.round(n * 0.12), Math.round(n * 0.85)))); c.setLineDash([]);
        (moais || []).forEach(function (q) { var x = (l0 + (l1 - l0) * q) * u, by = b - alto * u * 0.82; for (var k = 0; k < 4; k++) { var mm = A.moaiGeo(x + k * 0.012 * u, by, 0.03 * u, 0, 0.32); c.fillStyle = P.moaiSombra; c.fill(A.camino(mm.silueta)); } });
      });
    }
    cabo(1.15, 1.75, 0.035, 61);
    cabo(2.55, 3.35, 0.05, 67, [0.45]);
    cabo(4.3, 5.0, 0.03, 71);
    cabo(5.6, 6.4, 0.045, 73, [0.35]);

    /* ---- la costa ---- */
    pieza('costa', 0.28, L + 0.1, 0, pintarSuelo);
    // Orongo: las casas de losas en lo alto del acantilado y las rocas de petroglifos (Mata Ngarau)
    [[0.6, 0.07], [0.69, 0.085], [0.79, 0.075], [0.88, 0.095], [0.98, 0.08], [1.07, 0.09], [1.16, 0.07]].forEach(function (q, i) {
      var y = suelo(q[0]) + 0.012 + (i % 2) * 0.01;
      sombra('casa', q[0], y, q[1] * 0.5, q[1] * 0.65);
      pieza('costa', q[0] - q[1], q[0] + q[1], y, function (c, P, u) { A.contacto(c, q[0] * u, y * u, q[1] * u * 0.75, q[1] * u * 0.12, 0.4); A.mata(c, P, (q[0] - q[1] * 0.5) * u, y * u + 2, u / 1400, 31 + i, 5); A.casa(c, P, q[0] * u, y * u, q[1] * u * 1.3, q[1] * u * 0.5, 40 + i); });
    });
    [[1.27, 0.04], [1.38, 0.032]].forEach(function (q, i) { var y = suelo(q[0]) + 0.03; sombra('piedra', q[0], y, q[1] * 0.9, q[1] * 1.2); pieza('costa', q[0] - 0.06, q[0] + 0.06, y, function (c, P, u) { A.petroglifo(c, P, q[0] * u, y * u, q[1] * u, 60 + i); }); });
    // los ahu con sus moáis
    function ahu(lc, n, alturas, op) {
      op = op || {};
      var y = suelo(lc) + (op.dy || 0.008), sep = op.sep || 0.085, ancho = op.largo || n * sep + 0.05;
      for (var s0 = 0; s0 < n; s0++) { var hs = alturas[s0 % alturas.length] * ((op.tocones && op.tocones.indexOf(s0) >= 0) ? 0.5 : 1); sombra('moai', lc + (s0 - (n - 1) / 2) * sep, y - 0.002, hs, hs * (op.ancho || 0.3) / 2 * 0.95); SOMBRAS[SOMBRAS.length - 1].g = op.grupo; }
      pieza('costa', lc - ancho / 2 - 0.15, lc + ancho / 2 + 0.15, y, function (c, P, u) {
        var hAhu = 0.03 * u;
        A.contacto(c, lc * u, (y + 0.03) * u, (ancho / 2 + 0.03) * u, 0.02 * u, 0.35);
        A.ahu(c, P, (lc - ancho / 2) * u, (lc + ancho / 2) * u, y * u, hAhu, Math.round(lc * 100));
        for (var i = 0; i < n && !(op.grupo && PA.ocultos[op.grupo]); i++) {
          var x = (lc + (i - (n - 1) / 2) * sep) * u, h = alturas[i % alturas.length] * u;
          var roto = op.rotos && op.rotos.indexOf(i) >= 0, tocon = op.tocones && op.tocones.indexOf(i) >= 0;
          var m = A.moaiGeo(x, y * u - 2, h, (i - (n - 1) / 2) * 0.003, op.ancho || 0.3);
          if (tocon) { c.save(); c.beginPath(); c.rect(x - h, y * u - h * 0.5, h * 2, h * 0.5); c.clip(); }
          A.moai(c, P, m, { pukao: op.pukao && op.pukao.indexOf(i) >= 0, ojos: op.ojos, roto: roto, espalda: op.espalda, semilla: Math.round(lc * 1000) + i });
          if (tocon) { c.restore(); c.fillStyle = P.moaiSombra; c.fillRect(x - m.u * 0.95, y * u - h * 0.5 - 2, m.u * 1.9, 3); }
        }
      });
    }
    // los senderos de tierra que suben hasta los ahu
    [[LUGARES.vaiuri, 0.12], [LUGARES.akivi, -0.18], [LUGARES.naunau, 0.15], [LUGARES.tongariki, -0.1], [0.95, 0.2]].forEach(function (q, i) {
      var lc = q[0], top = suelo(lc) + 0.04;
      pieza('costa', lc - 0.4, lc + 0.4, top - 0.032, function (c, P, u) {
        var izq = [], der = [];
        for (var k = 0; k <= 24; k++) {
          var t = k / 24, y = U.lerp(1.02, top, t), x = lc + q[1] * Math.pow(1 - t, 1.6) + Math.sin(t * 5 + i) * 0.02 * (1 - t), an = U.lerp(0.075, 0.012, Math.pow(t, 0.7));
          izq.push([(x - an) * u, y * u]); der.unshift([(x + an) * u, y * u]);
        }
        var p = A.camino(izq.concat(der)); c.fillStyle = P.tierra; c.fill(p);
        c.save(); c.clip(p); A.trama(c, p, (lc - 0.4) * u, top * u, (lc + 0.4) * u, u, 'rgba(0,0,0,.12)', 6); c.restore();
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.5; c.stroke(A.trazo(der));
        c.strokeStyle = P.crestaLuz; c.globalAlpha = 0.35; c.lineWidth = 1.2; c.stroke(A.trazo(izq)); c.globalAlpha = 1;
      });
    });
    // campos de piedras de basalto
    var rp = U.azar(313);
    for (var lp = 0.65; lp < L - 0.1; lp += 0.22 + rp() * 0.3) {
      (function (l, y, w) { pieza('costa', l - w, l + w, y, function (c, P, u) { A.piedras(c, P, l * u, y * u, w * u, 0.7 + (y - 0.64) * 3, Math.round(l * 777)); }); })(lp, suelo(lp) + 0.05 + rp() * 0.12, 0.05 + rp() * 0.06);
    }
    ahu(LUGARES.vaiuri, 5, [0.2, 0.23, 0.215, 0.24, 0.205], { rotos: [0, 3], tocones: [1] });      // Ahu Vai Uri: cinco, uno roto por la mitad
    ahu(LUGARES.tahai, 1, [0.23], { rotos: [0], ancho: 0.32 });                                          // Ahu Tahai
    ahu(LUGARES.koteriku, 1, [0.25], { pukao: [0], ojos: true });                                         // Ko Te Riku, con sus ojos y su pukao
    ahu(LUGARES.akivi, 7, [0.2, 0.21, 0.205, 0.215, 0.205, 0.21, 0.2], { espalda: true, sep: 0.08, dy: 0.006 });   // Ahu Akivi: los siete que miran al mar
    ahu(LUGARES.tepitokura, 0, [0.2], { dy: 0.006, largo: 0.42 });                                                     // Ahu Te Pito Kura (vacío: Paro está caído delante)
    ahu(LUGARES.atureHuki, 1, [0.2], {});                                                                  // Ahu Ature Huki
    ahu(LUGARES.naunau, 7, [0.21, 0.23, 0.24, 0.235, 0.245, 0.23, 0.22], { pukao: [2, 3, 4, 5], tocones: [0], rotos: [1], sep: 0.082 });   // Ahu Nau Nau
    ahu(LUGARES.tongariki, 15, [0.24, 0.27, 0.25, 0.28, 0.26, 0.29, 0.25, 0.27, 0.3, 0.26, 0.28, 0.25, 0.27, 0.24, 0.26], { pukao: [9], sep: 0.083, rotos: [0, 13], grupo: 'tongariki' });   // Ahu Tongariki: quince
    // Paro, el moái más grande que se llegó a levantar en un ahu, caído boca abajo delante de él (se le ve la espalda)
    (function () { var y = suelo(LUGARES.tepitokura) + 0.06; sombra('tumbado', 5.33, y + 0.01, 0.035, 0.23); pieza('costa', 4.98, 5.68, y, function (c, P, u) {
      var largo = 0.44 * u;
      A.contacto(c, 5.34 * u, (y + 0.012) * u, largo * 0.58, 0.014 * u, 0.45);
      c.save(); c.translate(5.33 * u, y * u); c.scale(1, 0.42); c.rotate(-Math.PI / 2 + 0.04);
      A.moai(c, P, A.moaiGeo(0, largo / 2, largo, 0, 0.3), { espalda: true, semilla: 77, borde: 2.4 });
      c.restore();
    }); })();
    // Te Pito o te Henua: la piedra redonda junto a la costa
    (function () { var y = suelo(LUGARES.pito) + 0.07; sombra('piedra', LUGARES.pito, y, 0.056, 0.03); pieza('costa', 4.7, 5.02, y, function (c, P, u) { A.pito(c, P, LUGARES.pito * u, y * u, 0.028 * u, 13); }); })();
    // Anakena: los cocoteros
    [[5.86, 0.17, 0.12], [5.93, 0.21, -0.05], [6.0, 0.15, 0.1], [6.84, 0.19, -0.1], [6.92, 0.16, 0.06], [6.97, 0.22, -0.02]].forEach(function (q, i) {
      var y = suelo(q[0]) + 0.02 + (i % 3) * 0.012;
      sombra('palma', q[0], y, q[1], 0.012, q[2]);
      pieza('costa', q[0] - 0.15, q[0] + 0.15, y, function (c, P, u) { A.contacto(c, q[0] * u, y * u, 0.02 * u, 0.005 * u, 0.4); A.palmera(c, P, q[0] * u, y * u, q[1] * u, q[2], 80 + i); });
    });
    // Rano Raraku: la cantera, el Gigante sin terminar y las cabezas enterradas en la ladera (allí quedan unos 400 moáis)
    var fondoCantera = function (l) { return suelo(l) + 0.004 + 0.105 * Math.pow(meseta(l, 7.34, 8.2, 0.28), 0.8) + 0.012 * Math.sin(l * 61) + 0.008 * Math.sin(l * 137); };
    pieza('costa', 7.3, 8.25, 0.41, function (c, P, u) {
      var pts = [], i, l, r = U.azar(808);
      for (i = 0; i <= 60; i++) { l = 7.34 + 0.86 * i / 60; pts.push([l * u, (suelo(l) + 0.003) * u]); }
      for (i = 60; i >= 0; i--) { l = 7.34 + 0.86 * i / 60; pts.push([l * u, fondoCantera(l) * u]); }
      var p = A.camino(pts); c.fillStyle = P.cantera; c.fill(p);
      c.save(); c.clip(p);
      // la roca de toba en capas y las hornacinas de moáis a medio tallar (los contornos que quedaron en la pared)
      c.strokeStyle = P.volcanSombra; c.globalAlpha = 0.35; c.lineWidth = 1;
      for (i = 0; i < 9; i++) { c.beginPath(); for (l = 7.34; l <= 8.2; l += 0.02) { var yy = suelo(l) + 0.012 + i * 0.011 + Math.sin(l * 23 + i) * 0.002; l === 7.34 ? c.moveTo(l * u, yy * u) : c.lineTo(l * u, yy * u); } c.stroke(); }
      c.globalAlpha = 1;
      [[7.45, 0.07, 0.15], [7.53, 0.06, -0.1], [7.99, 0.065, 0.12], [8.08, 0.055, -0.05], [8.14, 0.05, 0.2]].forEach(function (q, k) {
        c.save(); c.translate(q[0] * u, (suelo(q[0]) + 0.02 + q[1]) * u); c.rotate(q[2]);
        var mm = A.moaiGeo(0, 0, q[1] * u, 0, 0.3); c.fillStyle = A.mezclar(P.cantera, P.moaiSombra, 0.25); c.fill(A.camino(mm.silueta));
        c.strokeStyle = P.moaiSombra; c.lineWidth = 1.3; c.stroke(A.camino(mm.silueta)); c.restore();
      });
      A.trama(c, p, 7.34 * u, (suelo(7.8) - 0.01) * u, 8.2 * u, (suelo(7.34) + 0.12) * u, P.trama, 6);
      c.restore();
      c.strokeStyle = P.moaiSombra; c.lineWidth = 1.6; c.stroke(A.trazo(pts.slice(61)));
      c.strokeStyle = P.volcanLuz; c.lineWidth = 1.4; c.stroke(A.trazo(pts.slice(0, 61)));
      // pedregal al pie de la pared
      for (i = 0; i < 40; i++) { l = 7.36 + r() * 0.82; A.piedras(c, P, l * u, (fondoCantera(l) + 0.006) * u, 0.02 * u, 0.6, 900 + i); i += 3; }
    });
    pieza('costa', 7.5, 8.05, 0.43, function (c, P, u) {
      // el Gigante (Te Tokanga): unos 21 m, tumbado en la pared con la cabeza hacia la derecha; nunca se despegó de la roca
      var lc = 7.77, y = suelo(lc) + 0.052, largo = 0.3 * u;
      c.save(); c.translate(lc * u, y * u); c.rotate(-Math.PI / 2 - 0.05);
      var m = A.moaiGeo(0, largo / 2, largo, 0, 0.26);
      c.fillStyle = A.mezclar(P.cantera, P.moaiSombra, 0.45); c.beginPath(); c.ellipse(0, 0, largo * 0.15, largo * 0.54, 0, 0, TAU); c.fill();
      c.strokeStyle = P.moaiSombra; c.lineWidth = 0.008 * u; c.lineJoin = 'round'; c.stroke(A.camino(m.silueta));
      A.moai(c, P, m, { semilla: 21, borde: 2 });
      c.restore();
    });
    [[7.08, 0.11, 0.04], [7.15, 0.14, 0.07], [7.22, 0.12, 0.05], [7.27, 0.16, 0.1], [7.33, 0.13, 0.15], [7.4, 0.17, 0.17], [7.2, 0.1, 0.16], [7.48, 0.13, 0.2],
     [8.08, 0.16, 0.2], [8.15, 0.14, 0.15], [8.2, 0.17, 0.11], [8.27, 0.12, 0.08], [8.33, 0.16, 0.06], [8.4, 0.12, 0.04], [8.28, 0.11, 0.18], [8.46, 0.1, 0.03]].forEach(function (q, i) {
      var y = suelo(q[0]) + q[2];
      sombra('cabeza', q[0], y, q[1] * 0.58, q[1] * 0.15);
      pieza('costa', q[0] - 0.06, q[0] + 0.06, y, function (c, P, u) {
        var h = q[1] * u, m = A.moaiGeo(q[0] * u, y * u + h * 0.42, h, (i % 3 - 1) * 0.06, 0.3);
        c.save(); c.beginPath(); c.rect(q[0] * u - h, y * u - h, h * 2, h); c.clip();
        A.moai(c, P, m, { semilla: 300 + i }); c.restore();
        // la tierra que les cubre el cuerpo
        c.fillStyle = P.tierra; c.beginPath(); c.ellipse(q[0] * u, y * u, h * 0.24, h * 0.04, 0, 0, TAU); c.fill();
      });
    });
    // matas y piedras sueltas por toda la costa
    for (var l = 0.55; l < L; l += 0.012) {
      if (r() < 0.45) continue;
      var y = suelo(l) + 0.015 + Math.pow(r(), 1.4) * 0.3; if (y > 0.98) continue;
      if (l > 7.1 && l < 8.5 && y < suelo(l) + 0.12 && r() < 0.6) continue;
      (function (l, y, s, k) {
        var esc = 0.35 + (y - 0.62) * 2.8;
        if (k < 0.08) pieza('costa', l - 0.05, l + 0.05, y, function (c, P, u) { A.roca(c, P, l * u, y * u, (0.006 + s * 0.01) * u * Math.max(0.5, esc), Math.round(l * 997)); });
        else pieza('costa', l - 0.04, l + 0.04, y, function (c, P, u) { A.mata(c, P, l * u, y * u, Math.max(0.35, esc) * u / 900, Math.round(l * 7919), 6); });
      })(l, y, r(), r());
    }

    /* ---- cerca: hierba alta, piedras, cimientos de casas barca y montones de piedras ---- */
    pieza('cerca', 0.85, 14, 0, pintarCerca);
    [[2.6, 'hare', 0.16], [3.4, 'pipi', 0.03], [5.0, 'pipi', 0.025], [6.2, 'hare', 0.18], [8.0, 'pipi', 0.03], [9.5, 'hare', 0.15], [11.6, 'pipi', 0.028], [12.4, 'hare', 0.17]].forEach(function (q, i) {
      var y = 0.86 + (i % 3) * 0.035;
      pieza('cerca', q[0] - q[2], q[0] + q[2], y, function (c, P, u) { if (q[1] === 'hare') A.hare(c, P, q[0] * u, y * u, q[2] * u * 2, 500 + i); else A.pipi(c, P, q[0] * u, y * u, q[2] * u, 600 + i); });
    });
    var r2 = U.azar(77);
    for (l = 0.9; l < 14; l += 0.16) {
      if (r2() < 0.4) continue;
      (function (l, y, s) { pieza('cerca', l - 0.08, l + 0.08, y, function (c, P, u) { A.roca(c, P, l * u, y * u, s * u, Math.round(l * 331)); }); })(l + r2() * 0.1, 0.84 + r2() * 0.14, 0.012 + r2() * 0.03);
    }
    for (l = 0.9; l < 14; l += 0.03) {
      if (r2() < 0.3) continue;
      (function (l, y) {
        var esc = 0.6 + (y - 0.8) * 5;
        pieza('cerca', l - 0.06, l + 0.06, y, function (c, P, u) {
          var Q = Object.create(P); Q.mataLuz = A.mezclar(P.mata, P.mataLuz, 0.4);
          for (var k = 0; k < 3; k++) A.mata(c, Q, (l + (k - 1) * 0.012) * u, (y + (k % 2) * 0.006) * u, esc * (0.8 + k * 0.15) * u / 900, Math.round(l * 4241) + k, 6);
        });
      })(l, 0.81 + Math.pow(r2(), 0.8) * 0.19);
    }
    CAPAS.forEach(function (c) { c.els.sort(function (a, b) { return a.y - b.y; }); });
  }

  // el suelo de la costa en un tramo: hierba en degradado, lomas con la cresta encendida, la arena de Anakena, el acantilado
  // de Orongo y la espuma donde el mar rompe
  function caminoSuelo(u, t0, t1) {
    var p = new Path2D(), paso = 4 / u, a = Math.max(0.5, t0 - 0.02), i;
    if (t0 < 0.52) { p.moveTo(ACANTILADO[0][0] * u, ACANTILADO[0][1] * u); for (i = 1; i < ACANTILADO.length - 1; i++) p.lineTo(ACANTILADO[i][0] * u, ACANTILADO[i][1] * u); a = 0.5; }
    else p.moveTo(a * u, 1.02 * u);
    for (var l = a; l <= t1 + 0.02; l += paso) p.lineTo(l * u, suelo(l) * u);
    p.lineTo((t1 + 0.02) * u, 1.02 * u); p.closePath();
    return p;
  }
  function pintarSuelo(c, P, u, t0, t1) {
    var p = caminoSuelo(u, t0, t1), x0 = (t0 - 0.02) * u, x1 = (t1 + 0.02) * u, paso = 4 / u, l;
    var g = c.createLinearGradient(0, 0.4 * u, 0, u); g.addColorStop(0, P.hierba[0]); g.addColorStop(0.35, P.hierba[0]); g.addColorStop(1, P.hierba[1]);
    c.fillStyle = g; c.fill(p);
    c.save(); c.clip(p);
    // lomas: la tierra ondula hacia el espectador. Cada loma es una tinta plana más oscura que la de detrás, y entre una
    // y otra hay una franja de semitono, como en una serigrafía de verdad; la cresta, tocada por la luz
    var BANDAS = [[0.705, 8], [0.765, 12], [0.84, 16], [0.925, 20]];
    BANDAS.forEach(function (b, j) {
      var linea = function (x) { var l = x / u; return b[0] * u + (U.fbm(l * 2.2 + j * 4, 9 + j, 3) - 0.5) * b[1] * 2.4 + Math.sin(l * Math.PI * (0.9 + j * 0.2) + j) * b[1] * 1.3; };
      var tinta = A.mezclar(P.hierba[0], P.hierba[1], (j + 1) / 4.4), lp = new Path2D(), cr = new Path2D();
      lp.moveTo(x0, u * 1.02);
      for (l = t0 - 0.02; l <= t1 + 0.02; l += paso * 2) { var y = linea(l * u); lp.lineTo(l * u, y); cr[l <= t0 - 0.02 ? 'moveTo' : 'lineTo'](l * u, y); }
      lp.lineTo(x1, u * 1.02); lp.closePath();
      A.semitono(c, tinta, x0, x1, linea, 0.034 * u, 6);
      c.fillStyle = tinta; c.fill(lp);
      c.strokeStyle = P.crestaLuz; c.globalAlpha = 0.16; c.lineWidth = 1.2; c.stroke(cr); c.globalAlpha = 1;
    });
    // el acantilado de Orongo, de perfil: roca rojiza en estratos
    if (t0 < 0.6) {
      var ac = new Path2D(); ac.moveTo(0.18 * u, 1.02 * u); ACANTILADO.slice(0, -1).forEach(function (q) { ac.lineTo((q[0] + 0.0) * u, q[1] * u); });
      ac.lineTo(0.5 * u, suelo(0.5) * u); ac.lineTo(0.57 * u, (suelo(0.5) + 0.03) * u); ac.lineTo(0.53 * u, 0.72 * u); ac.lineTo(0.47 * u, 0.85 * u); ac.lineTo(0.4 * u, 1.02 * u); ac.closePath();
      c.fillStyle = P.acantilado; c.fill(ac);
      c.save(); c.clip(ac);
      // estratos de lava, cada uno con su repisa iluminada arriba
      for (var e = 0.63, j = 0; e < 1.02; e += 0.03 + (j % 3) * 0.008, j++) {
        c.strokeStyle = P.acantiladoSombra; c.lineWidth = 2; c.beginPath(); c.moveTo(0.16 * u, e * u); c.lineTo(0.58 * u, (e + 0.016) * u); c.stroke();
        c.strokeStyle = P.acantiladoLuz; c.globalAlpha = 0.45; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0.16 * u, (e + 0.004) * u); c.lineTo(0.58 * u, (e + 0.02) * u); c.stroke(); c.globalAlpha = 1;
      }
      // grietas verticales y la cara iluminada junto al borde
      var rg = U.azar(55); c.strokeStyle = P.acantiladoSombra; c.lineWidth = 1.4;
      for (j = 0; j < 14; j++) { var gx = (0.22 + rg() * 0.32) * u, gy = (0.65 + rg() * 0.33) * u; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + (rg() - 0.5) * 6, gy + (0.02 + rg() * 0.04) * u); c.stroke(); }
      c.fillStyle = P.acantiladoLuz; c.globalAlpha = 0.28; c.fill(A.camino(ACANTILADO.slice(0, -1).map(function (q) { return [q[0] * u, q[1] * u]; }).concat([[0.5 * u, 0.62 * u], [0.3 * u, 1.02 * u]]))); c.globalAlpha = 1;
      c.restore();
      A.trama(c, ac, 0.38 * u, 0.6 * u, 0.58 * u, u, P.trama, 4);
      c.strokeStyle = P.acantiladoLuz; c.lineWidth = 2.2; c.lineJoin = 'round'; c.stroke(A.trazo(ACANTILADO.slice(0, -1).map(function (q) { return [q[0] * u, q[1] * u]; })));
    }
    // la arena de Anakena: una playa clara entre la hierba y el mar
    if (t1 > 5.75 && t0 < 7.05) {
      var ar = new Path2D(), am = new Path2D(), a0 = Math.max(t0 - 0.02, 5.8), a1 = Math.min(t1 + 0.02, 7.0);
      ar.moveTo(a0 * u, suelo(a0) * u);
      for (l = a0; l <= a1; l += paso) ar.lineTo(l * u, (suelo(l) - 0.002) * u);
      for (l = a1; l >= a0; l -= paso) ar.lineTo(l * u, (suelo(l) + 0.045 * meseta(l, 5.8, 7.0, 0.22) + 0.004 * Math.sin(l * 40)) * u);
      ar.closePath(); c.fillStyle = P.arena; c.fill(ar);
      for (l = a0; l <= a1; l += paso) am[l === a0 ? 'moveTo' : 'lineTo'](l * u, (suelo(l) + 0.006 * meseta(l, 5.8, 7.0, 0.2)) * u);
      c.strokeStyle = P.arenaMojada; c.lineWidth = 3; c.stroke(am);
      c.save(); c.clip(ar); c.fillStyle = P.arenaSombra; c.globalAlpha = 0.5;
      var ra = U.azar(Math.round(a0 * 100)); for (var k = 0; k < (a1 - a0) * 400; k++) { c.beginPath(); c.arc((a0 + ra() * (a1 - a0)) * u, (suelo(a0) + 0.01 + ra() * 0.04) * u, 0.6 + ra(), 0, TAU); c.fill(); }
      c.restore(); c.globalAlpha = 1;
    }
    c.restore();
    if (t0 < 0.6) {
      [[0.17, 0.99, 0.022], [0.205, 1.0, 0.016], [0.13, 1.01, 0.03]].forEach(function (q, i) { A.roca(c, P, q[0] * u, q[1] * u, q[2] * u, 70 + i); });
      c.strokeStyle = P.espuma; c.lineCap = 'round';
      [[0.2, 0.975, 0.05], [0.17, 0.94, 0.035], [0.22, 0.915, 0.025], [0.15, 0.99, 0.04]].forEach(function (q, i) { c.lineWidth = 2.2 - i * 0.3; c.beginPath(); c.moveTo((q[0] - q[2]) * u, q[1] * u); c.quadraticCurveTo((q[0] - q[2] * 0.4) * u, (q[1] - 0.012) * u, q[0] * u, q[1] * u); c.stroke(); });
    }
    // la espuma donde el mar rompe contra la costa (solo donde detrás está el mar)
    c.save(); c.strokeStyle = P.espuma; c.lineWidth = 2.6; c.setLineDash([10, 7, 22, 9]); c.lineDashOffset = x0;
    var ep = new Path2D(), dentro = false;
    for (l = Math.max(0.5, t0 - 0.02); l <= t1 + 0.02; l += paso) {
      var ys = suelo(l);
      if (ys > 0.618) { if (!dentro) { ep.moveTo(l * u, (ys - 0.002) * u); dentro = true; } else ep.lineTo(l * u, (ys - 0.002) * u); } else dentro = false;
    }
    c.stroke(ep); c.restore();
    // la luz sobre el borde de la tierra
    var lb = new Path2D(); for (l = Math.max(0.5, t0 - 0.02); l <= t1 + 0.02; l += paso) lb[l <= Math.max(0.5, t0 - 0.02) ? 'moveTo' : 'lineTo'](l * u, (suelo(l) + 0.004) * u);
    c.strokeStyle = P.crestaLuz; c.globalAlpha = 0.35; c.lineWidth = 1.5; c.stroke(lb); c.globalAlpha = 1;
  }
  // la capa de delante: solo lo de abajo de la pantalla; en Orongo, el acantilado deja ver el mar
  function pintarCerca(c, P, u, t0, t1) {
    var p = new Path2D(), paso = 6 / u, l, a = Math.max(0.85, t0 - 0.02);
    p.moveTo(a * u, 1.02 * u);
    for (l = a; l <= t1 + 0.02; l += paso) p.lineTo(l * u, U.lerp(1.03, 0.82 + (U.fbm(l * 1.7, 21, 3) - 0.5) * 0.06 + 0.04 * (1 - U.suave(U.tramo(l, 0.85, 1.6))), U.suave(U.tramo(l, 0.85, 1.25))) * u);
    p.lineTo((t1 + 0.02) * u, 1.02 * u); p.closePath();
    var tinta = A.mezclar(P.hierba[1], P.mata, 0.45);
    A.semitono(c, tinta, a * u, (t1 + 0.02) * u, function (x) { var l = x / u; return U.lerp(1.03, 0.82 + (U.fbm(l * 1.7, 21, 3) - 0.5) * 0.06 + 0.04 * (1 - U.suave(U.tramo(l, 0.85, 1.6))), U.suave(U.tramo(l, 0.85, 1.25))) * u; }, 0.03 * u, 6);
    c.fillStyle = tinta; c.fill(p);
    var cr = new Path2D(); for (l = a; l <= t1 + 0.02; l += paso) cr[l === a ? 'moveTo' : 'lineTo'](l * u, U.lerp(1.03, 0.82 + (U.fbm(l * 1.7, 21, 3) - 0.5) * 0.06 + 0.04 * (1 - U.suave(U.tramo(l, 0.85, 1.6))), U.suave(U.tramo(l, 0.85, 1.25))) * u);
    c.strokeStyle = P.crestaLuz; c.globalAlpha = 0.3; c.lineWidth = 1.6; c.stroke(cr); c.globalAlpha = 1;
  }

  /* ================================================================== la hora y las paletas */
  // el día pasa solo. Segmentos: [hora de inicio, segundos reales por hora]. La tarde y el alba van despacio
  var RITMO = [[0, 8], [5, 14], [6.66, 6], [14.5, 13], [20.3, 8]];
  PA.hora = 16.9;
  PA.velocidad = 1;       // los secretos pueden acelerar o parar el día
  PA.desvioSol = 0;       // (en fracción del ancho) una escena puede llevar el sol a otro sitio; vuelve solo a su camino
  function segPorHora(h) { var s = RITMO[0][1]; for (var i = 0; i < RITMO.length; i++) if (h >= RITMO[i][0]) s = RITMO[i][1]; return s; }
  // qué paletas se ven a una hora y cuánto: { a, b, k } (b se funde encima de a con alfa k)
  var HORARIO = [[7.5, 'dia'], [15, 'dia', 'dorada'], [16.3, 'dorada'], [17.2, 'dorada', 'ocaso'], [18.2, 'ocaso'], [19.3, 'ocaso', 'noche'], [20.3, 'noche'], [5, 'noche', 'ocaso'], [6, 'ocaso'], [6.66, 'ocaso', 'dia']];
  PA.mezcla = function (h) {
    h = h == null ? PA.hora : h;
    var hh = h < 5 ? h + 24 : h, lista = HORARIO.map(function (q) { return [q[0] < 5 ? q[0] + 24 : q[0]].concat(q.slice(1)); });
    lista.sort(function (x, y) { return x[0] - y[0]; });
    var i = lista.length - 1; for (var j = 0; j < lista.length; j++) if (hh >= lista[j][0]) i = j;
    var q = lista[i], fin = lista[(i + 1) % lista.length][0] + (i + 1 >= lista.length ? 24 : 0);
    if (!q[2]) return { a: q[1], b: null, k: 0 };
    return { a: q[1], b: q[2], k: U.suave(U.tramo(hh, q[0], fin)) };
  };
  PA.peso = function (nombre, h) { var m = PA.mezcla(h); return (m.a === nombre ? 1 - m.k : 0) + (m.b === nombre ? m.k : 0); };
  PA.franja = function (h) { h = h == null ? PA.hora : h; return h >= 7.5 && h < 15.5 ? 'día' : h >= 15.5 && h < 17.6 ? 'hora dorada' : h >= 17.6 && h < 19.3 ? 'atardecer' : h >= 19.3 && h < 20.3 ? 'anochecer' : h >= 6 && h < 7.5 ? 'amanecer' : h >= 5 && h < 6 ? 'alba' : 'noche'; };
  // la paleta siguiente en el ciclo (para pintarla antes de que haga falta)
  function siguiente(h) { var m = PA.mezcla(h); if (m.b) return m.b; for (var d = 0.2; d < 6; d += 0.2) { var n = PA.mezcla((h + d) % 24); if (n.a !== m.a) return n.a; if (n.b && n.b !== m.a) return n.b; } return m.a; }
  // una paleta mezclada (para lo que se pinta en vivo: aves, caballos, hierba de delante)
  var mezclada = {}, mezclaClave = '';
  function hex(c) { return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1); }
  PA.paleta = function () {
    var m = PA.mezcla(), clave = m.a + (m.b || '') + Math.round(m.k * 40);
    if (clave === mezclaClave) return mezclada;
    mezclaClave = clave; var a = PAL[m.a], b = m.b ? PAL[m.b] : null, out = {};
    for (var k in a) {
      var va = a[k];
      if (b && typeof va === 'string' && va[0] === '#' && va.length === 7) out[k] = hex(U.mezcla(U.rgb(va), U.rgb(b[k]), m.k));
      else if (b && Array.isArray(va)) out[k] = va.map(function (x, i) { return typeof x === 'number' ? U.lerp(x, b[k][i], m.k) : hex(U.mezcla(U.rgb(x), U.rgb(b[k][i]), m.k)); });
      else out[k] = m.k > 0.5 && b ? b[k] : va;
    }
    mezclada = out; return out;
  };

  /* ================================================================== las teselas */
  var cache = {}, pxGuardados = 0;
  var LIMITE = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 26e6 : 36e6;   // píxeles de teselas que se guardan
  function resCapa(capa) { return Math.min(2, E.dpr * capa.res); }
  PA.ocultos = {};   // grupos de moáis que una escena quita del paisaje (p. ej. { tongariki: true })
  function variante() { var v = []; for (var k in PA.ocultos) if (PA.ocultos[k]) v.push(k); return v.join(','); }
  function clave(capa, i, pal) { return capa.id + '|' + i + '|' + pal + (capa.id === 'costa' ? '|' + variante() : ''); }
  function pintarTesela(capa, i, pal) {
    var d = resCapa(capa), H = E.H, u = E.u, w = Math.ceil(TW * d), h = Math.ceil((capa.y1 - capa.y0) * H * d);
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var c = cv.getContext('2d'), P = PAL[pal];
    c.setTransform(d, 0, 0, d, -i * TW * d, -capa.y0 * H * d);
    var x0 = i * TW, x1 = x0 + TW, t0 = x0 / u, t1 = x1 / u;
    c.beginPath(); c.rect(x0, capa.y0 * H, TW, (capa.y1 - capa.y0) * H); c.clip();
    for (var k = 0; k < capa.els.length; k++) {
      var el = capa.els[k];
      if (el.l1 < t0 || el.l0 > t1) continue;
      c.save(); try { el.f(c, P, u, t0, t1); } catch (err) { console.error(err); } c.restore();
    }
    var T = { c: cv, px: w * h, usado: E.t };
    var k2 = clave(capa, i, pal); if (cache[k2]) pxGuardados -= cache[k2].px;
    cache[k2] = T; pxGuardados += T.px;
    return T;
  }
  function rango(capa, margen) {
    var base = (E.W / 2 + E.camX) * capa.p - E.W / 2;
    return [Math.floor((base - (margen || 0)) / TW), Math.floor((base + E.W + (margen || 0)) / TW)];
  }
  function tieneContenido(capa, i) {
    var t0 = i * TW / E.u, t1 = (i + 1) * TW / E.u;
    for (var k = 0; k < capa.els.length; k++) if (!(capa.els[k].l1 < t0 || capa.els[k].l0 > t1)) return true;
    return false;
  }
  function liberar() {
    if (pxGuardados <= LIMITE) return;
    var lista = []; for (var k in cache) lista.push([k, cache[k]]);
    lista.sort(function (a, b) { return a[1].usado - b[1].usado; });
    for (var j = 0; j < lista.length && pxGuardados > LIMITE * 0.85; j++) { if (E.t - lista[j][1].usado < 400) break; pxGuardados -= lista[j][1].px; delete cache[lista[j][0]]; }
  }
  PA.olvidar = function () { cache = {}; pxGuardados = 0; mezclaClave = ''; sprites = {}; };

  /* ---------- el taller: pinta las teselas que faltan, a trozos, primero lo que se ve ---------- */
  var pendientes = 0;
  function tareas() {
    var m = PA.mezcla(), pals = [m.a], lista = [];
    if (m.b) pals.push(m.b);
    var sig = siguiente(PA.hora); if (pals.indexOf(sig) < 0) pals.push(sig);
    var dir = E.velX > 0.05 || (E.camObj != null && E.camObj > E.camX) ? 1 : E.velX < -0.05 || (E.camObj != null && E.camObj < E.camX) ? -1 : 0;
    pals.forEach(function (pal, pi) {
      CAPAS.forEach(function (capa) {
        var vr = rango(capa, 0), cr = rango(capa, E.W * 0.9);
        for (var i = cr[0]; i <= cr[1]; i++) {
          if (cache[clave(capa, i, pal)] || !tieneContenido(capa, i)) continue;
          var visible = i >= vr[0] && i <= vr[1], dist = visible ? 0 : (i < vr[0] ? vr[0] - i : i - vr[1]);
          var prio = (visible ? 0 : 10 + dist * 2 - (dir && (i - vr[0]) * dir > 0 ? 1 : 0)) + pi * 4 + (pi === 2 ? 20 : 0);
          lista.push({ capa: capa, i: i, pal: pal, prio: prio });
        }
      });
    });
    lista.sort(function (a, b) { return a.prio - b.prio; });
    return lista;
  }
  function taller() {
    var presupuesto = E.bloqueado ? 40 : (E.camObj != null || Math.abs(E.velX) > 0.02) ? 4 : 10;
    var t0 = performance.now(), lista = tareas(), j = 0;
    pendientes = lista.filter(function (x) { return x.prio < 30; }).length;
    while (j < lista.length && performance.now() - t0 < presupuesto) {
      var tt = lista[j++]; pintarTesela(tt.capa, tt.i, tt.pal).usado = E.t; E.vaciar();
    }
    liberar();
  }
  PA.ocupado = function () { return pendientes > 0 || imp != null; };
  PA._taller = { tareas: tareas, cache: function () { return cache; }, px: function () { return pxGuardados; }, capas: CAPAS };
  // lo que se ve al empezar, del tirón (con la pantalla de carga delante)
  PA.preparar = function () {
    var m = PA.mezcla();
    [m.a].concat(m.b ? [m.b] : []).forEach(function (pal) {
      CAPAS.forEach(function (capa) { var vr = rango(capa, 0); for (var i = vr[0]; i <= vr[1]; i++) if (!cache[clave(capa, i, pal)] && tieneContenido(capa, i)) pintarTesela(capa, i, pal); });
    });
    E.vaciar();
  };

  /* ================================================================== lo que se pinta en vivo */
  // el cielo CSS: las tres capas de degradado se funden según la hora
  var cielos = null;
  function cielo() {
    if (!cielos) { cielos = {}; ['dia', 'dorada', 'ocaso', 'noche'].forEach(function (n) { cielos[n] = document.querySelector('.cielo-' + n); }); }
    var m = PA.mezcla(), orden = { dia: 0, dorada: 1, ocaso: 2, noche: 3 }, op = { dia: 0, dorada: 0, ocaso: 0, noche: 0 };
    if (!m.b) op[m.a] = 1;
    else if (orden[m.a] < orden[m.b]) { op[m.a] = 1; op[m.b] = m.k; } else { op[m.b] = 1; op[m.a] = 1 - m.k; }
    for (var n in op) { var el = cielos[n]; if (el && el._op !== op[n]) { el.style.opacity = op[n].toFixed(3); el._op = op[n]; } }
  }

  // el sol: sale por la derecha y se pone en el mar a la izquierda; la luna, de noche
  PA.sol = function (h) {
    h = h == null ? PA.hora : h; var s = (h - 6.9) / 12.2;
    var a = Math.sin(Math.PI * U.clamp(s, -0.1, 1.1)); return { x: E.W * (0.84 - 0.56 * s) + PA.desvioSol * E.W, y: E.H * (HOR - (a < 0 ? a : Math.pow(a, 1.6)) * 0.46), r: E.H * 0.075, visible: s > -0.08 && s < 1.08 };
  };
  PA.luna = function (h) {
    h = h == null ? PA.hora : h; var s = ((h - 19.6 + 24) % 24) / 10;
    return { x: E.W * (0.86 - 0.62 * s), y: E.H * (HOR - Math.sin(Math.PI * U.clamp(s, -0.1, 1.1)) * 0.52), r: E.H * 0.038, visible: s > -0.05 && s < 1.05 };
  };

  PA.luz = function () {
    var so = PA.sol(), lu = PA.luna(), H = E.H;
    var es = U.clamp((H * HOR - so.y) / (H * 0.46), 0, 1), is = so.visible ? U.suave(U.tramo(es, 0, 0.02)) : 0;
    var em = U.clamp((H * HOR - lu.y) / (H * 0.52), 0, 1), im = lu.visible ? U.suave(U.tramo(em, 0, 0.08)) * PA.peso('noche') * 0.7 : 0;
    return is >= im ? { x: so.x, e: es, i: is, sol: true } : { x: lu.x, e: em, i: im, sol: false };
  };
  // el color del sol según su altura: amarillo pálido arriba, naranja, coral y rojo al tocar el mar
  var TONOS_SOL = [[0, '#ff5a4e'], [0.06, '#ff7f6e'], [0.18, '#ffa063'], [0.35, '#ffd27a'], [0.6, '#fff4d6']];
  function tonoSol(e) {
    for (var i = 0; i < TONOS_SOL.length - 1; i++) { var a = TONOS_SOL[i], b = TONOS_SOL[i + 1]; if (e <= b[0]) return U.mezcla(U.rgb(a[1]), U.rgb(b[1]), U.suave(U.tramo(e, a[0], b[0]))); }
    return U.rgb(TONOS_SOL[TONOS_SOL.length - 1][1]);
  }
  var enCosta = []; PA.enCosta = function (fn) { enCosta.push(fn); };
  PA.sombrasExtra = [];
  function vivos() { return PA.sombrasExtra.concat(caballos.map(function (cv, cb) { return { tipo: 'cabeza', l: cv.l, y: suelo(cv.l) + 0.05 + (cb % 2) * 0.018, h: cv.s * 0.9, w: cv.s * 0.42 }; })); }
  // las sombras vivas: salen del pie de cada cosa y caen hacia delante, lejos de la luz
  var tramaSombra = null;
  function sombrasVivas(ctx) {
    var L = PA.luz(); if (L.i < 0.02) return;
    if (!tramaSombra) { var tc = document.createElement('canvas'); tc.width = tc.height = 8; var tx = tc.getContext('2d'); tx.strokeStyle = 'rgba(8,6,20,1)'; tx.lineWidth = 1.2; tx.beginPath(); tx.moveTo(-2, 10); tx.lineTo(10, -2); tx.moveTo(-2, 2); tx.lineTo(2, -2); tx.moveTo(6, 10); tx.lineTo(10, 6); tx.stroke(); tramaSombra = ctx.createPattern(tc, 'repeat'); }
    var W = E.W, H = E.H, u = E.u, alfa = (L.sol ? 0.3 : 0.24) * L.i, largo = U.clamp(0.2 / Math.max(L.e, 0.035), 0.28, 1.7);
    var p = new Path2D(), lista = SOMBRAS.concat(vivos());
    ctx.save();
    for (var i = 0; i < lista.length; i++) {
      var o = lista[i], x0 = E.sx(o.l, 1); if (x0 < -W * 0.6 || x0 > W * 1.6 || (o.g && PA.ocultos[o.g])) continue;
      var y0 = o.y * H, h = o.h * u, w = o.w * u, Ls = h * largo, dy = Ls * 0.5, dx = U.clamp((x0 - L.x) / W, -1.2, 1.2) * Ls * 0.9;
      if (Math.max(x0, x0 + dx) < -w * 2 || Math.min(x0, x0 + dx) > W + w * 2) continue;
      var P = function (t, s) { return [x0 + dx * t + s * w, y0 + dy * t]; }, q;
      if (o.tipo === 'moai' || o.tipo === 'cabeza') {
        var pts = o.tipo === 'moai' ? [P(0, -1), P(0.5, -1.06), P(0.6, -0.62), P(0.66, -0.6), P(0.97, -0.6), P(1.02, 0), P(0.97, 0.6), P(0.66, 0.6), P(0.6, 0.62), P(0.5, 1.06), P(0, 1)]
                                     : [P(0, -1), P(0.2, -1), P(0.95, -0.62), P(1.02, 0), P(0.95, 0.62), P(0.2, 1), P(0, 1)];
        p.moveTo(pts[0][0], pts[0][1]); for (q = 1; q < pts.length; q++) p.lineTo(pts[q][0], pts[q][1]); p.closePath();
      } else if (o.tipo === 'palma') {
        var tx2 = x0 + o.extra * h, a1 = P(0, -1), a2 = P(0, 1), b0 = [tx2 + dx * 0.85, y0 + dy * 0.85];
        p.moveTo(a1[0], a1[1]); p.lineTo(b0[0] - w * 0.4, b0[1]); p.lineTo(b0[0] + w * 0.4, b0[1]); p.lineTo(a2[0], a2[1]); p.closePath();
        p.ellipse(tx2 + dx, y0 + dy, h * 0.32, h * 0.32 * 0.3, 0, 0, TAU);
      } else {
        // casas, piedras, cuerpos tumbados: una mancha que se alarga
        var c0 = P(0.5, 0); p.moveTo(c0[0] + Math.abs(dx) * 0.5 + w, c0[1]); p.ellipse(c0[0], c0[1], Math.abs(dx) * 0.5 + w, dy * 0.5 + w * 0.12, 0, 0, TAU);
      }
    }
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(8,6,20,' + alfa.toFixed(3) + ')'; ctx.fill(p);
    ctx.globalAlpha = alfa * 0.9; ctx.fillStyle = tramaSombra; ctx.fill(p);
    ctx.restore(); ctx.globalAlpha = 1;
  }

  // las estrellas (fijas), la Cruz del Sur y los Punteros, y la Vía Láctea
  var estrellas = null, viaLactea = null;
  function prepararCielo() {
    var r = U.azar(99); estrellas = [];
    for (var i = 0; i < 420; i++) { var y = Math.pow(r(), 1.3) * HOR * 0.98; estrellas.push({ x: r(), y: y, s: r() < 0.06 ? 1.8 : r() < 0.3 ? 1.2 : 0.7, f: r() * TAU, v: 0.4 + r() * 0.9 }); }
    // la Cruz del Sur (Acrux, Mimosa, Gacrux, δ Cru, ε Cru) y los dos Punteros (α y β Centauri)
    var cx = 0.72, cy = 0.22, k = 0.055;
    [[0, 0.95, 2.6], [0.62, 0.15, 2.3], [0.05, -0.95, 2.2], [-0.55, -0.05, 1.8], [-0.28, 0.42, 1.2], [1.95, 0.95, 2.6], [1.45, 0.55, 2.3]].forEach(function (q) { estrellas.push({ x: cx + q[0] * k, y: cy + q[1] * k * 1.4, s: q[2], f: r() * TAU, v: 0.3, cruz: true }); });
    var c = document.createElement('canvas'); c.width = 360; c.height = 200; var x = c.getContext('2d');
    for (i = 0; i < 1600; i++) {
      var t = r(), bx = t * 360, by = 160 - t * 120 + (r() - 0.5) * 50 * (0.6 + Math.sin(t * 7) * 0.4);
      x.fillStyle = 'rgba(220,225,255,' + (0.05 + r() * 0.12).toFixed(3) + ')'; x.beginPath(); x.arc(bx, by, 0.5 + r() * 1.6, 0, TAU); x.fill();
    }
    for (i = 0; i < 26; i++) { var t2 = r(); x.fillStyle = 'rgba(10,12,30,.35)'; x.beginPath(); x.ellipse(t2 * 360, 160 - t2 * 120 + (r() - 0.5) * 14, 8 + r() * 14, 3 + r() * 4, -0.32, 0, TAU); x.fill(); }
    viaLactea = c;
  }

  PA.cruz = function () {
    if (!estrellas) prepararCielo();
    var c = estrellas.filter(function (st) { return st.cruz; }), x = 0, y = 0;
    var pts = c.map(function (st) { return [((st.x * E.W - E.camX * 0.02) % E.W + E.W) % E.W, st.y * E.H]; });
    pts.slice(0, 5).forEach(function (q) { x += q[0]; y += q[1]; });
    return { x: x / 5, y: y / 5, r: E.H * 0.07, pts: pts };
  };
  // las nubes: sprites por paleta (estratocúmulos de lóbulos con la panza encendida)
  var sprites = {};
  var NUBES = [[0.1, 0.27, 0.2, 1], [0.38, 0.18, 0.26, 2], [0.64, 0.14, 0.3, 3], [0.9, 0.24, 0.22, 4], [0.24, 0.38, 0.14, 5], [0.55, 0.34, 0.16, 6], [0.8, 0.41, 0.12, 7]];
  function spriteNube(pal, n) {
    var k = 'nube' + pal + n; if (sprites[k]) return sprites[k];
    var P = PAL[pal], r = U.azar(n * 31), w = 520, h = 170, c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'), base = h * 0.92, p = new Path2D(), lob = 6 + Math.round(r() * 3);
    for (var i = 0; i < lob; i++) { var t = (i + 0.5) / lob, cx = w * 0.08 + w * 0.84 * t, rr = h * (0.24 + r() * 0.26) * (1 - Math.pow(Math.abs(t - 0.5) * 2, 1.6) * 0.5); p.moveTo(cx + rr, base - rr * 0.8); p.arc(cx, base - rr * 0.8, rr, 0, TAU); }
    p.rect(w * 0.14, base - h * 0.14, w * 0.72, h * 0.14);
    x.save(); x.beginPath(); x.rect(0, 0, w, base); x.clip(); x.fillStyle = P.nube; x.fill(p);
    x.clip(p); var g = x.createLinearGradient(0, base - h * 0.5, 0, base); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, P.nubeSombra);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // la trama de puntos de la serigrafía
    x.fillStyle = pal === 'dia' ? 'rgba(40,60,100,.07)' : 'rgba(20,16,40,.18)'; for (var yy = 3; yy < h; yy += 6) for (var xx = (yy / 6 % 2) * 3; xx < w; xx += 6) { x.beginPath(); x.arc(xx, yy, 1.1, 0, TAU); x.fill(); }
    x.restore();
    return (sprites[k] = c);
  }
  // la hierba de delante (viva): unas cuantas matas por paleta
  function spriteMata(pal, n) {
    var k = 'mata' + pal + n; if (sprites[k]) return sprites[k];
    var c = document.createElement('canvas'), d = Math.min(2, E.dpr), w = 90 * d, h = 80 * d; c.width = w; c.height = h;
    var x = c.getContext('2d'); x.scale(d, d); var Q = Object.create(PAL[pal]); Q.mataLuz = A.mezclar(Q.mata, PAL[pal].mataLuz, 0.5); A.mata(x, Q, 45, 78, 1.9, 700 + n * 13, 9);
    return (sprites[k] = c);
  }

  // los caballos: andan despacio por la costa, se paran a pastar
  var caballos = [{ l: 2.25, dir: 1, s: 0.045 }, { l: 2.32, dir: -1, s: 0.038 }, { l: 6.25, dir: 1, s: 0.044 }, { l: 9.15, dir: -1, s: 0.046 }, { l: 4.5, dir: 1, s: 0.04 }];
  caballos.forEach(function (cb, i) { cb.l0 = cb.l; cb.fase = i * 1.7; cb.pasta = 0; cb.paso = 0; });
  function moverCaballos(dt) {
    caballos.forEach(function (cb, i) {
      cb.fase += dt / 1000;
      var andando = Math.sin(cb.fase * 0.23 + i) > 0.35;
      if (andando) { cb.l += cb.dir * dt / 1000 * 0.012; cb.paso += dt / 1000 * 5.5; if (Math.abs(cb.l - cb.l0) > 0.25) cb.dir = cb.l > cb.l0 ? -1 : 1; }
      cb.pasta += ((andando ? 0 : 1) - cb.pasta) * Math.min(1, dt / 600);
    });
  }

  // las aves (manutara): una bandada que cruza el cielo y planea
  var aves = []; (function () { var r = U.azar(5); for (var i = 0; i < 9; i++) aves.push({ x: r(), y: 0.12 + r() * 0.22, v: 0.012 + r() * 0.01, f: r() * TAU, s: 7 + r() * 6 }); })();

  // las olas: trazos cortos sobre el mar que derivan y se apagan
  var olas = []; (function () { var r = U.azar(17); for (var i = 0; i < 70; i++) olas.push({ x: r(), y: Math.pow(r(), 1.6), w: 0.02 + r() * 0.05, f: r() * TAU, v: 0.002 + r() * 0.004 }); })();

  // las olas que rompen contra la costa: una nube de espuma que sube, se abre y cae; cada una a su ritmo
  var olasCosta = []; (function () {
    var r = U.azar(23);
    for (var l = 0.56; l < L; l += 0.1 + r() * 0.12) if (suelo(l) > 0.62) olasCosta.push({ l: l, y: null, periodo: 4.5 + r() * 3.5, fase: r() * 9, w: 0.025 + r() * 0.03 });
    [[0.21, 0.955], [0.17, 0.995], [0.245, 0.91]].forEach(function (q, i) { olasCosta.push({ l: q[0], y: q[1], periodo: 5 + i * 1.3, fase: i * 2.1, w: 0.04 }); });
  })();
  function rompientes(ctx, P) {
    var tt = E.t / 1000, H = E.H, u = E.u;
    ctx.fillStyle = P.espuma;
    for (var i = 0; i < olasCosta.length; i++) {
      var o = olasCosta[i], x = E.sx(o.l, 1); if (x < -80 || x > E.W + 80) continue;
      var k = ((tt + o.fase) % o.periodo) / o.periodo; if (k > 0.5) continue;
      k /= 0.5; var y = (o.y != null ? o.y : suelo(o.l)) * H, w = o.w * u * 1.5, sube = Math.sin(Math.PI * Math.min(1, k * 1.3)) * w * 0.7;
      ctx.globalAlpha = 0.85 * (1 - U.entra(k));
      for (var b = 0; b < 6; b++) {
        var bx = x + (b - 2.5) * w * 0.22 * (0.6 + k), by = y - sube * (1 - Math.abs(b - 2.5) / 3.2) - 2, br = w * (0.07 + 0.12 * k) * (1 - Math.abs(b - 2.5) / 5);
        if (k > 0.25) { ctx.beginPath(); ctx.arc(bx + (b - 2.5) * w * 0.08 * k, by - w * 0.25 * k, br * 0.35, 0, TAU); ctx.fill(); }
        ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
      }
      ctx.fillRect(x - w * 0.6 * (0.5 + k), y - 2.5, w * 1.2 * (0.5 + k), 2.5);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- un paso ---------- */
  var hierbas = []; (function () { var r = U.azar(41); for (var l = 0.95; l < 17.5; l += 0.07 + r() * 0.1) hierbas.push({ l: l, y: 0.985 + r() * 0.035, s: 0.9 + r() * 0.7, n: Math.floor(r() * 5), f: r() * TAU }); })();
  PA.actualizar = function (dt) {
    if (!estrellas) prepararCielo();
    if (!E.escena || !E.escena.s.detenerDia) PA.hora = (PA.hora + dt / 1000 / segPorHora(PA.hora) * PA.velocidad) % 24;
    moverCaballos(dt);
    if (!E.escena) PA.desvioSol *= Math.exp(-dt / 7000);
    cielo();
    taller();
  };

  /* ---------- un fotograma ---------- */
  function capaTeselas(ctx, capa, m) {
    var vr = rango(capa, 0), bandaY = capa.y0 * E.H, bandaH = (capa.y1 - capa.y0) * E.H;
    for (var i = vr[0]; i <= vr[1]; i++) {
      if (!tieneContenido(capa, i)) continue;
      var x = E.W / 2 + i * TW - (E.W / 2 + E.camX) * capa.p;
      var ta = cache[clave(capa, i, m.a)], tb = m.b && m.k > 0.004 ? cache[clave(capa, i, m.b)] : null;
      if (!ta && !tb) ta = pintarTesela(capa, i, m.a);   // (no debería pasar: el taller va por delante)
      if (ta) { ta.usado = E.t; ctx.globalAlpha = 1; ctx.drawImage(ta.c, x, bandaY, TW, bandaH); }
      if (tb) { tb.usado = E.t; ctx.globalAlpha = ta ? m.k : 1; ctx.drawImage(tb.c, x, bandaY, TW, bandaH); }
    }
    ctx.globalAlpha = 1;
  }
  // la impresión de la entrada: cada tinta entra con una pasada de la rasqueta, de izquierda a derecha
  var imp = null, PASADAS = 4, DUR = 620, SOLAPE = 140;
  var TINTAS = ['#c95c5b', '#2a3961', '#4c5a33', '#1f2814'];
  PA.imprimir = function () { imp = { t0: E.t }; document.documentElement.classList.add('imprimiendo'); };
  function revelado(g) {
    if (!imp) return E.W;
    var t = E.t - imp.t0 - g * (DUR - SOLAPE);
    return E.W * U.inOut(U.clamp(t / DUR, 0, 1)) * 1.04;
  }
  function recortar(ctx, g) { var x = revelado(g); if (x >= E.W) return false; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, x), E.H); ctx.clip(); return true; }

  PA.dibujar = function (ctx, s, t) {
    var W = E.W, H = E.H, m = PA.mezcla(), P = PA.paleta(), noche = PA.peso('noche'), rc;
    var papel = document.querySelector('.papel');
    if (imp) { var x0 = revelado(0); if (papel) papel.style.clipPath = 'inset(0 0 0 ' + Math.min(W, x0).toFixed(1) + 'px)'; }

    /* --- 0: el cielo (sol, luna, estrellas, nubes, aves) --- */
    rc = recortar(ctx, 0);
    if (noche > 0.01) {
      ctx.globalAlpha = noche * 0.55; ctx.drawImage(viaLactea, -E.camX * 0.01 % 40 - 20, 0, W + 40, H * HOR * 0.95); ctx.globalAlpha = 1;
      var tt = E.t / 1000;
      for (var i = 0; i < estrellas.length; i++) {
        var st = estrellas[i], a = noche * (st.cruz ? 1 : 0.55 + 0.45 * Math.sin(tt * st.v + st.f));
        if (a < 0.03) continue;
        ctx.fillStyle = 'rgba(240,238,255,' + a.toFixed(3) + ')';
        var sx = ((st.x * W - E.camX * 0.02) % W + W) % W, sy = st.y * H;
        ctx.fillRect(sx - st.s / 2, sy - st.s / 2, st.s, st.s);
        if (st.s > 2) { ctx.fillRect(sx - st.s * 1.6, sy - 0.4, st.s * 3.2, 0.8); ctx.fillRect(sx - 0.4, sy - st.s * 1.6, 0.8, st.s * 3.2); }
      }
    }
    var so = PA.sol();
    if (so.visible) {
      var es = U.clamp((H * HOR - so.y) / (H * 0.46), -0.2, 1), ts = tonoSol(Math.max(0, es)), cerca = U.clamp(1 - (H * HOR - so.y) / (so.r * 2.2), 0, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H * HOR); ctx.clip();
      // el halo, más grande y más rojo cuanto más bajo
      var g = ctx.createRadialGradient(so.x, so.y, so.r * 0.6, so.x, so.y, so.r * (5 + cerca * 3));
      g.addColorStop(0, U.rgba(ts, 0.42 + cerca * 0.18)); g.addColorStop(1, U.rgba(ts, 0));
      ctx.fillStyle = g; ctx.fillRect(so.x - so.r * 9, so.y - so.r * 9, so.r * 18, so.r * 18);
      // el anillo de semitono alrededor del disco
      ctx.fillStyle = U.rgba(ts, 0.55); ctx.beginPath();
      for (var an = 0; an < 3; an++) { var rr0 = so.r * (1.25 + an * 0.28), nn = Math.round(rr0 * 0.55); for (var k2 = 0; k2 < nn; k2++) { var aa = k2 / nn * TAU + an * 0.3, pr = Math.max(0.4, 2.2 - an * 0.7); ctx.moveTo(so.x + Math.cos(aa) * rr0 + pr, so.y + Math.sin(aa) * rr0); ctx.arc(so.x + Math.cos(aa) * rr0, so.y + Math.sin(aa) * rr0, pr, 0, TAU); } }
      ctx.fill();
      // el disco: se achata un poco al llegar al horizonte (la refracción del aire)
      ctx.fillStyle = U.rgba(ts, 1); ctx.beginPath(); ctx.ellipse(so.x, so.y, so.r * (1 + cerca * 0.04), so.r * (1 - cerca * 0.12), 0, 0, TAU); ctx.fill();
      if (es < 0.45) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.45 * U.tramo(0.45 - es, 0, 0.2); ctx.fillStyle = '#ff7f6e'; ctx.beginPath(); ctx.ellipse(so.x + 5, so.y + 3.5, so.r, so.r * (1 - cerca * 0.12), 0, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      ctx.restore();
    }
    var lu = PA.luna();
    if (lu.visible && noche > 0.05) {
      ctx.save(); ctx.globalAlpha = Math.min(1, noche * 1.3); ctx.beginPath(); ctx.rect(0, 0, W, H * HOR); ctx.clip();
      var gl = ctx.createRadialGradient(lu.x, lu.y, lu.r, lu.x, lu.y, lu.r * 6); gl.addColorStop(0, 'rgba(200,215,255,.28)'); gl.addColorStop(1, 'rgba(200,215,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(lu.x - lu.r * 6, lu.y - lu.r * 6, lu.r * 12, lu.r * 12);
      ctx.fillStyle = '#efe8d6'; ctx.beginPath(); ctx.arc(lu.x, lu.y, lu.r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(150,150,175,.45)'; [[-0.3, -0.2, 0.25], [0.25, 0.1, 0.18], [-0.05, 0.4, 0.14], [0.35, -0.35, 0.1]].forEach(function (q) { ctx.beginPath(); ctx.arc(lu.x + q[0] * lu.r, lu.y + q[1] * lu.r, q[2] * lu.r, 0, TAU); ctx.fill(); });
      ctx.restore();
    }
    // nubes (derivan muy despacio)
    for (var n = 0; n < NUBES.length; n++) {
      var q = NUBES[n], nw = W * q[2] * (W < 700 ? 1.8 : 1), nh = nw * 170 / 520;
      var nx = ((q[0] * W * 1.3 - E.camX * 0.05 + E.t * 0.004 * (1 + n * 0.15)) % (W * 1.3 + nw) + (W * 1.3 + nw)) % (W * 1.3 + nw) - nw;
      var ny = q[1] * H - nh * 0.9;
      ctx.globalAlpha = 1; ctx.drawImage(spriteNube(m.a, q[3]), nx, ny, nw, nh);
      if (m.b && m.k > 0.004) { ctx.globalAlpha = m.k; ctx.drawImage(spriteNube(m.b, q[3]), nx, ny, nw, nh); }
    }
    ctx.globalAlpha = 1;
    // las aves
    ctx.strokeStyle = P.ave; ctx.lineCap = 'round';
    for (var b = 0; b < aves.length; b++) {
      var av = aves[b], ax = ((av.x * W * 1.4 + E.t * av.v * W / 1000 * 0.05 - E.camX * 0.25) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2, ay = av.y * H + Math.sin(E.t / 1700 + av.f) * 8;
      var al = Math.sin(E.t / 260 + av.f) * 0.5, sz = av.s;
      ctx.lineWidth = Math.max(1.4, sz * 0.18); ctx.beginPath(); ctx.moveTo(ax - sz, ay - sz * (0.2 + al * 0.5)); ctx.quadraticCurveTo(ax - sz * 0.45, ay - sz * 0.55 * (0.4 + al), ax, ay); ctx.quadraticCurveTo(ax + sz * 0.45, ay - sz * 0.55 * (0.4 + al), ax + sz, ay - sz * (0.2 + al * 0.5)); ctx.stroke();
    }
    if (s && s.cielo) s.cielo(ctx, t);
    if (rc) ctx.restore();

    /* --- 1: el mar y lo lejano --- */
    rc = recortar(ctx, 1);
    capaTeselas(ctx, CAPA.lejos, m);
    var gm = ctx.createLinearGradient(0, H * HOR, 0, H); gm.addColorStop(0, P.mar[0]); gm.addColorStop(1, P.mar[1]);
    ctx.fillStyle = gm; ctx.fillRect(0, H * HOR, W, H * (1 - HOR));
    // el camino de luz del sol (o de la luna) sobre el agua
    var fuente = so.visible && so.y < H * HOR + so.r ? so : (lu.visible && noche > 0.3 ? lu : null);
    if (fuente) {
      var eF = U.clamp((H * HOR - fuente.y) / (H * 0.46), 0, 1);
      ctx.fillStyle = fuente === so ? U.rgba(U.mezcla(tonoSol(eF), [255, 255, 255], 0.35), 1) : P.reflejo;
      // destellos: chispas que se encienden y se apagan en las crestas, alrededor del camino de luz
      for (var dz = 0; dz < 34; dz++) {
        var fz = U._h(dz * 7.3), dyz = H * HOR + 6 + Math.pow(U._h(dz * 3.1), 1.5) * H * 0.2, dxz = fuente.x + (U._h(dz * 5.7) - 0.5) * fuente.r * (3 + (dyz - H * HOR) / 20);
        var az = Math.max(0, Math.sin(E.t / (380 + fz * 600) + fz * 40)); if (az < 0.6) continue;
        ctx.globalAlpha = (az - 0.6) * 2.2 * (fuente === lu ? noche : 1); ctx.fillRect(dxz - 2, dyz, 4 + fz * 5, 1.6);
      }
      ctx.globalAlpha = 1;
      for (var k = 0; k < 16; k++) {
        var ry = H * HOR + 4 + k * 6.5, rw = fuente.r * (1.6 - k * 0.07) * (0.6 + Math.abs(Math.sin(k * 1.7 + E.t / 900)) * 0.5);
        ctx.globalAlpha = (1 - k / 17) * (fuente === lu ? noche : 1) * 0.9; ctx.fillRect(fuente.x - rw / 2 + Math.sin(k * 3 + E.t / 1300) * 8, ry, rw, 2.4);
      }
      ctx.globalAlpha = 1;
    }
    // el ritmo del mar: líneas largas de tinta clara, más juntas cerca del horizonte
    ctx.strokeStyle = P.ola;
    for (var li = 1; li < 12; li++) {
      var ly = H * HOR + Math.pow(li / 12, 1.7) * H * (1 - HOR) * 0.9, fase = E.t / 2600 + li * 1.3;
      ctx.globalAlpha = 0.16 + li * 0.012; ctx.lineWidth = 0.9 + li * 0.14; ctx.beginPath();
      for (var lx = -20; lx <= W + 20; lx += 24) { var yy = ly + Math.sin(lx * 0.012 + fase + E.camX * 0.0006 * li) * (0.8 + li * 0.25); lx === -20 ? ctx.moveTo(lx, yy) : ctx.lineTo(lx, yy); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = P.ola;
    for (var o = 0; o < olas.length; o++) {
      var ol = olas[o], oy = H * HOR + 5 + ol.y * H * 0.38, ox = ((ol.x * W * 1.2 - E.camX * (0.15 + ol.y * 0.7) + E.t * ol.v) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * 0.1;
      ctx.globalAlpha = (0.2 + 0.35 * (0.5 + 0.5 * Math.sin(E.t / 1100 + ol.f))) * (1 - ol.y * 0.4);
      ctx.fillRect(ox, oy, ol.w * W * (0.5 + ol.y), 1.4 + ol.y * 1.4);
    }
    ctx.globalAlpha = 1;
    capaTeselas(ctx, CAPA.volcanes, m);
    capaTeselas(ctx, CAPA.medio, m);
    if (s && s.mar) s.mar(ctx, t);
    if (rc) ctx.restore();

    /* --- 2: la costa --- */
    rc = recortar(ctx, 2);
    if (s && s.detras) s.detras(ctx, t);
    rompientes(ctx, P);
    capaTeselas(ctx, CAPA.costa, m);
    sombrasVivas(ctx);
    for (var cb = 0; cb < caballos.length; cb++) {
      var cv = caballos[cb], cx = E.sx(cv.l, 1); if (cx < -80 || cx > W + 80) continue;
      var cy = (suelo(cv.l) + 0.05 + (cb % 2) * 0.018) * H, chs = cv.s * H;
      // su sombra, que sale de los cascos
      A.contacto(ctx, cx, cy, chs * 0.6, chs * 0.08, 0.35);
      A.caballo(ctx, P, cx, cy, chs, cv.paso, cv.pasta > 0.5, cv.dir < 0);
    }
    for (var ec = 0; ec < enCosta.length; ec++) { try { enCosta[ec](ctx, P); } catch (err) { console.error(err); } }
    if (s && s.costa) s.costa(ctx, t);
    if (rc) ctx.restore();

    /* --- 3: lo de delante --- */
    rc = recortar(ctx, 3);
    capaTeselas(ctx, CAPA.cerca, m);
    var vt = E.t / 1000, pv = 1.6;
    for (var hh = 0; hh < hierbas.length; hh++) {
      var hb = hierbas[hh], hx = E.sx(hb.l, pv); if (hx < -120 || hx > W + 120) continue;
      // la brisa, las ráfagas que recorren la costa y lo que mueve el ratón
      var rafaga = Math.pow(Math.max(0, Math.sin((hb.l * 0.55 - vt * 0.32) * TAU * 0.5)), 6);
      var ang = Math.sin(vt * 1.3 + hb.f) * 0.05 + rafaga * 0.16 + E.viento * 0.2 * Math.sin(vt * 6 + hb.f);
      var sw = 90 * hb.s * H / 900, sh = 80 * hb.s * H / 900;
      ctx.save(); ctx.translate(hx, hb.y * H); ctx.rotate(ang);
      ctx.globalAlpha = 1; ctx.drawImage(spriteMata(m.a, hb.n), -sw / 2, -sh, sw, sh);
      if (m.b && m.k > 0.004) { ctx.globalAlpha = m.k; ctx.drawImage(spriteMata(m.b, hb.n), -sw / 2, -sh, sw, sh); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (s && s.cerca) s.cerca(ctx, t);
    if (rc) ctx.restore();
  };
  // la rasqueta de la impresión (encima de todo)
  PA.dibujarImpresion = function (ctx) {
    if (!imp) return;
    var W = E.W, H = E.H, g = Math.floor((E.t - imp.t0) / (DUR - SOLAPE));
    if (E.t - imp.t0 > PASADAS * (DUR - SOLAPE) + SOLAPE + 80) { imp = null; document.documentElement.classList.remove('imprimiendo'); var pp = document.querySelector('.papel'); if (pp) pp.style.clipPath = 'inset(0 0 0 100%)'; return; }
    for (var k = Math.max(0, g - 1); k <= Math.min(PASADAS - 1, g); k++) {
      var x = revelado(k); if (x <= 0 || x >= W * 1.03) continue;
      // el cordón de tinta que empuja la rasqueta y la goma con su mango
      ctx.fillStyle = TINTAS[k]; ctx.beginPath(); ctx.ellipse(x + 7, H / 2, 7, H * 0.52, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x + 4, 0, 2, H);
      ctx.fillStyle = '#1b1d36'; ctx.fillRect(x - 6, 0, 6, H);
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 22, 0, 16, H);
      ctx.fillStyle = 'rgba(255,230,190,.35)'; ctx.fillRect(x - 20, 0, 3, H);
    }
  };
  PA.imprimiendo = function () { return !!imp; };

  E.en('tamano', function () { PA.olvidar(); });
  construir();
})();
