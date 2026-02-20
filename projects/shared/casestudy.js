/* ================================================================
   SHARED CASE STUDY SCRIPTS
   ================================================================ */

(function () {
  /* ---------- NAV SCROLL BEHAVIOUR ---------- */
  var nav = document.getElementById('mainNav');
  if (nav) {
    function onScroll() {
      if (window.scrollY > 40) {
        nav.classList.remove('at-top');
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
        nav.classList.add('at-top');
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- SCROLL-TRIGGERED REVEAL ---------- */
  var reveals = document.querySelectorAll('.cs-reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- STAT COUNTER ANIMATION ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var counted = new Set();
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1200;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(eased * target);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }
})();
