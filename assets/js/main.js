// CNElab site — minimal shared JS (mobile nav toggle only)
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    var isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  links.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Hero background video controls (native <video> element).
  var video = document.getElementById("hero-video");
  var playBtn = document.getElementById("video-toggle-play");
  var muteBtn = document.getElementById("video-toggle-mute");

  if (playBtn && video) {
    playBtn.addEventListener("click", function () {
      var isPaused = playBtn.classList.toggle("is-paused");
      if (isPaused) {
        video.pause();
      } else {
        video.play();
      }
      playBtn.setAttribute("aria-label", isPaused ? "Play background video" : "Pause background video");
    });
  }

  if (muteBtn && video) {
    muteBtn.addEventListener("click", function () {
      var isUnmuted = muteBtn.classList.toggle("is-unmuted");
      video.muted = !isUnmuted;
      muteBtn.setAttribute("aria-label", isUnmuted ? "Mute background video" : "Unmute background video");
    });
  }

  // When the page is restored from the browser's back/forward cache (e.g. user
  // navigates to another page and then hits Back), some browsers leave the
  // video paused instead of resuming. Nudge it to play again, unless the user
  // had deliberately paused it themselves before leaving.
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted || !video) return;
    if (!playBtn || !playBtn.classList.contains("is-paused")) {
      video.play();
    }
  });

  // Scroll-reveal: fade/slide .reveal elements into place as they enter
  // the viewport, then stop watching them (one-time reveal).
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        // threshold: 0 fires as soon as any part of the element enters the
        // viewport — a ratio-based threshold (e.g. 0.15) would never fire
        // for elements taller than the viewport, like long publication lists.
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  // Year rail: builds a clickable year index alongside a chronological list
  // (see publications.html and research.html), highlights the year
  // currently in view, and jumps to a year on click. A page can have more
  // than one — each <nav class="year-rail" data-year-source="ID"> pulls its
  // <li data-year> items from the element with that id. The source may
  // contain several <ul>s (e.g. Research's PI / Co-PI / Industry lists),
  // and the same year may reappear in more than one of them, so every
  // tagged item (not just the first per year) is watched for the spy.
  document.querySelectorAll(".year-rail[data-year-source]").forEach(function (yearRail) {
    var source = document.getElementById(yearRail.getAttribute("data-year-source"));
    if (!source) return;

    var yearItems = source.querySelectorAll("li[data-year]");
    if (!yearItems.length) return;

    var firstItemForYear = {};
    var countForYear = {};
    var years = [];

    yearItems.forEach(function (li) {
      var year = li.getAttribute("data-year");
      if (!(year in firstItemForYear)) {
        years.push(year);
        firstItemForYear[year] = li;
        countForYear[year] = 0;
      }
      countForYear[year] += 1;
    });

    // Sort newest-first: a page's lists (e.g. Research's PI / Co-PI /
    // Industry groups) don't always appear in one continuous chronological
    // order, so first-occurrence order alone can look scrambled.
    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });

    years.forEach(function (year) {
      var link = document.createElement("button");
      link.type = "button";
      link.className = "year-rail-link";
      link.textContent = year + " (" + countForYear[year] + ")";
      link.setAttribute("data-year", year);
      link.addEventListener("click", function () {
        firstItemForYear[year].scrollIntoView({ behavior: "smooth", block: "start" });
      });
      yearRail.appendChild(link);
    });

    if ("IntersectionObserver" in window) {
      var yearSpy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var year = entry.target.getAttribute("data-year");
            yearRail.querySelectorAll(".year-rail-link").forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("data-year") === year);
            });
          });
        },
        { threshold: 0, rootMargin: "-20% 0px -70% 0px" }
      );
      yearItems.forEach(function (li) {
        yearSpy.observe(li);
      });
    }
  });
});

