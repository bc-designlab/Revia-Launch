/* Revia landing alt (Daybreak) — interaction logic */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- AR stage timeline ----------
     idle -> scan (beam sweeps the print, phone viewfinder on)
          -> ar   (anchor dots light, memory layers unfold in space)
     then hold, soft reset, loop. */
  var stage = document.getElementById("arStage");
  if (stage) {
    if (reduceMotion) {
      stage.classList.add("is-scan", "is-ar");
    } else {
      var PHASES = [
        { cls: [],                   hold: 1500 },
        { cls: ["is-scan"],          hold: 2600 },
        { cls: ["is-scan", "is-ar"], hold: 5600 },
      ];
      var idx = 0;
      function applyPhase() {
        stage.classList.remove("is-scan", "is-ar");
        // force reflow so one-shot animations (beam, scanline) retrigger
        void stage.offsetWidth;
        PHASES[idx].cls.forEach(function (c) { stage.classList.add(c); });
        var hold = PHASES[idx].hold;
        idx = (idx + 1) % PHASES.length;
        setTimeout(applyPhase, hold);
      }
      // start slightly delayed so the hero copy lands first
      setTimeout(applyPhase, 900);
    }
  }

  /* ---------- pointer parallax (desktop, fine pointers only) ---------- */
  var stageInner = document.getElementById("stageInner");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (stage && stageInner && finePointer && !reduceMotion) {
    var raf = null;
    stage.addEventListener("pointermove", function (ev) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = stage.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty("--px", (px * 12).toFixed(2));
        stage.style.setProperty("--py", (-py * 9).toFixed(2));
        raf = null;
      });
    });
    stage.addEventListener("pointerleave", function () {
      stage.style.setProperty("--px", "0");
      stage.style.setProperty("--py", "0");
    });
  }

  /* ---------- waitlist: native FormSubmit POST, default CAPTCHA retained ---------- */
  var backdrop = document.getElementById("waitlistModal");
  var closeBtn = document.getElementById("wlClose");
  var formWrap = document.getElementById("wlForm");
  var doneWrap = document.getElementById("wlDone");
  var formEl = document.getElementById("wlFormEl");
  var emailInput = document.getElementById("wlEmail");
  var errorEl = document.getElementById("wlError");
  var submitBtn = formEl.querySelector('[type="submit"]');
  var lastFocus = null;
  var submitting = false;
  var showingSuccess = false;
  var pendingKey = "revia-waitlist-pending";
  var returnURL = new URL(window.location.href);
  var requestId = returnURL.searchParams.get("request");
  var isReturn = returnURL.searchParams.get("waitlist") === "thanks";
  // Ordinary thank-you UX, not proof of inbox delivery. Require this tab's recent
  // pending request; an arbitrary success URL or old localStorage entry is ignored.
  if (isReturn) {
    try {
      var pending = JSON.parse(window.sessionStorage.getItem(pendingKey) || "null");
      var age = pending ? Date.now() - pending.createdAt : -1;
      showingSuccess = !!(pending && requestId === pending.id && age >= 0 && age < 1800000);
      window.sessionStorage.removeItem(pendingKey);
    } catch (e) {}
    returnURL.searchParams.delete("waitlist");
    returnURL.searchParams.delete("request");
    window.history.replaceState(null, "", returnURL.href);
  }
  returnURL.searchParams.delete("waitlist");
  returnURL.searchParams.delete("request");
  returnURL.hash = "";

  function hiddenField(name, value) {
    var field = formEl.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      formEl.appendChild(field);
    }
    field.value = value;
  }
  hiddenField("_url", returnURL.href);

  function openModal() {
    errorEl.hidden = true;
    lastFocus = document.activeElement;
    formWrap.hidden = showingSuccess;
    doneWrap.hidden = !showingSuccess;
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { (doneWrap.hidden ? emailInput : closeBtn).focus(); }, 60);
  }
  function closeModal() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
    showingSuccess = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll("[data-waitlist]").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (ev) {
    if (ev.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && backdrop.classList.contains("open")) closeModal();
  });
  window.addEventListener("pageshow", function () {
    submitting = false;
    submitBtn.disabled = false;
    formEl.removeAttribute("aria-busy");
  });
  formEl.addEventListener("submit", function (ev) {
    if (submitting || !formEl.checkValidity()) {
      ev.preventDefault();
      if (!submitting) formEl.reportValidity();
      return;
    }
    // Store only an ephemeral request marker, never the visitor's email. If session
    // storage is unavailable, keep the provider's own result page instead of _next.
    try {
      var id = window.crypto.randomUUID();
      window.sessionStorage.setItem(pendingKey, JSON.stringify({ id: id, createdAt: Date.now() }));
      var next = new URL(returnURL.href);
      next.searchParams.set("waitlist", "thanks");
      next.searchParams.set("request", id);
      hiddenField("_next", next.href);
    } catch (e) {
      var nextField = formEl.querySelector('input[name="_next"]');
      if (nextField) nextField.remove();
    }
    submitting = true;
    submitBtn.disabled = true;
    formEl.setAttribute("aria-busy", "true");
    // Native navigation handles CAPTCHA, activation and provider/network failures.
    // Do not render success or clear the email here; only a matching return does.
  });
  if (showingSuccess) openModal();
})();
