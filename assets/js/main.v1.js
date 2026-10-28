/* Avícola Garcés · mejoras progresivas. Sin este archivo la página funciona completa. */
(function () {
  'use strict';

  var WA_NUMBER = '593963293045';
  var GREETING = 'Hola, Avícola Garcés. Les escribo desde su página web';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function waUrl(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* ---------- Encabezado: borde al desplazarse ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');
  if (menuBtn && nav) {
    menuBtn.hidden = false;
    var mq = window.matchMedia('(max-width: 859px)');
    var links = nav.querySelectorAll('a');

    var setOpen = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Menú';
      nav.classList.toggle('is-open', open);
      // Fuera del orden de tabulación cuando está cerrado (solo en móvil)
      links.forEach(function (a) {
        if (mq.matches && !open) a.setAttribute('tabindex', '-1'); else a.removeAttribute('tabindex');
      });
      if (mq.matches) nav.setAttribute('aria-hidden', String(!open)); else nav.removeAttribute('aria-hidden');
    };
    setOpen(false);
    mq.addEventListener ? mq.addEventListener('change', function () { setOpen(false); }) : mq.addListener(function () { setOpen(false); });

    menuBtn.addEventListener('click', function () {
      setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    links.forEach(function (a) { a.addEventListener('click', function () { if (mq.matches) setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); menuBtn.focus(); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
    });
  }

  /* ---------- Sección activa en el menú ---------- */
  if ('IntersectionObserver' in window) {
    var navLinks = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = navLinks[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navLinks).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Aparición gradual ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // Escalonado leve entre hermanos visibles a la vez
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        en.target.style.setProperty('--d', Math.min(i * 50, 250) + 'ms');
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    // Seguridad: nada queda oculto si el observador no dispara
    window.addEventListener('load', function () {
      setTimeout(function () {
        reveals.forEach(function (el) {
          if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
        });
      }, 1200);
    });
  }

  /* ---------- Botón flotante: oculto mientras se ve un CTA principal ---------- */
  var fab = document.querySelector('[data-fab]');
  var zones = document.querySelectorAll('[data-cta-zone]');
  if (fab) {
    var visible = new Set();
    var setFab = function (hidden) {
      fab.classList.toggle('is-hidden', hidden);
      if (hidden) { fab.setAttribute('aria-hidden', 'true'); fab.setAttribute('tabindex', '-1'); }
      else { fab.removeAttribute('aria-hidden'); fab.removeAttribute('tabindex'); }
    };
    setFab(true);
    if ('IntersectionObserver' in window && zones.length) {
      var fabIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
        setFab(visible.size > 0);
      }, { threshold: 0 });
      zones.forEach(function (z) { fabIo.observe(z); });
    } else {
      setFab(false);
    }
  }

  /* ---------- Armar mensaje de WhatsApp ---------- */
  var form = document.getElementById('armar');
  if (form) {
    var checks = form.querySelectorAll('input[name="p"]');
    var qty = form.querySelector('#qty');
    var detail = form.querySelector('#detail');
    var hiddenText = form.querySelector('input[name="text"]');
    var preview = form.querySelector('.preview');
    var bubble = form.querySelector('[data-preview]');
    var addBtns = document.querySelectorAll('.product .add-btn');

    var compose = function () {
      var items = Array.prototype.filter.call(checks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var lines = [];
      if (items.length) {
        lines.push(GREETING + '. Quiero consultar disponibilidad y precio de:');
        items.forEach(function (it) { lines.push('• ' + it); });
      } else {
        lines.push(GREETING + ' y quiero hacer una consulta.');
      }
      var q = qty.value.trim();
      var d = detail.value.trim();
      if (q) lines.push('Cantidad aproximada: ' + q);
      if (d) lines.push('Detalle: ' + d);
      return lines.join('\n');
    };

    var sync = function () {
      var text = compose();
      bubble.textContent = text;
      hiddenText.value = text;
      // Sincroniza los botones "Añadir" del catálogo
      addBtns.forEach(function (b) {
        var name = b.closest('.product').getAttribute('data-product');
        var on = Array.prototype.some.call(checks, function (c) { return c.checked && c.value === name; });
        b.setAttribute('aria-pressed', String(on));
        b.querySelector('.add-label').textContent = on ? 'En tu mensaje' : 'Añadir al mensaje';
        b.closest('.product').classList.toggle('is-added', on);
      });
    };

    preview.hidden = false;
    // Solo el parámetro "text" viaja a WhatsApp
    checks.forEach(function (c) { c.removeAttribute('name'); c.setAttribute('data-name', 'p'); c.addEventListener('change', sync); });
    qty.removeAttribute('name'); detail.removeAttribute('name');
    qty.addEventListener('input', sync); detail.addEventListener('input', sync);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sync();
      // Sin 'noopener' en features: con él, window.open siempre devuelve null
      var w = window.open(waUrl(hiddenText.value), '_blank');
      if (w) w.opener = null; else window.location.href = waUrl(hiddenText.value);
    });

    addBtns.forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        var name = b.closest('.product').getAttribute('data-product');
        checks.forEach(function (c) { if (c.value === name) c.checked = !c.checked; });
        sync();
      });
    });

    sync();
  }

  /* ---------- Video de portada (solo si el contexto lo permite) ---------- */
  var media = document.querySelector('.hero-media');
  if (media) {
    var small = window.matchMedia('(max-width: 639px)').matches;
    var src = (small && media.getAttribute('data-video-mp4-small')) || media.getAttribute('data-video-mp4');
    var conn = navigator.connection || {};
    var lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
    var canPlay = src && !reduceMotion.matches && !conn.saveData && !lowEnd;

    if (canPlay) {
      var start = function () {
        var v = document.createElement('video');
        // Bucle infinito: el archivo ya trae la unión fundida, la repetición no salta
        v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
        v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.preload = 'auto';
        v.src = src;
        var toggle = media.querySelector('.media-toggle');
        var label = toggle.querySelector('.sr-only');
        var setPaused = function (paused) {
          toggle.setAttribute('aria-pressed', String(paused));
          label.textContent = paused ? 'Reproducir video' : 'Pausar video';
        };
        v.addEventListener('playing', function () {
          v.classList.add('is-ready'); media.classList.add('has-video'); setPaused(false);
        });
        v.addEventListener('ended', function () { setPaused(true); });
        v.addEventListener('error', function () { v.remove(); toggle.hidden = true; });
        media.querySelector('picture').after(v);
        var p = v.play(); if (p && p.catch) p.catch(function () { setPaused(true); });

        toggle.hidden = false;
        toggle.addEventListener('click', function () {
          if (toggle.getAttribute('aria-pressed') === 'true') {
            if (v.ended) v.currentTime = 0;
            var pp = v.play(); if (pp && pp.catch) pp.catch(function () {});
            setPaused(false);
          } else { v.pause(); setPaused(true); }
        });
        // Pausa fuera de pantalla y con la pestaña oculta
        var userPaused = function () { return toggle.getAttribute('aria-pressed') === 'true'; };
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (en) {
            if (userPaused() || v.ended) return;
            if (en[0].isIntersecting) { var pp = v.play(); if (pp && pp.catch) pp.catch(function () {}); } else v.pause();
          }).observe(media);
        }
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) v.pause();
          else if (!userPaused() && !v.ended) { var pp = v.play(); if (pp && pp.catch) pp.catch(function () {}); }
        });
      };
      // Tras el primer render: el LCP es la foto, no el video
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1200 }); else setTimeout(start, 500);
    }
  }

  /* ---------- Año del pie ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
