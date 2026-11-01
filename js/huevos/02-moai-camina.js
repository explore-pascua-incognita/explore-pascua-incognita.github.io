/* Secreto 02 · El moái que camina (Gesto)
   Un moái a medio camino, de pie en la hierba entre Ahu Akivi y Te Pito Kura, con las cuerdas por el suelo. Agarrarlo y
   balancearlo de lado a lado (cuatro vaivenes) lo hace «caminar», como en el experimento de Hunt y Lipo (2012).
   La escena: llegan los tres equipos y tensan las cuerdas; el moái se balancea y avanza, cada paso levanta polvo y deja
   el surco en la hierba; un contador cuenta los pasos. Se pinta en vivo (no en las teselas) para poder moverlo. */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje, A = RN.arte, S = RN.esc;
  var TAU = Math.PI * 2, L0 = 4.53, ALTO = 0.2, PASOS = 14, T0 = 2200, T1 = 11800, AVANCE = 0.24;
  var estado = { l: L0, giro: 0, agarre: null };
  var sombra = { tipo: 'moai', l: L0, y: 0, h: ALTO, w: ALTO * 0.15 };
  PA.sombrasExtra.push(sombra);

  function base() { return PA.suelo(estado.l) + 0.045; }
  function pintar(c, P, op) {
    op = op || {};
    var u = E.u, x = E.sx(estado.l, 1), y = base() * E.H, h = ALTO * u;
    if (x < -h * 2 || x > E.W + h * 2) return;
    sombra.l = estado.l; sombra.y = base();
    A.contacto(c, x, y, h * 0.22, h * 0.035, 0.45);
    if (!op.cuerdas) { c.save(); c.strokeStyle = P.tierra; c.lineWidth = Math.max(1.2, h * 0.012); c.beginPath(); c.moveTo(x - h * 0.05, y - h * 0.82); c.quadraticCurveTo(x - h * 0.4, y - h * 0.2, x - h * 0.7, y + h * 0.04); c.moveTo(x + h * 0.05, y - h * 0.82); c.quadraticCurveTo(x + h * 0.45, y - h * 0.25, x + h * 0.8, y + h * 0.06); c.stroke(); c.restore(); }
    // el moái se balancea sobre una esquina de la base (así «anda»)
    var g = estado.giro, pivote = g > 0 ? 1 : -1;
    c.save(); c.translate(x + pivote * h * 0.13, y); c.rotate(g); c.translate(-(x + pivote * h * 0.13), -y);
    A.moai(c, P, A.moaiGeo(x, y, h, 0, 0.3), { semilla: 452, roto: true });
    c.restore();
    if (op.cuerdas) op.cuerdas(x, y, h, g);
  }
  PA.enCosta(function (c, P) { if (!(E.escena && E.escena.h.id === 'moai-camina')) pintar(c, P); });
  function sobre(d) { var x = E.sx(estado.l, 1), y = base() * E.H, h = ALTO * E.u; return Math.abs(d.x - x) < h * 0.2 && d.y < y + 4 && d.y > y - h * 1.02; }

  RN.registrar({
    id: 'moai-camina', n: 2, nombre: 'El moái que camina', tipo: 'Gesto',
    pista: 'Dicen que no los arrastraron: los hicieron andar.',
    detectar: function (api) {
      api.en('bajar', function (d) { if (sobre(d)) { d.tomar(); estado.agarre = { x: d.x, ext: d.x, dir: 0, vaivenes: 0 }; } });
      api.en('arrastrar', function (d) {
        var a = estado.agarre; if (!a) return;
        estado.giro = U.clamp((d.x - a.x) / (E.u * 0.25), -1, 1) * 0.12;
        var dx = d.x - a.ext, min = E.u * 0.02;
        if (a.dir >= 0 && dx < -min) { if (a.dir > 0) a.vaivenes++; a.dir = -1; a.ext = d.x; }
        else if (a.dir <= 0 && dx > min) { if (a.dir < 0) a.vaivenes++; a.dir = 1; a.ext = d.x; }
        else if ((a.dir > 0 && d.x > a.ext) || (a.dir < 0 && d.x < a.ext)) a.ext = d.x;
      });
      api.en('soltar', function () { var a = estado.agarre; estado.agarre = null; estado.giro = 0; if (a && a.vaivenes >= 4) api.disparar(); });
      api.en('cuadro', function (d) { if (!estado.agarre) estado.giro *= Math.pow(0.85, d.dt / 16); });
    },
    escena: function () {
      var D = 13000 + E.lectura;
      return {
        duracion: D,
        tarjeta: { en: 7600, hasta: D - 400, titulo: 'El moái que caminaba', pie: 'Experimento de Terry Hunt y Carl Lipo · 2012',
          texto: 'La tradición de Rapa Nui dice que los moáis «caminaron» hasta sus ahu. En 2012, los arqueólogos Terry Hunt y Carl Lipo lo probaron con una réplica de unas cinco toneladas: dieciocho personas con tres cuerdas la balancearon de lado a lado y avanzó cientos de metros sin volcar.' },
        inicio: function () { E.irA(L0 - 0.12, 1400); },
        fin: function () { estado.l = L0; estado.giro = 0; },
        costa: function (c, t) {
          var P = PA.paleta(), k = U.tramo(t, T0, T1), H = E.H, u = E.u, yb = PA.suelo(L0) + 0.045;
          // el balanceo: un paso es medio vaivén; avanza al apoyar
          var fase = k * PASOS, paso = Math.floor(fase), f = fase - paso, on = U.meseta(t, T0, T0 + 600, T1 - 600, T1);
          estado.giro = Math.sin(fase * Math.PI) * 0.11 * on;
          estado.l = L0 - (paso + U.suave(f)) / PASOS * AVANCE * U.clamp(k * 30, 0, 1);
          // el surco y la hierba aplastada desde donde estaba
          var x0 = E.sx(L0, 1), x1 = E.sx(estado.l, 1), y = base() * H;
          if (x0 - x1 > 2) {
            c.fillStyle = A.mezclar(P.tierra, P.hierba[0], 0.4); c.globalAlpha = 0.8; c.fillRect(x1, y - 3, x0 - x1, 7); c.globalAlpha = 1;
            c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y + 4); c.lineTo(x0, y + 4); c.stroke();
            c.fillStyle = P.tierra; for (var m = 0; m < paso; m++) { var mx = E.sx(L0 - (m + 1) / PASOS * AVANCE, 1) + (m % 2 ? 10 : -10); c.beginPath(); c.ellipse(mx, y + 1, 9, 2.5, 0, 0, TAU); c.fill(); }
          }
          pintar(c, P, { cuerdas: function (x, yy, h, g) {
            var llegan = U.sale(U.tramo(t, 200, 2000)), cab = [x + Math.sin(g) * h * 0.85, yy - Math.cos(g) * h * 0.85], fz = t / 160;
            // dos equipos tiran a cada lado (por turnos, al ritmo del balanceo) y otro sujeta desde atrás
            [[-1, 6], [1, 6]].forEach(function (q) {
              var tira = Math.max(0, Math.sin(fase * Math.PI) * q[0]) * on, ex = x + q[0] * h * (0.8 + 0.4 * (1 - llegan)) - h * 0.2, ey = yy + h * 0.1;
              c.strokeStyle = P.tierra; c.lineWidth = Math.max(1.4, h * 0.013); c.beginPath(); c.moveTo(cab[0], cab[1]);
              if (llegan < 1) c.quadraticCurveTo((cab[0] + ex) / 2, ey, ex, ey - h * 0.12); else c.lineTo(ex, ey - h * 0.12); c.stroke();
              for (var i = 0; i < q[1]; i++) S.figura(c, ex + q[0] * i * h * 0.085 - h * 0.03 * i, ey + (i % 2) * 4, h * 0.3, P.moaiSombra, { fase: fz + i, inclina: -q[0] * (0.08 + tira * 0.2), brazos: 0.4, izquierda: q[0] > 0 });
            });
            c.strokeStyle = P.tierra; c.beginPath(); c.moveTo(cab[0], cab[1] + h * 0.1); c.lineTo(x + h * 0.55, yy + h * 0.2); c.stroke();
            for (var j = 0; j < 6; j++) S.figura(c, x + h * 0.6 + j * h * 0.075, yy + h * 0.22 + (j % 2) * 4, h * 0.3, P.moaiSombra, { fase: fz * 0.5 + j, inclina: 0.15, izquierda: true });
          } });
          // el polvo de cada apoyo
          for (var n = 1; n <= PASOS; n++) {
            var edad = (fase - n) / 0.7; if (edad < 0 || edad > 1 || on <= 0) continue;
            var px = E.sx(L0 - n / PASOS * AVANCE, 1) + (n % 2 ? 1 : -1) * ALTO * u * 0.13;
            c.fillStyle = P.arena;
            for (var q2 = 0; q2 < 6; q2++) { c.globalAlpha = 0.55 * (1 - edad); c.beginPath(); c.arc(px + (q2 - 2.5) * 7 * (0.4 + edad), yb * H - edad * 14 - (q2 % 2) * 4, 4 + edad * 9, 0, TAU); c.fill(); }
          }
          c.globalAlpha = 1;
        },
        frente: function (c, t) {
          var a = U.meseta(t, 2600, 3200, D - 1500, D - 400), fase = U.tramo(t, T0, T1) * PASOS;
          if (a > 0) S.rotulo(c, '≈ 5 T · 18 PERSONAS · 3 CUERDAS · PASO ' + Math.min(PASOS, Math.floor(fase)), E.W / 2, E.H * 0.14, a, S.CORAL);
        }
      };
    }
  });
})();
