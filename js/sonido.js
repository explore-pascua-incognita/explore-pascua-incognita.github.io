/* Pascua Incognita · sonido
   Todo sintetizado con Web Audio, sin archivos (como en Iaponia):
   - el mar (el fondo y las olas que rompen cada pocos segundos), el viento en la hierba, las aves marinas de día
     (manutara) y los grillos de noche, según la hora de la isla;
   - de vez en cuando, unas notas punteadas (cuerda tipo ukelele) en pentatónica mayor;
   - al descubrir un secreto, la caracola (pū) y el tambor; cada escena con lo suyo (la ola de 1960, el ancla, la grúa…).
   Empieza apagado: el botón ♪ lo enciende y se recuerda. Los navegadores solo dejan sonar después de un gesto.
   Las escenas suenan por su propio canal: si se salta la escena, su sonido se apaga con ella. */
(function () {
  'use strict';
  var RN = window.RN, E = RN.motor, U = RN.util, CLAVE = 'pascua-incognita.sonido';
  var S = RN.sonido = { activo: false };
  var ac = null, master, salaEnv, ruido, musica, AMB = null, bus = null, escBus = null, ksCache = {};
  // pentatónica mayor sobre do: do, re, mi, sol, la (dos octavas)
  var ESCALA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

  function crear() {
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    ac = new Ctx();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    var conv = ac.createConvolver(); conv.buffer = impulso(2.8, 2.4);
    salaEnv = ac.createGain(); salaEnv.gain.value = 0.5; salaEnv.connect(conv); var rv = ac.createGain(); rv.gain.value = 0.38; conv.connect(rv); rv.connect(master);
    musica = ac.createGain(); musica.gain.value = 1; musica.connect(master);
    AMB = { seco: master, sala: salaEnv }; bus = AMB;
    ruido = bufferRuido(4);
    // el fondo del mar: ruido grave, siempre
    S.mar = bucle(ruido, 'lowpass', 380, 0.7, 0);
    // el viento en la hierba: un pasa-banda que se mueve
    S.viento = bucle(ruido, 'bandpass', 700, 0.5, 0.9);
    // los grillos de noche: un tono agudo que se corta a golpes (la envolvente la mueve actualizar)
    var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 4400;
    var trino = ac.createGain(); trino.gain.value = 0.5; var lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 28; var lg = ac.createGain(); lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(trino.gain); var gr = ac.createGain(); gr.gain.value = 0; o.connect(trino); trino.connect(gr); gr.connect(master); o.start(); lfo.start();
    S.grillos = { g: gr, trino: trino };
    return true;
  }
  function bucle(buf, tipo, frec, q, desde) {
    var s = ac.createBufferSource(); s.buffer = buf; s.loop = true;
    var f = ac.createBiquadFilter(); f.type = tipo; f.frequency.value = frec; f.Q.value = q;
    var g = ac.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(0, desde || 0);
    return { f: f, g: g };
  }
  function bufferRuido(seg) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < n; i++) { var w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    return b;
  }
  function impulso(seg, caida) {
    var n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(2, n, ac.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, caida); }
    return b;
  }
  // por dónde sale un sonido: seco y a la sala, por el canal de ahora (el ambiente o el de la escena)
  function salida(nodo, sala) {
    nodo.connect(bus.seco);
    if (sala) { var g = ac.createGain(); g.gain.value = sala; nodo.connect(g); g.connect(bus.sala); }
  }
  function env(g, t, ataque, vol, dur) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + ataque); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  // un tono con envolvente; f2 lo hace deslizar
  function tono(tipo, f, t, dur, vol, op) {
    op = op || {};
    var o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t);
    if (op.f2) o.frequency.exponentialRampToValueAtTime(op.f2, t + (op.glide || dur));
    env(g, t, op.ataque || 0.01, vol, dur);
    var ult = g;
    if (op.filtro) { var fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = op.filtro; fl.Q.value = op.q || 0.7; o.connect(fl); fl.connect(g); } else o.connect(g);
    salida(ult, op.sala == null ? 0.4 : op.sala); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  // un golpe de ruido filtrado (f2: el filtro barre)
  function golpe(t, dur, frec, vol, tipo, op) {
    op = op || {};
    var s = ac.createBufferSource(); s.buffer = ruido; var f = ac.createBiquadFilter(); f.type = tipo || 'lowpass'; f.frequency.setValueAtTime(frec, t); f.Q.value = op.q || (tipo === 'bandpass' ? 2 : 0.7);
    if (op.f2) f.frequency.exponentialRampToValueAtTime(op.f2, t + (op.barre || dur));
    var g = ac.createGain(); env(g, t, op.ataque || Math.min(0.02, dur * 0.2), vol, dur);
    s.loop = true; s.connect(f); f.connect(g); salida(g, op.sala == null ? 0.3 : op.sala); s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
  }
  // una cuerda punteada (Karplus-Strong), brillante y corta, como un ukelele
  function cuerda(f, seg) {
    var clave = Math.round(f * 10); if (ksCache[clave]) return ksCache[clave];
    var sr = ac.sampleRate, n = Math.floor(sr * seg), b = ac.createBuffer(1, n, sr), d = b.getChannelData(0), N = Math.max(2, Math.round(sr / f)), anillo = new Float32Array(N), k = 0;
    for (var i = 0; i < N; i++) anillo[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(Math.PI * i / N));
    for (var j = 0; j < n; j++) { var a = anillo[k], s = anillo[(k + 1) % N]; anillo[k] = (a * 0.5 + s * 0.5) * 0.994; d[j] = a * Math.min(1, j / 30); k = (k + 1) % N; }
    return (ksCache[clave] = b);
  }
  function punteo(f, t, vol, aMusica) { var s = ac.createBufferSource(); s.buffer = cuerda(f, 2.2); var g = ac.createGain(); g.gain.value = vol; s.connect(g); if (aMusica) { g.connect(musica); var g2 = ac.createGain(); g2.gain.value = 0.6; g.connect(g2); g2.connect(salaEnv); } else salida(g, 0.6); s.start(t); }
  function arpegio(t, notas, paso, vol) { notas.forEach(function (i, k) { punteo(ESCALA[i % ESCALA.length] * (i >= ESCALA.length ? 2 : 1), t + k * paso, vol); }); }

  /* --- las piezas propias de la isla --- */
  // la caracola (pū): un soplo grave con formante, que entra y se apaga
  function caracola(t, vol, f) {
    f = f || 196;
    var o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.25); o2.frequency.setValueAtTime(f * 2.01, t);
    fl.type = 'bandpass'; fl.frequency.value = 720; fl.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.3); g.gain.setValueAtTime(vol, t + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    o.connect(fl); o2.connect(fl); fl.connect(g); salida(g, 0.7); o.start(t); o2.start(t); o.stop(t + 2); o2.stop(t + 2);
    golpe(t, 1.8, 1400, vol * 0.25, 'bandpass', { q: 1 });   // el aire
  }
  // el tambor (pahu): un golpe grave que baja de tono, con la piel al principio
  function tambor(t, vol) { tono('sine', 110, t, 0.9, vol, { f2: 46, glide: 0.3, ataque: 0.008, sala: 0.35 }); golpe(t, 0.08, 500, vol * 0.4); }
  // una ola que rompe: crece, rompe y se arrastra por la arena
  function ola(t, vol) { golpe(t, 4.2, 300, vol, 'lowpass', { ataque: 1.4, f2: 1500, barre: 1.6, sala: 0.25 }); golpe(t + 1.5, 2.6, 2600, vol * 0.35, 'highpass', { ataque: 0.1 }); }
  function chapuzon(t, vol) { golpe(t, 0.6, 900, vol, 'bandpass', { f2: 300, q: 0.8 }); golpe(t + 0.05, 0.3, 4000, vol * 0.4, 'highpass'); }
  // un ave marina: dos o tres gritos nasales que caen de tono (el manutara, el charrán)
  function ave(t, vol) {
    var n = 2 + Math.floor(Math.random() * 2), base = 1500 + Math.random() * 700;
    for (var i = 0; i < n; i++) {
      var t0 = t + i * (0.16 + Math.random() * 0.06), o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(base * 1.15, t0); o.frequency.exponentialRampToValueAtTime(base * 0.8, t0 + 0.12);
      fl.type = 'bandpass'; fl.frequency.value = base * 1.6; fl.Q.value = 4; env(g, t0, 0.015, vol, 0.14);
      o.connect(fl); fl.connect(g); salida(g, 0.5); o.start(t0); o.stop(t0 + 0.16);
    }
  }
  function madera(t, vol, f) { tono('triangle', f || 420, t, 0.12, vol, { f2: (f || 420) * 0.7, glide: 0.1, sala: 0.3 }); golpe(t, 0.05, 1800, vol * 0.5, 'bandpass'); }
  function campanita(t, vol, f) { [1, 2.76, 5.4].forEach(function (k, i) { tono('sine', f * k, t, 1.6 / (i + 1), vol / (i + 1), { ataque: 0.004, sala: 0.7 }); }); }
  function fuego(t, dur) { for (var i = 0; i < dur * 14; i++) golpe(t + Math.random() * dur, 0.03 + Math.random() * 0.04, 2500 + Math.random() * 3000, 0.08 + Math.random() * 0.12, 'bandpass', { sala: 0.1 }); golpe(t, dur, 500, 0.08, 'lowpass', { ataque: 0.6 }); }
  function acorde(t, notas, dur, vol) { notas.forEach(function (f) { tono('triangle', f, t, dur, vol, { ataque: dur * 0.35, filtro: 1400, sala: 0.8 }); }); }

  /* --- lo que suena solo, según la hora --- */
  var proxOla = 2, proxAve = 5, proxNota = 6;
  function actualizar() {
    if (!ac || !S.activo) return;
    var t = ac.currentTime, PA = RN.paisaje, noche = PA ? PA.peso('noche') : 0, dia = 1 - noche, esc = !!E.escena;
    S.mar.g.gain.setTargetAtTime(0.09, t, 0.8);
    S.viento.g.gain.setTargetAtTime(0.03 + 0.03 * Math.sin(t * 0.21) * Math.sin(t * 0.07), t, 0.8);
    S.viento.f.frequency.setTargetAtTime(600 + 400 * Math.sin(t * 0.13), t, 1);
    // los grillos, de noche y a ráfagas
    S.grillos.g.gain.setTargetAtTime(Math.sin(t * 2.3) > 0.2 ? noche * 0.012 : 0, t, 0.03);
    if (t > proxOla) { ola(t, 0.1 + Math.random() * 0.06); proxOla = t + 6 + Math.random() * 5; }
    if (t > proxAve && !esc) { if (dia > 0.5) ave(t, 0.035 + Math.random() * 0.02); proxAve = t + 7 + Math.random() * 10; }
    musica.gain.setTargetAtTime(esc ? 0.15 : 1, t, 0.5);
    if (t > proxNota) {
      var i = Math.floor(Math.random() * 6); punteo(ESCALA[i], t, 0.12, true);
      if (Math.random() < 0.5) punteo(ESCALA[i + 2], t + 0.22, 0.09, true);
      if (Math.random() < 0.3) punteo(ESCALA[i + 4] || ESCALA[i], t + 0.44, 0.08, true);
      proxNota = t + 6 + Math.random() * 8;
    }
  }
  setInterval(actualizar, 120);

  /* --- cada escena con lo suyo (tiempos en segundos desde que empieza; los de cada secreto, en su archivo) --- */
  var ESCENAS = {
    'tangata-manu': function (t) { for (var i = 0; i < 6; i++) ave(t + 0.3 + i * 0.35, 0.05); chapuzon(t + 3.0, 0.4); for (i = 0; i < 9; i++) golpe(t + 3.4 + i * 0.36, 0.25, 700, 0.07, 'bandpass'); arpegio(t + 6.9, [5, 7, 9], 0.12, 0.2); for (i = 0; i < 7; i++) golpe(t + 7.8 + i * 0.36, 0.25, 700, 0.07, 'bandpass'); tambor(t + 11.5, 0.6); tambor(t + 11.8, 0.5); tambor(t + 12.1, 0.7); },
    'moai-camina': function (t) { for (var i = 0; i < 8; i++) { tambor(t + 2.2 + i * 1.05, 0.35); golpe(t + 2.25 + i * 1.05, 0.7, 380, 0.12, 'lowpass', { ataque: 0.05 }); madera(t + 1.8 + i * 1.05, 0.04, 180); } },
    mata: function (t) { tono('sine', 65.4, t + 0.6, 6, 0.08, { ataque: 1.2, sala: 0.6 }); for (var i = 0; i < 7; i++) campanita(t + 1.8 + i * 0.65, 0.06, ESCALA[i + 2] * 2); golpe(t + 5.2, 1.6, 200, 0.25, 'lowpass', { f2: 900, barre: 0.8 }); acorde(t + 5.3, [261.63, 329.63, 392, 523.25], 3, 0.04); },
    akivi: function (t) { [261.63, 392, 523.25].forEach(function (f) { tono('triangle', f * 0.75, t + 1.5, 7.5, 0.035, { f2: f, glide: 7, ataque: 3, filtro: 1100, sala: 0.8 }); }); for (var i = 0; i < 7; i++) punteo(ESCALA[i + 1], t + 8.5 + i * 0.16, 0.16); },
    pito: function (t) { tono('sine', 55, t + 0.4, 5.5, 0.12, { ataque: 2, sala: 0.3 }); tono('sine', 58.3, t + 0.4, 5.5, 0.1, { ataque: 2, sala: 0.3 }); for (var i = 0; i < 26; i++) golpe(t + 1 + Math.random() * 4, 0.03, 5000, 0.05, 'bandpass'); tono('sine', 900, t + 6.2, 2.2, 0.03, { f2: 1600, glide: 2, ataque: 0.3, sala: 0.6 }); },
    gigante: function (t) { for (var i = 0; i < 12; i++) { golpe(t + 0.5 + i * 0.32, 0.07, 3200, 0.16, 'bandpass'); madera(t + 0.5 + i * 0.32, 0.05, 900); } for (i = 0; i < 4; i++) tambor(t + 5.4 + i * 0.5, 0.35 + i * 0.12); },
    rongorongo: function (t) { madera(t + 0.3, 0.12, 300); for (var k = 0; k < 34; k++) golpe(t + 1.3 + k * 0.26 + Math.random() * 0.08, 0.12, 2800 + Math.random() * 1500, 0.06, 'bandpass', { q: 3 }); for (k = 0; k < 3; k++) madera(t + 3.6 + k * 2.6, 0.1, 260); for (k = 0; k < 8; k++) ave(t + 10.5 + k * 0.25, 0.04); golpe(t + 10.5, 1.5, 600, 0.08, 'bandpass', { f2: 2000 }); },
    roggeveen: function (t) { golpe(t + 0.6, 5, 500, 0.06, 'lowpass', { ataque: 2 }); campanita(t + 1.4, 0.07, 880); campanita(t + 1.9, 0.07, 880); for (var i = 0; i < 4; i++) madera(t + 2.5 + i * 0.9, 0.05, 140); chapuzon(t + 6.8, 0.5); for (i = 0; i < 10; i++) golpe(t + 6.9 + i * 0.05, 0.04, 3500, 0.05, 'bandpass'); for (i = 0; i < 6; i++) chapuzon(t + 7.8 + i * 0.8, 0.12); },
    tongariki: function (t) { golpe(t + 0.3, 1.5, 250, 0.08, 'lowpass', { ataque: 0.8 }); golpe(t + 1.3, 3.4, 120, 0.4, 'lowpass', { ataque: 3, f2: 700, barre: 3.2 }); golpe(t + 4.6, 3.2, 1800, 0.7, 'lowpass', { ataque: 0.05, f2: 300, barre: 3 }); tono('sine', 40, t + 4.6, 2.2, 0.4, { ataque: 0.02, sala: 0.2 }); golpe(t + 5.9, 1.6, 2400, 0.2, 'highpass', { ataque: 0.1 }); tono('sawtooth', 70, t + 8.6, 5.2, 0.025, { ataque: 0.4, filtro: 300 }); for (var i = 0; i < 15; i++) madera(t + 8.9 + i * 0.33, 0.06, 220); },
    'hotu-matua': function (t) { for (var i = 0; i < 4; i++) campanita(t + 0.2 + i * 0.22, 0.05, ESCALA[i + 5] * 2); golpe(t + 0.9, 1.2, 3000, 0.04, 'bandpass', { f2: 7000 }); acorde(t + 2.2, [261.63, 392, 440, 523.25], 3, 0.035); for (i = 0; i < 9; i++) chapuzon(t + 4.4 + i * 0.6, 0.08); for (i = 0; i < 4; i++) tambor(t + 10.2 + i * 0.4, 0.25); fuego(t + 10.8, 3.5); },
    final: function (t) { tambor(t + 0.2, 0.7); arpegio(t + 0.5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0.15, 0.18); caracola(t + 4.2, 0.12, 196); acorde(t + 4.4, [196, 261.63, 329.63, 392, 523.25], 5, 0.04); }
  };
  E.en('escena', function (d) {
    if (!ac || !S.activo) return;
    var t = ac.currentTime;
    if (d.fase === 'fin') { if (escBus) { escBus.seco.gain.setTargetAtTime(0, t, 0.25); escBus.sala.gain.setTargetAtTime(0, t, 0.25); escBus = null; } return; }
    if (d.fase !== 'inicio') return;
    // un canal para esta escena: si se salta, se apaga con ella
    escBus = { seco: ac.createGain(), sala: ac.createGain() }; escBus.seco.connect(master); escBus.sala.connect(salaEnv);
    bus = escBus;
    try { caracola(t + 0.05, 0.08); tambor(t + 0.1, 0.5); var f = ESCENAS[d.huevo && d.huevo.id]; if (f) f(t); else arpegio(t + 0.4, [0, 2, 4, 5], 0.2, 0.18); }
    finally { bus = AMB; }
  });

  /* --- encender y apagar --- */
  S.encender = function () {
    if (!ac && !crear()) return;
    if (ac.state === 'suspended') ac.resume();
    S.activo = true; master.gain.setTargetAtTime(0.9, ac.currentTime, 0.6);
    try { localStorage.setItem(CLAVE, '1'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.apagar = function () {
    S.activo = false; if (ac) master.gain.setTargetAtTime(0, ac.currentTime, 0.25);
    try { localStorage.setItem(CLAVE, '0'); } catch (e) { /* nada */ }
    pintarBoton();
  };
  S.alternar = function () { if (S.activo) S.apagar(); else S.encender(); };
  S.medidor = function () { if (!ac) return null; var an = ac.createAnalyser(); an.fftSize = 2048; master.connect(an); return function () { var d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); var q = 0; for (var i = 0; i < d.length; i++) q += d[i] * d[i]; return Math.sqrt(q / d.length); }; };   // (para las pruebas)
  function pintarBoton() { var b = document.getElementById('b-sonido'); if (b) { b.setAttribute('aria-pressed', S.activo ? 'true' : 'false'); b.classList.toggle('activo', S.activo); } }
  // el botón va a la izquierda del de la bitácora (en el móvil, debajo)
  function colocar() {
    var b = document.getElementById('b-sonido'), c = document.getElementById('b-cuaderno'); if (!b || !c) return;
    var r = c.getBoundingClientRect(), movil = innerWidth < 640;
    b.style.top = (movil ? r.bottom + 8 : r.top) + 'px'; b.style.height = (movil ? 44 : r.height) + 'px';
    b.style.right = (movil ? innerWidth - r.right : innerWidth - r.left + 8) + 'px';
  }
  // si la última vez estaba encendido, se enciende en el primer gesto (los navegadores no dejan antes)
  var quiere = false; try { quiere = localStorage.getItem(CLAVE) === '1'; } catch (e) { /* nada */ }
  function primerGesto() { if (quiere && !S.activo) S.encender(); window.removeEventListener('pointerdown', primerGesto, true); window.removeEventListener('keydown', primerGesto, true); }
  window.addEventListener('pointerdown', primerGesto, true); window.addEventListener('keydown', primerGesto, true);
  var b = document.getElementById('b-sonido');
  if (b) b.addEventListener('click', function (ev) { ev.stopPropagation(); quiere = false; S.alternar(); });
  window.addEventListener('resize', colocar); colocar(); setTimeout(colocar, 600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(colocar);
  pintarBoton();
})();
