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

  // Publication year rail: builds a clickable year index next to the
  // "Journal Papers — Published / Accepted" list (see publications.html),
  // highlights the year currently in view, and jumps to a year on click.
  var yearRail = document.getElementById("pub-year-rail");
  var pubYearList = document.getElementById("pub-year-list");
  if (yearRail && pubYearList) {
    var yearItems = pubYearList.querySelectorAll("li[data-year]");
    var firstItemForYear = {};
    var years = [];

    yearItems.forEach(function (li) {
      var year = li.getAttribute("data-year");
      if (!(year in firstItemForYear)) {
        years.push(year);
        firstItemForYear[year] = li;
      }
    });

    years.forEach(function (year) {
      var link = document.createElement("button");
      link.type = "button";
      link.className = "pub-year-link";
      link.textContent = year;
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
            yearRail.querySelectorAll(".pub-year-link").forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("data-year") === year);
            });
          });
        },
        { threshold: 0, rootMargin: "-20% 0px -70% 0px" }
      );
      years.forEach(function (year) {
        yearSpy.observe(firstItemForYear[year]);
      });
    }
  }
});