// Mobile swipe navigation: on narrow viewports, a left/right swipe moves
// between the 6 main pages in nav order (wrapping around at the ends).
// Guarded on horizontal-dominant, fast-enough gestures so it doesn't
// hijack normal vertical scrolling.
document.addEventListener("DOMContentLoaded", function () {
  var pageOrder = ["index.html", "team.html", "research.html", "publications.html", "teaching.html", "join.html"];

  function isMobile() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function currentPageIndex() {
    var file = window.location.pathname.split("/").pop();
    if (!file) file = "index.html";
    var idx = pageOrder.indexOf(file);
    return idx === -1 ? 0 : idx;
  }

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartTime = 0;
  var navLinks = document.querySelector(".nav-links");

  document.addEventListener(
    "touchstart",
    function (e) {
      if (!isMobile() || e.touches.length !== 1) return;
      if (navLinks && navLinks.classList.contains("open")) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      if (!isMobile()) return;
      if (navLinks && navLinks.classList.contains("open")) return;
      if (!touchStartTime) return;

      var touch = e.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      var elapsed = Date.now() - touchStartTime;
      touchStartTime = 0;

      var minDistance = 70;
      if (elapsed > 800) return;
      if (Math.abs(dx) < minDistance) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.6) return;

      var idx = currentPageIndex();
      var nextIdx = dx < 0 ? (idx + 1) % pageOrder.length : (idx - 1 + pageOrder.length) % pageOrder.length;
      window.location.href = pageOrder[nextIdx];
    },
    { passive: true }
  );

  // First-visit hint: show "Swipe to browse pages" once per device (mobile
  // only), then remember it's been seen so it doesn't nag on every visit.
  var hint = document.getElementById("swipe-hint");
  if (hint && isMobile()) {
    var seenKey = "cnelab-swipe-hint-seen";
    var alreadySeen = true;
    try {
      alreadySeen = !!window.localStorage.getItem(seenKey);
    } catch (e) {
      alreadySeen = false;
    }
    if (!alreadySeen) {
      requestAnimationFrame(function () {
        hint.classList.add("visible");
      });
      var dismissHint = function () {
        hint.classList.remove("visible");
        try {
          window.localStorage.setItem(seenKey, "1");
        } catch (e) {
          /* private browsing or storage disabled — just skip remembering */
        }
      };
      setTimeout(dismissHint, 3500);
      document.addEventListener("touchstart", dismissHint, { once: true, passive: true });
    }
  }
});

// Homepage hero particle field: an ambient, cursor-reactive network of dots
// layered between the background video and its darkening overlay — a small
// nod to the lab's neural/connectivity focus. No-ops on pages without the
// canvas, and skipped entirely for prefers-reduced-motion.
document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("hero-particles");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var hero = canvas.closest(".hero");
  if (!hero) return;

  var ctx = canvas.getContext("2d");
  var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var COLORS = ["#4c6ef5", "#91a7ff", "#9775fa", "#5f3dc4"];
  var LINK_DIST = 115;
  var MOUSE_RADIUS = 150;

  var width = 0;
  var height = 0;
  var particles = [];
  var mouse = { x: 0, y: 0, active: false };

  function particleCount() {
    // Roughly one particle per 9000 CSS px^2 of hero area, capped for perf.
    return Math.max(32, Math.min(80, Math.round((width * height) / 9000)));
  }

  function seedParticles() {
    var count = particleCount();
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1,
        color: COLORS[i % COLORS.length]
      });
    }
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Gently push particles away from the cursor so the field visibly
      // reacts to it, instead of drifting obliviously underneath.
      if (mouse.active) {
        var dxm = p.x - mouse.x;
        var dym = p.y - mouse.y;
        var distM = Math.sqrt(dxm * dxm + dym * dym);
        if (distM < MOUSE_RADIUS && distM > 0.01) {
          var force = (1 - distM / MOUSE_RADIUS) * 0.6;
          p.x += (dxm / distM) * force;
          p.y += (dym / distM) * force;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.75;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Faint connective lines between nearby particles.
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = "rgba(145, 167, 255, " + (0.22 * (1 - dist / LINK_DIST)) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Brighter lines from the cursor to nearby particles — the part that
    // visibly "follows" the mouse.
    if (mouse.active) {
      for (var m = 0; m < particles.length; m++) {
        var pm = particles[m];
        var dxc = pm.x - mouse.x;
        var dyc = pm.y - mouse.y;
        var distC = Math.sqrt(dxc * dxc + dyc * dyc);
        if (distC < MOUSE_RADIUS) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(pm.x, pm.y);
          ctx.strokeStyle = "rgba(224, 231, 255, " + (0.35 * (1 - distC / MOUSE_RADIUS)) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  var rafId = null;
  var running = false;

  function loop() {
    if (!running) return;
    step();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  if (hasFinePointer) {
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    hero.addEventListener("mouseleave", function () {
      mouse.active = false;
    });
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  resize();
  start();
});
