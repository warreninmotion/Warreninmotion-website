// Training: totaal sinds de lancering (cijfers met weetje), weekkalender tot de tocht, weekverhaal (story) en
// weekverslag uit /training.js. Gedeeld door NL en EN. Gebruikt route.js voor de route (pts, at, path, STAGES).
(function () {
  const T = window.WIM_TRAINING || { weeks: [] };
  // trainingen in blokken: km, duur, hoogtemeters en zones uit de blokken (zones gewogen naar tijd)
  const norm = r => {
    if (!r.blokken) return r;
    const B = r.blokken, min = B.reduce((s, b) => s + b.min, 0);
    return { ...r, km: B.reduce((s, b) => s + b.km, 0), min, up: B.reduce((s, b) => s + (b.up || 0), 0),
      zones: [0, 1, 2, 3, 4].map(i => Math.round(B.reduce((s, b) => s + b.zones[i] * b.min, 0) / min)) };
  };
  const WEEKS = T.weeks.slice().reverse().map(w => ({ ...w, ritten: w.ritten.map(norm) })); // oud → nieuw
  if (!WEEKS.length) return;
  const $ = id => document.getElementById(id);
  const n1 = v => (Math.round(v * 10) / 10).toLocaleString(WIM_LOC, { maximumFractionDigits: 1 });
  const hm = m => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SOORT = { lang: t("Lange rit", "Long ride"), duur: t("Duurrit", "Endurance ride"), tempo: t("Temporit", "Tempo ride"), opbouw: t("Opbouwrit", "Progressive ride"), herstel: t("Herstelrit", "Recovery ride") };
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

  // ── Totaal sinds de lancering: één cijfer tegelijk, met een weetje ─────────
  const W = WEEKS, sum = f => W.reduce((s, w) => s + f(w), 0);
  const TOT = {
    km: sum(wKm),
    trainingen: sum(w => w.ritten.length + (w.overig || []).reduce((s, o) => s + o.aantal, 0)),
    uren: sum(w => wMin(w) + (w.overig || []).reduce((s, o) => s + (o.min || 0), 0)) / 60,
    kcal: sum(w => w.kcal || 0),
    hm: sum(w => w.ritten.reduce((s, r) => s + (r.up || 0), 0)),
  };
  const WJ = T.weetjes || {};
  const wj = k => (WJ[k] && t(WJ[k][0], WJ[k][1])) || "";
  const CARDS = [
    { k: "km", v: n1(TOT.km), u: "km", lab: t("gefietst", "cycled"), extra: true },
    { k: "trainingen", v: TOT.trainingen, u: "", lab: t("trainingen", "training sessions") },
    { k: "uren", v: n1(Math.round(TOT.uren)), u: t("uur", "hours"), lab: t("getraind", "of training") },
    { k: "kcal", v: n1(TOT.kcal), u: "kcal", lab: t("verbrand", "burned") },
    { k: "hm", v: n1(TOT.hm), u: t("hoogtemeters", "metres climbed"), lab: "" },
  ].filter(c => c.k !== "kcal" || TOT.kcal).filter(c => c.k !== "hm" || TOT.hm);
  const totEl = $("tTot");
  let totI = 0, totTimer = 0, totHover = false, totVis = false;
  if (totEl) {
    totEl.innerHTML = `<div class="tot-track">${CARDS.map((c, i) => `<div class="tot-card${i ? "" : " on"}${c.extra ? " has-map" : ""}" role="group" aria-roledescription="${t("dia", "slide")}" aria-label="${i + 1} / ${CARDS.length}">
        <div class="tot-big">${c.v}${c.u ? ` <small>${c.u}</small>` : ""}</div>${c.lab ? `<div class="tot-lab">${c.lab}</div>` : ""}
        ${wj(c.k) ? `<p class="tot-fact">${wj(c.k)}</p>` : ""}
        ${c.extra ? `<p class="tot-route">${onRoute(TOT.km)}</p>${routeLine(TOT.km)}` : ""}</div>`).join("")}</div>
      <div class="tot-nav"><button type="button" class="tot-prev" aria-label="${t("Vorige", "Previous")}">←</button>
      <div class="tot-dots">${CARDS.map((c, i) => `<button type="button" aria-label="${c.lab || c.u}" aria-current="${i ? "false" : "true"}"></button>`).join("")}</div>
      <button type="button" class="tot-next" aria-label="${t("Volgende", "Next")}">→</button></div>`;
    const cards = [...totEl.querySelectorAll(".tot-card")], dots = [...totEl.querySelectorAll(".tot-dots button")];
    const show = i => {
      totI = (i + cards.length) % cards.length;
      cards.forEach((c, j) => c.classList.toggle("on", j === totI));
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === totI)));
      plan();
    };
    const plan = () => { clearTimeout(totTimer); if (!reduce && totVis && !totHover) totTimer = setTimeout(() => show(totI + 1), 6000); };
    totEl.querySelector(".tot-prev").onclick = () => show(totI - 1);
    totEl.querySelector(".tot-next").onclick = () => show(totI + 1);
    dots.forEach((d, j) => d.onclick = () => show(j));
    totEl.addEventListener("pointerenter", () => { totHover = true; plan(); });
    totEl.addEventListener("pointerleave", () => { totHover = false; plan(); });
    totEl.addEventListener("focusin", () => { totHover = true; plan(); });
    totEl.addEventListener("focusout", () => { totHover = false; plan(); });
    // vegen op telefoon
    let x0 = null;
    totEl.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    totEl.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(totI + (dx < 0 ? 1 : -1)); x0 = null; });
    new IntersectionObserver(es => { totVis = es[0].isIntersecting; plan(); }, { threshold: .5 }).observe(totEl);
  }
  if ($("tSince")) $("tSince").textContent = t(`Sinds de lancering · week ${W[0].week} t/m ${W[W.length - 1].week}`, `Since the launch · week ${W[0].week} to ${W[W.length - 1].week}`);
  // de route als lijn, met het getrainde stuk en een stip
  function routeLine(km) {
    if (typeof pts === "undefined") return "";
    const xs = pts.map(q => q.p[0]), ys = pts.map(q => q.p[1]);
    const x0 = Math.min(...xs) - 30, x1 = Math.max(...xs) + 30, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30;
    const k = Math.min(km, ROUTE_KM), [x, y] = at(k), L = pts[0].p, F = pts[pts.length - 1].p;
    return `<svg class="tot-map" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" aria-hidden="true">
      <path d="${path(0, ROUTE_KM)}" fill="none" stroke="var(--line)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      ${k > 0 ? `<path d="${path(0, k)}" fill="none" stroke="var(--groen)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
      <circle cx="${x}" cy="${y}" r="30" fill="var(--brons)" stroke="var(--bg)" stroke-width="8"/>
      <circle cx="${F[0]}" cy="${F[1]}" r="16" fill="var(--bg)" stroke="var(--fg)" stroke-width="7"/><circle cx="${L[0]}" cy="${L[1]}" r="16" fill="var(--bg)" stroke="var(--fg)" stroke-width="7"/></svg>`;
  }

  // ── Weekkalender: van de lancering tot de tocht ─────────────────────────
  // maandag van ISO-week w in jaar y
  const isoMon = (y, w) => { const d = new Date(Date.UTC(y, 0, 4)); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + (w - 1) * 7); return d; };
  const isoWeek = d => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() + 3 - ((x.getUTCDay() + 6) % 7)); const y = x.getUTCFullYear(); return [y, 1 + Math.round((x - isoMon(y, 1)) / 6048e5)]; };
  const mon = d => d.toLocaleDateString(WIM_LOC, { month: "short", timeZone: "UTC" }).replace(".", "");
  // gepland schema per week (fase, richtlijn km, rustweek)
  const P = T.plan || { fasen: [], rust: [] };
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1];
  const planFor = (y, wk) => {
    const f = P.fasen.find(x => cmp([y, wk], x.van) >= 0 && cmp([y, wk], x.tot) <= 0);
    if (!f) return null;
    const rust = P.rust.some(r => r[0] === y && r[1] === wk);
    return { f, rust, km: f.km && rust ? f.km.map(v => Math.round(v * .6 / 10) * 10) : f.km };
  };
  // evenementen (events.js) met jaar en week erbij
  const tt = a => Array.isArray(a) ? t(a[0], a[1]) : (a || "");
  const EV = (window.WIM_EVENTS || []).map(e => {
    const d = e.datum ? new Date(e.datum + "T00:00:00Z") : isoMon(e.week[0], e.week[1]);
    const [y, wk] = isoWeek(d); return { ...e, d, y, wk, end: e.tot ? new Date(e.tot + "T00:00:00Z") : null };
  }).sort((a, b) => a.d - b.d);
  const kmTxt = km => !km ? t("De route", "The route") : `${km[0]}–${km[1]} km`;
  const evDate = e => {
    if (!e.datum) return t(`Week ${e.wk}, ${e.d.toLocaleDateString(WIM_LOC, { month: "long", year: "numeric", timeZone: "UTC" })}`, `Week ${e.wk}, ${e.d.toLocaleDateString(WIM_LOC, { month: "long", year: "numeric", timeZone: "UTC" })}`);
    const o = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    return e.end ? `${e.d.getUTCDate()}–${e.end.toLocaleDateString(WIM_LOC, o)}` : e.d.toLocaleDateString(WIM_LOC, { weekday: "long", ...o });
  };
  const evMini = e => `<li><b>${tt(e.titel)}</b> · ${evDate(e)}${e.voorbehoud ? ` <span class="muted">(${t("onder voorbehoud", "to be confirmed")})</span>` : ""}</li>`;
  const CAL = [];
  {
    const end = isoMon(T.tot.jaar, T.tot.week);
    for (let d = isoMon(W[0].jaar, W[0].week); d <= end; d = new Date(d.getTime() + 6048e5)) {
      const [y, wk] = isoWeek(d), data = W.find(w => w.week === wk && w.jaar === y);
      CAL.push({ y, wk, d, data, idx: data ? W.indexOf(data) : -1, tour: y === T.tot.jaar && wk === T.tot.week, plan: data ? null : planFor(y, wk), ev: EV.filter(e => e.y === y && e.wk === wk) });
    }
  }
  const strip = $("wStrip");
  const today = new Date(), [ty, tw] = isoWeek(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
  const isNow = c => c.y === ty && c.wk === tw;
  const datesOf = c => { const e = new Date(c.d.getTime() + 6 * 864e5); return `${c.d.getUTCDate()}${mon(c.d) !== mon(e) ? " " + mon(c.d) : ""}–${e.getUTCDate()} ${mon(e)}`; };
  const longDates = c => { const e = new Date(c.d.getTime() + 6 * 864e5), o = { day: "numeric", month: "long", timeZone: "UTC" };
    return `${c.d.toLocaleDateString(WIM_LOC, c.d.getUTCMonth() === e.getUTCMonth() ? { day: "numeric", timeZone: "UTC" } : o)}–${e.toLocaleDateString(WIM_LOC, { ...o, year: "numeric" })}`; };
  let lastMonth = "";
  strip.innerHTML = CAL.map((c, ci) => {
    const m = c.d.toLocaleDateString(WIM_LOC, { month: "long", year: "numeric", timeZone: "UTC" });
    const head = m !== lastMonth ? `<span class="cal-m">${m}</span>` : '<span class="cal-m" aria-hidden="true"></span>'; lastMonth = m;
    let body, cls = "cal";
    if (c.data) { const km = wKm(c.data); body = `<span class="cal-km">${km ? n1(Math.round(km)) : "–"}<small>${km ? " km" : ""}</small></span><span class="cal-s">${t("Gefietst", "Cycled")}</span>`; }
    else if (c.tour) { cls += " tour"; body = `<span class="cal-km">${n1(ROUTE_KM)}<small> km</small></span><span class="cal-s">${t("De tocht", "The ride")}</span>`; }
    else if (c.plan) { cls += " plan"; body = `<span class="cal-km">${kmTxt(c.plan.km)}</span><span class="cal-s">${c.plan.rust ? t("Rustweek", "Rest week") : t(c.plan.f.naam[0], c.plan.f.naam[1])}</span>`; }
    else { cls += " plan"; body = `<span class="cal-s">${t("Nog te gaan", "To come")}</span>`; }
    if (c.ev.length) { cls += " has-ev"; body += `<span class="cal-ev">${c.ev.map(e => tt(e.titel)).join(" · ")}</span>`; }
    if (isNow(c) && !c.data) cls += " now";
    return `<div class="cal-col">${head}<button type="button" data-c="${ci}" aria-pressed="false" class="${cls}">
      <span class="cal-wk">${t("Week", "Week")} ${c.wk}${isNow(c) ? ` · ${t("nu", "now")}` : ""}</span><span class="cal-d">${datesOf(c)}</span>${body}</button></div>`;
  }).join("");
  const toGo = CAL.filter(c => c.tour || (!c.data && cmp([c.y, c.wk], [ty, tw]) > 0)).length;
  if ($("tToGo")) $("tToGo").textContent = t(`Nog ${toGo} weken tot de start in Lucca. Tik op een week voor het verslag of het schema.`, `${toGo} weeks to go until the start in Lucca. Tap a week for the report or the plan.`);

  // schema-overzicht en week uit het schema (of de tocht zelf)
  function showPlan(ci) {
    const c = CAL[ci], p = c.plan;
    $("wPlanList").innerHTML = P.fasen.map(f => `<li class="${p && p.f === f ? "on" : ""}"><b>${t(f.naam[0], f.naam[1])}</b>
      <span>${t("week", "week")} ${f.van[1]}${f.van[0] !== f.tot[0] || f.van[1] !== f.tot[1] ? `–${f.tot[1]}` : ""}</span><span>${kmTxt(f.km)}</span></li>`).join("") +
      `<li class="tour${c.tour ? " on" : ""}"><b>${t("De tocht", "The ride")}</b><span>${t("week", "week")} ${T.tot.week}</span><span>${n1(ROUTE_KM)} km</span></li>`;
    $("wPlanEye").textContent = c.tour ? t("15–22 mei 2027", "15–22 May 2027") : isNow(c) ? t("Deze week · loopt nog", "This week · in progress") : t("Gepland", "Planned");
    $("wPlanTitle").textContent = `${t("Week", "Week")} ${c.wk} · ${longDates(c)}`;
    if (c.tour) {
      $("wPlanBody").innerHTML = `<div class="wstats"><span><b>${n1(ROUTE_KM)} km</b> ${t("in 8 dagen", "in 8 days")}</span><span>${t("7 landen", "7 countries")}</span></div>
        <div class="prose"><p>${t("Van Lucca naar huis in Veenendaal, voor Voedselbanken Nederland. Hier werkt al die training naartoe.", "From Lucca home to Veenendaal, for the Dutch Food Banks. This is what all the training is for.")}</p>
        <p><a class="more" href="${L("/route/")}">${t("Bekijk de route", "See the route")}</a></p></div>`;
    } else if (p) {
      $("wPlanBody").innerHTML = `<div class="wstats"><span><b>${kmTxt(p.km)}</b>${p.km ? " " + t("op de fiets", "on the bike") : ""}</span><span>${t("Fase", "Phase")}: ${t(p.f.naam[0], p.f.naam[1])}</span></div>
        ${c.ev.length ? `<ul class="ev-mini">${c.ev.map(evMini).join("")}</ul>` : ""}
        <div class="prose"><p>${t(p.f.focus[0], p.f.focus[1])}</p>${p.rust ? `<p>${t("Dit is een rustweek: minder kilometers, zodat het lijf de training kan verwerken.", "This is a rest week: fewer kilometres, so the body can absorb the training.")}</p>` : ""}
        <p class="small muted">${t("Het schema is een richtlijn. Na afloop van de week zie je hier wat Warren echt heeft gedaan.", "The plan is a guideline. Once the week is over, you'll see here what Warren actually did.")}</p></div>`;
    } else $("wPlanBody").innerHTML = "";
  }

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
    if (w.ritten.length) S.push(`<div class="s-eye">${t("De ritten", "The rides")}</div><div class="s-h">${t("Van deze week", "This week")}</div>
      <div class="s-rides">${w.ritten.map(r => `<div class="s-ride"><div><span>${SOORT[r.soort] || r.soort}${r.blokken ? ` · ${r.blokken.length}× ${n1(r.blokken[0].km)}` : ""}</span><span>${n1(r.km)} km</span></div>
      ${r.blokken ? `<div class="zbs">${r.blokken.map(b => `<div class="zb" style="flex:${b.km}">${b.zones.map((v, j) => v ? `<i class="sz${j + 1}" style="width:${v}%"></i>` : "").join("")}</div>`).join("")}</div>`
        : `<div class="zb">${r.zones.map((v, j) => v ? `<i class="sz${j + 1}" style="width:${v}%"></i>` : "").join("")}</div>`}</div>`).join("")}</div>${foot}`);
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
  function showCal(ci, scroll) {
    const c = CAL[ci];
    strip.querySelectorAll("button.cal").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.c === ci)));
    $("wPrev").disabled = ci === 0; $("wNext").disabled = ci === CAL.length - 1;
    $("wWeek").hidden = !c.data; $("wPlan").hidden = !!c.data;
    if (c.data) showWeek(c.idx); else { cancelAnimationFrame(raf); slides.forEach(s => s.querySelector("video")?.pause()); showPlan(ci); }
    if (history.replaceState) history.replaceState(null, "", `#week-${c.wk}`);
    if (scroll) $("wPanel").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const col = strip.querySelector(`[data-c="${ci}"]`).parentElement;
    strip.scrollTo({ left: Math.max(0, col.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + col.offsetWidth / 2), behavior: reduce ? "auto" : "smooth" });
    sel = ci;
  }
  function showWeek(i) {
    const w = WEEKS[i];
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
        <span class="r-h"><b>${SOORT[r.soort] || r.soort}${r.blokken ? ` <span class="r-bl">${r.blokken.length} ${t("blokken", "blocks")}</span>` : ""}</b><span>${n1(r.km)} km · ${hm(r.min)} ${t("uur", "h")} · ${n1(r.km / r.min * 60)} ${t("km/u", "km/h")}${r.binnen ? t(" · binnen", " · indoor") : t(" · buiten", " · outdoor")}</span></span>
        ${r.blokken ? `<span class="blocks">${r.blokken.map((b, k) => `<span class="blk" style="flex:${b.km}"><span class="zbar">${b.zones.map((v, j) => v ? `<i class="z${j + 1}" style="width:${v}%"></i>` : "").join("")}</span><small>${t("Blok", "Block")} ${k + 1} · ${n1(b.km)} km</small></span>`).join('<span class="pause" aria-hidden="true"></span>')}</span>`
          : `<span class="zbar">${r.zones.map((v, j) => v ? `<i class="z${j + 1}" style="width:${v}%"></i>` : "").join("")}</span>`}
        <span class="r-more">${r.zones.map((v, j) => v ? `<span>Z${j + 1} <b>${hm(r.min * v / 100)}</b> (${v}%)</span>` : "").join("")}</span>
        </button></li>`).join("") : "";
    $("wRides").hidden = !w.ritten.length;
    $("wBlocks").hidden = !w.ritten.some(r => r.blokken);
    $("wBlocks").innerHTML = t("<b>Waarom in blokken?</b> Een etappe van rond de 200 km rijdt Warren straks ook in blokken, met korte pauzes om te eten en bij te komen. Zo train je het lijf op dag na dag ver fietsen.",
      "<b>Why in blocks?</b> In May, Warren will ride each stage of around 200 km in blocks too, with short breaks to eat and recover. That trains the body for long distances day after day.");
    $("wRides").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { const li = b.parentElement, o = !li.classList.contains("open"); li.classList.toggle("open", o); b.setAttribute("aria-expanded", String(o)); }));
    buildStory(i);
  }
  let sel = 0;
  strip.addEventListener("click", e => { const b = e.target.closest("button.cal"); if (b) showCal(+b.dataset.c); });
  $("wPrev").addEventListener("click", () => sel > 0 && showCal(sel - 1));
  $("wNext").addEventListener("click", () => sel < CAL.length - 1 && showCal(sel + 1));
  const lastData = CAL.findIndex(c => c.data === W[W.length - 1]);
  const fromHash = CAL.findIndex(c => location.hash === `#week-${c.wk}`);
  showCal(fromHash >= 0 ? fromHash : lastData);
  // ── Evenementenkalender ──────────────────────────────────────────────────
  const evEl = $("tEvents");
  if (evEl) {
    const now = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    evEl.innerHTML = EV.map(e => {
      const past = (e.end || e.d) < now;
      const day = e.datum ? String(e.d.getUTCDate()) : t("wk", "wk") + " " + e.wk;
      const link = e.link ? (e.link.startsWith("/") ? L(e.link) : e.link) : "";
      return `<li class="ev${past ? " past" : ""}">
        <div class="ev-date"><span class="ev-day">${day}</span><span class="ev-mon">${e.d.toLocaleDateString(WIM_LOC, { month: "short", timeZone: "UTC" }).replace(".", "")} ${e.d.getUTCFullYear()}</span></div>
        <div class="ev-body"><div class="ev-meta">${tt(e.soort)}${e.voorbehoud ? ` · ${t("onder voorbehoud", "to be confirmed")}` : ""}</div>
          <h3>${tt(e.titel)}</h3><p class="ev-where">${evDate(e)} · ${tt(e.plek)}</p><p>${tt(e.tekst)}</p>
          ${e.partner ? `<p class="ev-partner">${t("Samen met", "Together with")} <b>${esc(e.partner)}</b></p>` : ""}
          ${link ? `<a class="more" href="${link}"${link.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${e.meedoen ? t("Doe mee", "Join in") : t("Meer info", "More info")}</a>` : ""}</div></li>`;
    }).join("");
  }
  const vid = $("tVid");
  if (vid) { if (reduce) vid.controls = true; else new IntersectionObserver(es => { es[0].isIntersecting ? vid.play().catch(() => {}) : vid.pause(); }, { threshold: .3 }).observe(vid); }
  if ($("tUpd")) $("tUpd").textContent = t(`Bijgewerkt op ${WIM_DATE(T.updated)}.`, `Updated ${WIM_DATE(T.updated)}.`);
})();
