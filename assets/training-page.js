// Training: weekbalk, kaart "getraind op de route", weekverhaal (story) en weekverslag uit /training.js.
// Gedeeld door NL en EN. Gebruikt route.js voor de kaart (pts, at, path, LAND, STAGES).
(function () {
  const T = window.WIM_TRAINING || { weeks: [] };
  const WEEKS = T.weeks.slice().reverse(); // oud → nieuw
  if (!WEEKS.length) return;
  const $ = id => document.getElementById(id);
  const n1 = v => (Math.round(v * 10) / 10).toLocaleString(WIM_LOC, { maximumFractionDigits: 1 });
  const hm = m => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SOORT = { duur: t("Duurrit", "Endurance ride"), tempo: t("Temporit", "Tempo ride"), opbouw: t("Opbouwrit", "Progressive ride"), herstel: t("Herstelrit", "Recovery ride") };
  const ZN = [t("Herstel", "Recovery"), t("Duur", "Endurance"), "Tempo", t("Drempel", "Threshold"), t("Maximaal", "Maximum")];
  const ACT = {
    hiit: o => [`${o.aantal}× HIIT`, `${hm(o.min)} ${t("uur", "h")}`],
    run: o => [t(`${o.aantal}× hardlopen`, `${o.aantal}× running`), `${n1(o.km)} km`],
    walk: o => [t(`${o.aantal}× wandelen`, `${o.aantal}× walking`), `${n1(o.km)} km`],
  };
  const range = w => {
    const [a, b] = [WIM_DATE(w.van), WIM_DATE(w.tot)].map(s => s.split(" "));
    return a[1] === b[1] ? `${a[0]}–${b[0]} ${b[1]} ${b[2]}` : `${a[0]} ${a[1]} – ${b.join(" ")}`;
  };
  const wKm = w => w.ritten.reduce((s, r) => s + r.km, 0);
  const wMin = w => w.ritten.reduce((s, r) => s + r.min, 0);
  // minuten per zone over alle ritten van een week
  const wZone = w => [0, 1, 2, 3, 4].map(i => w.ritten.reduce((s, r) => s + r.min * r.zones[i] / 100, 0));
  const cum = WEEKS.map((w, i) => WEEKS.slice(0, i + 1).reduce((s, x) => s + wKm(x), 0));
  const words = w => t(w.tekst, w.text) || [];
  const MONO = `<svg viewBox="273.3 154.1 294.8 141.8" aria-hidden="true">${window.WIM_MONO}</svg>`;

  // Waar zou Warren op de route zijn met deze kilometers?
  function onRoute(km) {
    if (km >= ROUTE_KM) return t(`Dat is al ${n1(km / ROUTE_KM)} keer de hele route van Lucca naar Veenendaal.`, `That is already ${n1(km / ROUTE_KM)} times the whole route from Lucca to Veenendaal.`);
    const s = STAGES.find(x => km <= x.b) || STAGES[STAGES.length - 1];
    return t(`Op de route zou Warren nu in etappe ${s.dag} zijn, tussen ${s.van} en ${s.naar}.`, `On the route, Warren would now be in stage ${s.dag}, between ${s.van} and ${s.naar}.`);
  }

  // ── Kaart: getraind op de route ─────────────────────────────────────────
  const svg = $("tMap");
  let trail, dot, dotLab, trailLen = 0;
  if (svg && typeof pts !== "undefined") {
    const xs = pts.map(q => q.p[0]), ys = pts.map(q => q.p[1]);
    const x0 = Math.min(...xs) - 150, x1 = Math.max(...xs) + 170, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30;
    svg.setAttribute("viewBox", `${x0.toFixed(0)} ${y0.toFixed(0)} ${(x1 - x0).toFixed(0)} ${(y1 - y0).toFixed(0)}`);
    if (LAND) svg.append(el("path", { d: LAND, fill: "var(--land)", "fill-rule": "evenodd" }));
    if (BORDERS) svg.append(el("path", { d: BORDERS, fill: "none", stroke: "var(--border)", "stroke-width": 1.4 }));
    svg.append(el("path", { d: path(0, ROUTE_KM), fill: "none", stroke: "var(--empty)", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "2 14" }));
    trail = el("path", { d: path(0, ROUTE_KM), fill: "none", stroke: "var(--groen)", "stroke-width": 18, "stroke-linecap": "round", "stroke-linejoin": "round", class: "t-trail" });
    svg.append(trail);
    trailLen = trail.getTotalLength();
    trail.setAttribute("stroke-dasharray", `${trailLen} ${trailLen}`);
    trail.setAttribute("stroke-dashoffset", trailLen);
    for (const [name, side] of [["Lucca", "r"], ["Mulhouse", "l"], ["Veenendaal", "r"]]) {
      const q = pts.find(p => p.name === name); if (!q) continue;
      const [x, y] = q.p, r = side === "r";
      svg.append(el("circle", { cx: x, cy: y, r: 10, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 4 }));
      svg.append(el("text", { x: x + (r ? 22 : -22), y: y + 13, "text-anchor": r ? "start" : "end", "font-size": 40, fill: "var(--fg)" }, name));
    }
    dot = el("circle", { r: 22, fill: "var(--brons)", stroke: "var(--bg)", "stroke-width": 6 });
    dotLab = el("text", { "font-size": 46, "font-weight": 700, fill: "var(--fg)", stroke: "var(--bg)", "stroke-width": 12, "paint-order": "stroke", "stroke-linejoin": "round" });
    svg.append(dot, dotLab);
  }
  function showMap(i) {
    const km = Math.min(cum[i], ROUTE_KM);
    if (trail) {
      // aandeel van de padlengte tot dit punt
      const part = el("path", { d: path(0, Math.max(km, .01)) }); svg.append(part);
      const len = part.getTotalLength(); part.remove();
      trail.setAttribute("stroke-dashoffset", Math.max(0, trailLen - len));
      const [x, y] = at(km), right = x < (svg.viewBox.baseVal.x + svg.viewBox.baseVal.width * .55);
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      dotLab.setAttribute("x", x + (right ? 36 : -36)); dotLab.setAttribute("y", y + 16);
      dotLab.setAttribute("text-anchor", right ? "start" : "end");
      dotLab.textContent = `${n1(cum[i])} km`;
    }
    if ($("tMapCap")) $("tMapCap").innerHTML = t(
      `Tot en met week ${WEEKS[i].week} fietste Warren <b>${n1(cum[i])} km</b>. ${onRoute(cum[i])}`,
      `Up to and including week ${WEEKS[i].week}, Warren cycled <b>${n1(cum[i])} km</b>. ${onRoute(cum[i])}`);
  }

  // ── Weekbalk ────────────────────────────────────────────────────────────
  const strip = $("wStrip");
  const maxKm = Math.max(100, ...WEEKS.map(wKm));
  strip.innerHTML = WEEKS.map((w, i) => {
    const km = wKm(w), h = Math.max(4, km / maxKm * 150), z = wZone(w), zt = z.reduce((a, b) => a + b, 0) || 1;
    const alt = !w.ritten.length && (w.overig || []).length ? ACT[w.overig[0].soort]?.(w.overig[0])[0] || "" : "";
    return `<button type="button" class="wbar" data-i="${i}" aria-pressed="false" aria-label="${t("Week", "Week")} ${w.week}: ${n1(km)} km">
      <span class="km">${km ? n1(Math.round(km)) : "–"}</span>
      <span class="col" style="height:${h}px">${km ? z.map((m, j) => m ? `<i class="z${j + 1}" style="height:${m / zt * 100}%"></i>` : "").join("") : ""}</span>
      <span class="lab">${t("wk", "wk")} ${w.week}</span>${alt ? `<span class="alt">${alt}</span>` : ""}</button>`;
  }).join("");
  if ($("tZones")) $("tZones").innerHTML = ZN.map((z, i) => `<span><i class="zc z${i + 1}"></i>Z${i + 1} · ${z}</span>`).join("");

  // ── Totalen ─────────────────────────────────────────────────────────────
  const tKm = cum[cum.length - 1], tRit = WEEKS.reduce((s, w) => s + w.ritten.length, 0), tMin = WEEKS.reduce((s, w) => s + wMin(w), 0);
  if ($("tFacts")) $("tFacts").innerHTML = [
    [n1(tKm), t("km gefietst", "km cycled")], [tRit, t("ritten", "rides")],
    [Math.round(tMin / 60), t("uur op de fiets", "hours on the bike")], [WEEKS.length, t("weken in dit verslag", "weeks in this log")],
  ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");

  // ── Weekverhaal (story) ─────────────────────────────────────────────────
  const story = $("wStory");
  let slides = [], cur = 0, t0 = 0, dur = 5000, paused = reduce, raf = 0, visible = false, elapsed = 0;
  function storySlides(w, i) {
    const km = wKm(w), z = wZone(w), zt = z.reduce((a, b) => a + b, 0);
    const foot = `<div class="s-foot"><span>${t("Training", "Training")} · warreninmotion.nl</span>${MONO}</div>`;
    const S = [];
    S.push(`<div class="s-eye">${t("Week", "Week")} ${w.week} · ${range(w)}</div>
      ${km ? `<div class="s-big">${n1(Math.round(km))}<small> km</small></div><div class="s-line"></div>
      <div class="s-p">${w.ritten.length} ${w.ritten.length === 1 ? t("rit", "ride") : t("ritten", "rides")} · ${hm(wMin(w))} ${t("uur op de fiets", "hours on the bike")}</div>`
      : `<div class="s-h">${t("Een week zonder fiets", "A week off the bike")}</div><div class="s-line"></div>`}
      ${(w.overig || []).length ? `<div class="s-sub">${w.overig.map(o => ACT[o.soort] ? ACT[o.soort](o).join(" · ") : "").join("<br>")}</div>` : ""}
      ${weekBars(i)}${foot}`);
    for (const m of w.media || []) {
      const alt = esc(t(m.alt, m.altEn || m.alt) || "");
      S.push({ media: m, html: (m.type === "video"
        ? `<video class="media" src="${m.src}" muted playsinline preload="metadata"${m.poster ? ` poster="${m.poster}"` : ""} aria-label="${alt}"></video>`
        : `<img class="media" src="${m.src}" alt="${alt}" loading="lazy">`) + (m.cap ? `<div class="cap">${esc(t(m.cap, m.capEn || m.cap))}</div>` : "") });
    }
    if (zt) S.push(`<div class="s-eye">${t("Zo hard ging het", "How hard it was")}</div><div class="s-h">${t("Tijd per hartslagzone", "Time per heart rate zone")}</div>
      <div class="s-zones">${z.map((m, j) => `<div class="s-zone"><span><b>Z${j + 1}</b> ${ZN[j].toLowerCase()}</span><span class="tr"><i class="sz${j + 1}" style="width:${m / zt * 100}%"></i></span><span>${hm(m)}</span></div>`).join("")}</div>
      ${foot}`);
    if (w.ritten.length) S.push(`<div class="s-eye">${t("De ritten", "The rides")}</div><div class="s-h">${t("Op lengte, niet op dag", "By length, not by day")}</div>
      <div class="s-rides">${w.ritten.map(r => `<div class="s-ride"><div><span>${SOORT[r.soort] || r.soort}</span><span>${n1(r.km)} km</span></div>
      <div class="zb">${r.zones.map((v, j) => v ? `<i class="sz${j + 1}" style="width:${v}%"></i>` : "").join("")}</div></div>`).join("")}</div>${foot}`);
    const ws = words(w);
    if (ws.length) S.push(`<div class="s-eye">${t("Warren", "Warren")}</div><div class="s-q${ws[0].length > 190 ? " small" : ""}">“${ws[0]}”</div><div class="s-line"></div><div class="s-sub">— Warren</div>${foot}`);
    S.push(`<div class="s-eye">${t("Op weg naar mei 2027", "On the way to May 2027")}</div><div class="s-big" style="font-size:17cqw">${n1(cum[i])}<small> km</small></div>
      <div class="s-p">${t("getraind tot nu toe", "trained so far")}</div><div class="s-sub">${onRoute(cum[i])}</div>${miniMap(cum[i])}${foot}`);
    return S;
  }
  // kleine weekgrafiek op de eerste dia: de laatste 8 weken, deze week in brons
  function weekBars(i) {
    const from = Math.max(0, i - 7), list = WEEKS.slice(from, i + 1), mx = Math.max(100, ...list.map(wKm));
    return `<div class="s-weeks" aria-hidden="true">${list.map((w, k) => `<div class="${from + k === i ? "on" : ""}"><span>${wKm(w) ? n1(Math.round(wKm(w))) : "–"}</span><i style="height:${wKm(w) / mx * 38}cqw"></i><span>${t("wk", "wk")} ${w.week}</span></div>`).join("")}</div>`;
  }
  function miniMap(km) {
    if (typeof pts === "undefined") return "";
    const xs = pts.map(q => q.p[0]), ys = pts.map(q => q.p[1]);
    const x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 20, y1 = Math.max(...ys) + 20;
    const k = Math.min(km, ROUTE_KM), [x, y] = at(k);
    return `<svg class="s-map" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="${path(0, ROUTE_KM)}" fill="none" stroke="rgba(242,238,228,.28)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      ${k > 0 ? `<path d="${path(0, k)}" fill="none" stroke="#F2EEE4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
      <circle cx="${x}" cy="${y}" r="36" fill="#C08A3E" stroke="#1E4034" stroke-width="10"/></svg>`;
  }
  function buildStory(i) {
    cancelAnimationFrame(raf);
    const S = storySlides(WEEKS[i], i);
    story.innerHTML = `<div class="bars">${S.map(() => "<span><i></i></span>").join("")}</div>` +
      S.map((s, j) => `<div class="slide${typeof s === "object" ? " m" : ""}" aria-hidden="true" data-j="${j}">${typeof s === "object" ? s.html : s}</div>`).join("") +
      `<button type="button" class="tap prev" aria-label="${t("Vorige", "Previous")}"></button><button type="button" class="tap next" aria-label="${t("Volgende", "Next")}"></button>
       <button type="button" class="ctrl" aria-label=""></button>`;
    slides = [...story.querySelectorAll(".slide")];
    story.querySelector(".prev").onclick = () => go(cur - 1);
    story.querySelector(".next").onclick = () => go(cur + 1);
    story.querySelector(".ctrl").onclick = () => setPaused(!paused);
    go(0);
  }
  function setPaused(p) {
    paused = p;
    const b = story.querySelector(".ctrl");
    b.setAttribute("aria-label", p ? t("Afspelen", "Play") : t("Pauzeren", "Pause"));
    b.innerHTML = p ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>` : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`;
    const v = slides[cur]?.querySelector("video");
    if (v) p || !visible ? v.pause() : v.play().catch(() => {});
    t0 = performance.now() - elapsed;
    if (!p) tick();
  }
  function go(j) {
    if (j < 0) j = 0;
    if (j >= slides.length) { // einde: blijf op de laatste dia staan
      j = slides.length - 1; elapsed = dur; fill(); return setPaused(true);
    }
    slides.forEach((s, k) => { s.classList.toggle("on", k === j); s.setAttribute("aria-hidden", String(k !== j)); const v = s.querySelector("video"); if (v && k !== j) v.pause(); });
    cur = j; elapsed = 0; dur = 5000;
    const v = slides[j].querySelector("video");
    if (v) {
      v.currentTime = 0;
      const setDur = () => { dur = Math.min(15000, (v.duration || 5) * 1000); };
      v.duration ? setDur() : v.addEventListener("loadedmetadata", setDur, { once: true });
      if (!paused && visible) v.play().catch(() => {});
    }
    t0 = performance.now();
    fill(); setPaused(paused);
  }
  function fill() {
    story.querySelectorAll(".bars i").forEach((b, k) => { b.style.width = k < cur ? "100%" : k > cur ? "0" : `${Math.min(100, elapsed / dur * 100)}%`; });
  }
  function tick() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(now => {
      if (paused || !visible) return;
      elapsed = now - t0; fill();
      if (elapsed >= dur) go(cur + 1); else tick();
    });
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; t0 = performance.now() - elapsed; if (!visible) slides[cur]?.querySelector("video")?.pause(); setPaused(paused); }, { threshold: .4 }).observe(story);
  story.addEventListener("keydown", e => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });

  // ── Weekpaneel ──────────────────────────────────────────────────────────
  function showWeek(i, scroll) {
    const w = WEEKS[i];
    strip.querySelectorAll(".wbar").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
    $("wPrev").disabled = i === 0; $("wNext").disabled = i === WEEKS.length - 1;
    const km = wKm(w), z = wZone(w), zt = z.reduce((a, b) => a + b, 0);
    $("wTitle").textContent = `${t("Week", "Week")} ${w.week} · ${range(w)}`;
    $("wStats").innerHTML = [
      w.ritten.length ? `<b>${n1(km)} km</b> ${t("gefietst", "cycled")}` : t("Geen fietskilometers", "No cycling"),
      w.ritten.length ? `${w.ritten.length} ${w.ritten.length === 1 ? t("rit", "ride") : t("ritten", "rides")} · ${hm(wMin(w))} ${t("uur", "h")}` : "",
      ...(w.overig || []).map(o => ACT[o.soort] ? ACT[o.soort](o).join(" · ") : ""),
    ].filter(Boolean).map(x => `<span>${x}</span>`).join("");
    $("wZmix").innerHTML = zt ? `<div class="eyebrow">${t("Tijd per hartslagzone", "Time per heart rate zone")}</div>
      <div class="zmix-bar" role="img" aria-label="${z.map((m, j) => `Z${j + 1} ${hm(m)}`).join(", ")}">${z.map((m, j) => m ? `<i class="z${j + 1}" style="width:${m / zt * 100}%"></i>` : "").join("")}</div>
      <div class="zmix-leg">${z.map((m, j) => `<span><i class="zc z${j + 1}"></i>Z${j + 1} <b>${hm(m)}</b> · ${Math.round(m / zt * 100)}%</span>`).join("")}</div>` : "";
    $("wText").innerHTML = words(w).map(p => `<p>${p}</p>`).join("") + `<p class="sig">— Warren</p>`;
    $("wRides").innerHTML = w.ritten.length ? w.ritten.map((r, k) => `<li><button type="button" aria-expanded="false">
        <span class="r-h"><b>${SOORT[r.soort] || r.soort}</b><span>${n1(r.km)} km · ${hm(r.min)} ${t("uur", "h")} · ${n1(r.km / r.min * 60)} ${t("km/u", "km/h")}${r.binnen ? t(" · binnen", " · indoor") : t(" · buiten", " · outdoor")}</span></span>
        <span class="zbar">${r.zones.map((v, j) => v ? `<i class="z${j + 1}" style="width:${v}%"></i>` : "").join("")}</span>
        <span class="r-more">${r.zones.map((v, j) => v ? `<span>Z${j + 1} <b>${hm(r.min * v / 100)}</b> (${v}%)</span>` : "").join("")}</span>
        <span class="r-hint">${t("Tik voor de minuten per zone", "Tap for minutes per zone")}</span></button></li>`).join("") : "";
    $("wRides").hidden = !w.ritten.length;
    $("wRides").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { const li = b.parentElement, o = !li.classList.contains("open"); li.classList.toggle("open", o); b.setAttribute("aria-expanded", String(o)); }));
    showMap(i);
    buildStory(i);
    if (history.replaceState) history.replaceState(null, "", `#week-${w.week}`);
    if (scroll) $("wPanel").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const btn = strip.querySelector(`[data-i="${i}"]`); strip.scrollLeft = Math.max(0, btn.offsetLeft - strip.clientWidth + btn.offsetWidth + 8);
    sel = i;
  }
  let sel = WEEKS.length - 1;
  strip.addEventListener("click", e => { const b = e.target.closest(".wbar"); if (b) showWeek(+b.dataset.i); });
  $("wPrev").addEventListener("click", () => sel > 0 && showWeek(sel - 1));
  $("wNext").addEventListener("click", () => sel < WEEKS.length - 1 && showWeek(sel + 1));
  const fromHash = WEEKS.findIndex(w => location.hash === `#week-${w.week}`);
  showWeek(fromHash >= 0 ? fromHash : WEEKS.length - 1);
  if ($("tUpd")) $("tUpd").textContent = t(`Bijgewerkt op ${WIM_DATE(T.updated)}.`, `Updated ${WIM_DATE(T.updated)}.`);
})();
