/* Pascua Incognita · interfaz
   El registro de secretos, el progreso (en este navegador), el cuaderno de bitácora, la tarjeta de cada escena, los
   avisos, los instrumentos (RUMBO: hacia dónde miras y dónde estás; HORA: la hora del sol; MANA: late cerca de un secreto
   de lugar), la entrada y los créditos. Para volver o cerrar: la tecla ⌫ (nunca Esc, que saca de la pantalla completa). */
(function () {
  'use strict';
  var RN = window.RN, U = RN.util, E = RN.motor, PA = RN.paisaje;
  var CLAVE = 'pascua-incognita.v1';   // no se cambia nunca: borraría el progreso de quien ya juega
  var PRUEBA = /[?&]prueba\b/.test(location.search);
  var I = RN.interfaz = { prueba: PRUEBA };
  var huevos = [], final = null;
  var estado = { hallados: {}, final: false, introVista: false };
  var $ = function (id) { return document.getElementById(id); };
  var raiz = document.documentElement;
  var AUTOR = { nombre: 'Pau Morató Sebastià', linkedin: 'https://www.linkedin.com/in/pau-morat%C3%B3-sebasti%C3%A0-5554a01b2' };

  /* ---------- registro ----------
     Cada secreto: { id, n, nombre, tipo, pista, lugar?: () => λ de la costa, radio?, detectar(api), escena(motor, datos) } */
  RN.registrar = function (h) { huevos.push(h); huevos.sort(function (a, b) { return a.n - b.n; }); };
  RN.registrarFinal = function (h) { final = h; };
  I.huevos = function () { return huevos; };
  I.estado = function () { return estado; };

  function cargar() { try { var s = localStorage.getItem(CLAVE); if (s) { var o = JSON.parse(s); for (var k in o) estado[k] = o[k]; } } catch (e) { /* sin almacenamiento */ } }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }
  function cuantos() { return huevos.filter(function (h) { return estado.hallados[h.id]; }).length; }

  /* ---------- disparar un secreto ---------- */
  I.disparar = function (h, datos, op) {
    op = op || {};
    if (!h.escena || E.escena || !$('intro').hidden || !$('creditos').hidden) return false;
    cerrarCuaderno();
    var nuevo = !estado.hallados[h.id] && !op.prueba;
    if (nuevo) { estado.hallados[h.id] = Date.now(); guardar(); }
    h.ultimosDatos = datos || h.ultimosDatos || null;
    var envoltorio = { id: h.id, escena: function (motor) {
      var s = h.escena(motor, datos || h.ultimosDatos || null);
      if (s && s.tarjeta && !s.tarjeta.etiqueta) s.tarjeta.etiqueta = 'Secreto ' + U.dos(h.n) + ' / ' + U.dos(huevos.length) + ' · ' + h.tipo;
      return s;
    } };
    E.reproducir(envoltorio, function () {
      pintarLista(nuevo ? h.id : null);
      if (nuevo) {
        aviso('Secreto encontrado <b>' + U.dos(cuantos()) + '/' + U.dos(huevos.length) + '</b> · ' + h.nombre);
        var b = $('b-cuaderno'); b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
        if (cuantos() === huevos.length && !estado.final && final) setTimeout(function () { I.verFinal(); }, 1600);
      }
    });
    return true;
  };
  I.verFinal = function () {
    if (!final || E.escena) return;
    cerrarCuaderno();
    var primero = Infinity, ultimo = 0;
    huevos.forEach(function (h) { var t = estado.hallados[h.id]; if (t) { primero = Math.min(primero, t); ultimo = Math.max(ultimo, t); } });
    raiz.classList.add('final-activo');
    E.reproducir({ id: 'final', escena: function (motor) { return final.escena(motor, { desde: primero, hasta: ultimo, huevos: huevos }); } }, function () {
      raiz.classList.remove('final-activo');
      if (cuantos() === huevos.length) { estado.final = true; guardar(); }
      pintarLista();
      mostrarCreditos();
    });
  };

  /* ---------- créditos ---------- */
  function mostrarCreditos() {
    var c = $('creditos');
    c.hidden = false; c.classList.remove('saliendo'); void c.offsetWidth; c.classList.add('visible');
    E.bloqueado = true;
    setTimeout(function () { var b = $('creditos-enlace'); try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }, 2600);
  }
  function cerrarCreditos() {
    var c = $('creditos'); if (c.hidden) return;
    c.classList.remove('visible'); c.classList.add('saliendo');
    E.bloqueado = false; E.ultimoInput = E.t;
    setTimeout(function () { c.hidden = true; c.classList.remove('saliendo'); }, 650);
  }
  I.mostrarCreditos = mostrarCreditos;

  /* ---------- tarjeta ---------- */
  I.tarjeta = function (t) {
    var el = $('tarjeta');
    if (!t) { el.classList.remove('visible'); return; }
    var v = function (x) { return typeof x === 'function' ? x() : (x || ''); };
    $('t-etq').textContent = v(t.etiqueta);
    $('t-tit').textContent = v(t.titulo);
    $('t-txt').innerHTML = v(t.texto);
    $('t-pie').textContent = v(t.pie);
    void el.offsetWidth; el.classList.add('visible');
  };

  /* ---------- aviso ---------- */
  var tAviso = null;
  function aviso(html, ms) {
    var el = $('aviso'); el.innerHTML = html; el.classList.add('visible');
    clearTimeout(tAviso); tAviso = setTimeout(function () { el.classList.remove('visible'); }, ms || 4200);
  }
  I.aviso = aviso;

  /* ---------- cuaderno ---------- */
  function abrirCuaderno() {
    $('cuaderno').classList.add('abierto'); $('cuaderno').setAttribute('aria-hidden', 'false');
    $('b-cuaderno').setAttribute('aria-expanded', 'true'); raiz.classList.add('cuaderno-abierto');
  }
  function cerrarCuaderno() {
    $('cuaderno').classList.remove('abierto'); $('cuaderno').setAttribute('aria-hidden', 'true');
    $('b-cuaderno').setAttribute('aria-expanded', 'false'); raiz.classList.remove('cuaderno-abierto');
  }
  I.abrirCuaderno = abrirCuaderno; I.cerrarCuaderno = cerrarCuaderno;

  function fecha(ms) {
    var d = new Date(ms);
    return U.dos(d.getDate()) + '.' + U.dos(d.getMonth() + 1) + '.' + d.getFullYear() + ' · ' + U.dos(d.getHours()) + ':' + U.dos(d.getMinutes());
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function pintarLista(recien) {
    var ol = $('lista'); ol.innerHTML = '';
    huevos.forEach(function (h) {
      var ok = !!estado.hallados[h.id];
      var li = el('li', 'entrada' + (ok ? ' hallada' : '') + (recien === h.id ? ' nueva' : ''));
      li.appendChild(el('div', 'e-num', U.dos(h.n)));
      var c = el('div', 'e-cuerpo');
      c.appendChild(el('div', 'e-tipo', h.tipo));
      var nom = el('div', 'e-nombre');
      if (ok) nom.textContent = h.nombre;
      else { var cen = el('span', 'e-censura'); cen.style.width = (h.nombre.length * 0.48 + 0.6) + 'em'; nom.appendChild(cen); nom.setAttribute('aria-label', 'Por descubrir'); }
      c.appendChild(nom);
      c.appendChild(el('p', 'e-pista', h.pista));
      if ((ok || PRUEBA) && h.escena) {
        var meta = el('div', 'e-meta');
        if (ok) meta.appendChild(el('span', '', 'Hallado · ' + fecha(estado.hallados[h.id])));
        var b = el('button', 'e-ver', ok ? 'Volver a ver' : '▶ Probar');
        b.type = 'button';
        b.addEventListener('click', function () { I.disparar(h, null, { prueba: !ok }); });
        meta.appendChild(b); c.appendChild(meta);
      }
      li.appendChild(c); ol.appendChild(li);
    });
    var n = cuantos(), total = huevos.length;
    $('contador').textContent = U.dos(n) + '/' + U.dos(total);
    var seg = $('segmentos'); seg.innerHTML = ''; seg.style.gridTemplateColumns = 'repeat(' + Math.max(1, total) + ', 1fr)';
    for (var i = 0; i < total; i++) seg.appendChild(el('i', i < n ? 'si' : ''));
    $('ver-final').hidden = !(estado.final || (PRUEBA && final));
    $('c-credito-linea').hidden = !estado.final;
    raiz.classList.toggle('cognita', !!estado.final);
  }

  /* ---------- instrumentos ---------- */
  var cuadroHud = 0, ultimos = {}, lugarActual = '';
  var PUNTOS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  function barras(id, valor) {
    var b = Math.ceil(valor * 5 - 0.15); if (ultimos[id] === b) return; ultimos[id] = b;
    var is = $(id).children; for (var i = 0; i < is.length; i++) is[i].classList.toggle('si', i < b);
  }
  function instrumentos() {
    // MANA: sube cuando te acercas a un secreto de lugar que aún no has encontrado
    // (con ratón cuenta el puntero; en pantalla táctil, el centro de la vista)
    var objetivo = 0, p = E.puntero, ref = p.sobre && p.tipo === 'mouse' ? p.x : E.W / 2;
    huevos.forEach(function (h) {
      if (!h.lugar || estado.hallados[h.id]) return;
      var l = h.lugar(); if (l == null) return;
      objetivo = Math.max(objetivo, U.clamp(1 - Math.abs(E.sx(l, 1) - ref) / (h.radio || 0.35) / E.u, 0, 1));
    });
    E.senal += (objetivo - E.senal) * 0.12;
    if (++cuadroHud % 5) return;
    barras('h-mana', E.senal);
    $('h-mana').classList.toggle('latiendo', E.senal > 0.12);
    $('h-mana').style.animationDuration = (1.3 - E.senal * 0.75).toFixed(2) + 's';
    // HORA: la del sol en la isla
    var h = PA.hora, hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    $('h-hora').textContent = U.dos(hh) + ':' + U.dos(Math.floor(mm / 5) * 5) + ' · ' + PA.franja();
    // RUMBO: hacia dónde miras (al mar) y el lugar de la costa
    if (cuadroHud % 15 === 0) {
      var l = E.centro(), g = RN.rumbo != null ? RN.rumbo : Math.round(PA.rumbo(l)), lugar = PA.nombreLugar(l);
      $('h-rumbo-grados').textContent = PUNTOS[Math.round(g / 45) % 8] + ' ' + ('00' + g).slice(-3) + '°';
      document.querySelector('.rosa-aguja').style.transform = 'rotate(' + (-g) + 'deg)';
      if (lugar !== lugarActual) { lugarActual = lugar; var hl = $('h-lugar'); hl.classList.remove('cambia'); void hl.offsetWidth; hl.textContent = lugar; hl.classList.add('cambia'); }
    }
  }

  /* ---------- teclas pulsadas (para los secretos de teclado) ---------- */
  var SIMBOLOS = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: '⌫' };
  function tecla(d) {
    if (E.escena && d.key !== 'Backspace') return;
    var s = SIMBOLOS[d.key] || (d.key.length === 1 && /\S/.test(d.key) ? d.key.toUpperCase() : null);
    if (!s || /^[+\-=_]$/.test(d.key)) return;
    var cont = $('teclas'), k = el('kbd', '', s);
    cont.appendChild(k);
    while (cont.children.length > 10) cont.removeChild(cont.firstChild);
    setTimeout(function () { if (k.parentNode) k.parentNode.removeChild(k); }, 2300);
  }

  /* ---------- la medalla de la entrada: la cabeza de Ko Te Riku, con sus ojos, delante del sol ---------- */
  function medalla() {
    var cv = $('intro-medalla'); if (!cv) return;
    var d = Math.min(2, window.devicePixelRatio || 1), s = 168; cv.width = cv.height = s * d;
    var c = cv.getContext('2d'), P = RN.arte.PALETAS.ocaso, A = RN.arte; c.scale(d, d);
    c.save(); c.beginPath(); c.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2); c.clip();
    var g = c.createLinearGradient(0, 0, 0, s); g.addColorStop(0, '#1c2148'); g.addColorStop(0.55, '#5a3462'); g.addColorStop(0.85, '#c95c5b'); g.addColorStop(1, '#f2a07a'); c.fillStyle = g; c.fillRect(0, 0, s, s);
    c.fillStyle = 'rgba(20,16,40,.3)'; for (var y = 3; y < s * 0.8; y += 6) for (var x = (y / 6 % 2) * 3; x < s; x += 6) { c.beginPath(); c.arc(x, y, 1.6 * (1 - y / s), 0, 7); c.fill(); }
    c.fillStyle = '#ff7f6e'; c.beginPath(); c.arc(s * 0.5, s * 0.78, s * 0.24, 0, 7); c.fill();
    c.fillStyle = P.mar[0]; c.fillRect(0, s * 0.78, s, s);
    var m = A.moaiGeo(s / 2, s * 1.42, s * 1.12, 0, 0.3); A.moai(c, P, m, { pukao: true, ojos: true, borde: 2.4, semilla: 7 });
    c.restore();
    c.strokeStyle = 'rgba(242,227,198,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(s / 2, s / 2, s / 2 - 1.5, 0, Math.PI * 2); c.stroke();
    cv.classList.add('listo');
  }

  /* ---------- arranque ---------- */
  I.iniciar = function () {
    cargar();
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    $('ayuda').textContent = tactil ? 'Desliza para recorrer la costa' : 'Arrastra o usa la rueda para recorrer la costa';

    huevos.forEach(function (h) {
      h.detectar && h.detectar({
        motor: E,
        en: function (n, fn) { E.en(n, fn); },
        capa: function (fn) { E.capas.push(fn); },
        hallado: function () { return !!estado.hallados[h.id]; },
        disparar: function (datos) { return I.disparar(h, datos); }
      });
    });
    E.en('cuadro', instrumentos);
    E.en('tecla', tecla);
    // ⌫ para volver: salta la escena, cierra el cuaderno o los créditos
    E.en('tecla', function (d) {
      if (d.key !== 'Backspace') return;
      if (E.escena) E.saltar();
      else if ($('cuaderno').classList.contains('abierto')) cerrarCuaderno();
      else if (!$('creditos').hidden) cerrarCreditos();
    });

    $('b-cuaderno').addEventListener('click', function () { $('cuaderno').classList.contains('abierto') ? cerrarCuaderno() : abrirCuaderno(); });
    $('cerrar-cuaderno').addEventListener('click', cerrarCuaderno);
    $('saltar').addEventListener('click', function () { E.saltar(); });
    $('ver-final').addEventListener('click', function () { I.verFinal(); });
    $('borrar').addEventListener('click', function () {
      if (!window.confirm('¿Borrar los secretos encontrados en este navegador?')) return;
      estado = { hallados: {}, final: false, introVista: true }; guardar(); pintarLista();
    });

    $('creditos-nombre').textContent = AUTOR.nombre;
    $('c-credito-nombre').textContent = AUTOR.nombre;
    $('creditos-enlace').href = AUTOR.linkedin; $('c-credito').href = AUTOR.linkedin;
    $('creditos-cerrar').addEventListener('click', cerrarCreditos);

    pintarLista();
    I.introPendiente = !estado.introVista && !PRUEBA;
  };
  // la entrada (solo la primera vez): al pulsar «Desembarcar» se imprime la isla
  I.mostrarIntro = function (alEmpezar) {
    var intro = $('intro');
    intro.hidden = false; E.bloqueado = true;
    medalla();
    $('empezar').addEventListener('click', function () {
      estado.introVista = true; guardar();
      intro.classList.add('saliendo'); E.bloqueado = false; E.ultimoInput = E.t;
      setTimeout(function () { intro.hidden = true; }, 900);
      alEmpezar && alEmpezar();
    });
    setTimeout(function () { try { $('empezar').focus({ preventScroll: true }); } catch (e) { /* nada */ } }, 50);
  };
})();
