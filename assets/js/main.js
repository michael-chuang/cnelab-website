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

  // Hero background video controls (YouTube IFrame postMessage API).
  var video = document.getElementById("hero-video");
  var playBtn = document.getElementById("video-toggle-play");
  var muteBtn = document.getElementById("video-toggle-mute");

  function ytCommand(func) {
    if (!video || !video.contentWindow) return;
    video.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: [] }), "*");
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      var isPaused = playBtn.classList.toggle("is-paused");
      ytCommand(isPaused ? "pauseVideo" : "playVideo");
      playBtn.setAttribute("aria-label", isPaused ? "Play background video" : "Pause background video");
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", function () {
      var isUnmuted = muteBtn.classList.toggle("is-unmuted");
      ytCommand(isUnmuted ? "unMute" : "mute");
      muteBtn.setAttribute("aria-label", isUnmuted ? "Mute background video" : "Unmute background video");
    });
  }

  // When the page is restored from the browser's back/forward cache (e.g. user
  // navigates to another page and then hits Back), the YouTube iframe is often
  // left frozen rather than resuming playback. Force it to reload so autoplay
  // kicks in again, and reset our custom controls to match the fresh state.
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted || !video) return;
    var src = video.src;
    video.src = "";
    video.src = src;
    if (playBtn) {
      playBtn.classList.remove("is-paused");
      playBtn.setAttribute("aria-label", "Pause background video");
    }
    if (muteBtn) {
      muteBtn.classList.remove("is-unmuted");
      muteBtn.setAttribute("aria-label", "Unmute background video");
    }
  });
});
