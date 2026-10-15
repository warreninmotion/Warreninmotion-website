// Kaart, stand, rekenhulp, shirt en volgbus. Gedeeld door /tussenstand/ en /sponsoren/.
// De echte stand komt uit data.js (afgeleid uit HubSpot). CUR is wat er nu getoond wordt.
const DATA = Object.assign({
  updated: "", donateUrl: WIM_SITE.donateUrl,
  pelotonEuro: 0, eindsprint: 0, diner: 0, tenue: {}, sponsors: [],
}, window.WIM_DATA || {});
let CUR = DATA;
// Pakketnaam uit data.js ("Vrije kilometers · €1.000") in de huidige taal
const pakketTxt = p => t(p, (p || "").replace("Vrije kilometers", "Kilometres").replace("Hoofdsponsor", "Main sponsor").replace(/€([\d.]+)/, (m, n) => eur(+n.replace(/\./g, ""))));
const $ = id => document.getElementById(id);
const on = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

// Route, kaart en landen komen uit /assets/route.js; alle km zijn echte GPX-km.
const TOTAL = ROUTE_KM, REAL = ROUTE_KM;
const GOALS = WIM_SITE.goals;

function render() {
  if (!$("map")) return;
  const st = CUR;
  const sponsors = st.sponsors;
  const sKm = sponsors.reduce((s, x) => s + x.km, 0);
  const pKm = st.pelotonEuro / 20;
  const totKm = Math.min(TOTAL, sKm + pKm);
  const totEur = sKm * 20 + st.pelotonEuro;

  // kaart
  const svg = document.getElementById("map");
  svg.setAttribute("viewBox", `0 0 ${W.toFixed(0)} ${H.toFixed(0)}`);
  svg.innerHTML = "";
  if (LAND) svg.append(el("path", { d: LAND, fill: "var(--land)", "fill-rule": "evenodd", stroke: "none" }));
  if (BORDERS) svg.append(el("path", { d: BORDERS, fill: "none", stroke: "var(--border)", "stroke-width": 1.4, "stroke-linejoin": "round" }));
  const countries = [["ITALIË",44.62,10.0],["ZWITSERLAND",46.22,10.05],["FRANKRIJK",48.2,6.62],["DUITSLAND",49.5,8.95],["LUXEMBURG",49.8,6.95],["BELGIË",50.6,4.75],["NEDERLAND",51.33,4.55]];
  for (const [n, la, lo] of countries) { const [x, y] = xy(la, lo); svg.append(el("text", { x, y, "text-anchor": "middle", "font-size": 13, "letter-spacing": 3, fill: "var(--muted)", opacity: .7 }, n)); }

  svg.append(el("path", { d: path(0, TOTAL), fill: "none", stroke: "var(--empty)", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "2 7" }));
  // eindsprint: Den Bosch tot de finish
  svg.append(el("path", { d: path(SPRINT_KM, REAL), fill: "none", stroke: "var(--fg)", "stroke-width": 16, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: .12 }));
  const riders = Math.min(st.eindsprint || 0, SPRINT);
  let km = 0;
  sponsors.forEach((s, i) => {
    const e = Math.min(TOTAL, km + s.km);
    svg.append(el("path", { d: path(km, e), fill: "none", stroke: i % 2 ? "var(--seg2)" : "var(--seg1)", "stroke-width": 10, "stroke-linejoin": "round", class: "seg", "data-i": i }));
    km = e;
  });
  if (pKm > 0) svg.append(el("path", { d: path(km, Math.min(TOTAL, km + pKm)), fill: "none", stroke: "var(--brons)", "stroke-width": 10, "stroke-linejoin": "round", class: "seg", "data-i": "p" }));
  km = 0;
  sponsors.forEach((s, i) => { if (i) { const [x, y] = at(km); svg.append(el("circle", { cx: x, cy: y, r: 3.2, fill: "var(--bg)" })); } km += s.km; });
  // meefietsers van de eindsprint: een stip per aanmelding, naast de route
  for (let r = 0; r < riders; r++) {
    const k = SPRINT_KM + (REAL - SPRINT_KM) * (r + .5) / SPRINT, p = at(k), a = at(k - 2), b = at(k + 2);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, side = r % 2 ? 1 : -1;
    svg.append(el("circle", { cx: p[0] - (b[1] - a[1]) / L * 11 * side, cy: p[1] + (b[0] - a[0]) / L * 11 * side, r: 3, fill: "var(--fg)" }));
  }

  // plaatsen
  const towns = { "Lucca": "r", "Novi Ligure": "l", "Locarno": "l", "Lukmanier": "l", "Sargans": "r", "Mulhouse": "r", "Bad Bergzabern": "r", "Arlon": "l", "Lommel": "r", "Den Bosch": "l", "Veenendaal": "r" };

  // kilometerstreepjes: elke 50 km een streepje, elke 100 km een getal aan de vrije kant
  const avoid = [];
  for (const q of pts) if (towns[q.name]) {
    const r = towns[q.name] === "r", n = q.name === "Lukmanier" ? 17 : q.name.length, w = n * 9;
    for (let f = 0; f <= 1; f += .25) avoid.push({ p: [q.p[0] + (r ? 1 : -1) * (12 + w * f), q.p[1]], k: -999 });
  }
  [[7500, "r", 140], [15000, "l", 130], [30000, "r", 170]].forEach(([e, s, w]) => { const [x, y] = at(e / 20); for (let f = 0; f <= 1; f += .25) avoid.push({ p: [x + (s === "r" ? 1 : -1) * (16 + w * f), y + 10], k: -999 }); });
  for (const [n, la, lo] of countries) { const [x, y] = xy(la, lo), w = n.length * 11; for (let f = -.5; f <= .5; f += .25) avoid.push({ p: [x + w * f, y - 5], k: -999 }); }
  for (let k = 0; k <= REAL; k += 8) avoid.push({ p: at(k), k });
  for (let k = 50; k < REAL - 20; k += 50) {
    const p = at(k), a = at(k - 4), b = at(k + 4);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
    const major = k % 100 === 0, h = major ? 9 : 6;
    svg.append(el("line", { x1: p[0] - nx * h, y1: p[1] - ny * h, x2: p[0] + nx * h, y2: p[1] + ny * h, stroke: "var(--fg)", "stroke-width": major ? 1.8 : 1.2, opacity: major ? .75 : .45 }));
    if (!major || k === 1500) continue;
    let best = null;
    for (const s of [1, -1]) {
      const q = [p[0] + nx * s * 24, p[1] + ny * s * 24];
      const d = Math.min(...avoid.filter(v => Math.abs(v.k - k) > 30).map(v => Math.hypot(v.p[0] - q[0], v.p[1] - q[1])));
      if (!best || d > best.d) best = { d, q, s };
    }
    const dirx = nx * best.s, anchor = dirx > .35 ? "start" : dirx < -.35 ? "end" : "middle";
    svg.append(el("text", { x: best.q[0] - (anchor === "start" ? 6 : anchor === "end" ? -6 : 0), y: best.q[1] + 5, "text-anchor": anchor, "font-size": 14, fill: "var(--muted)", "font-variant-numeric": "tabular-nums" }, nl(k)));
  }
  for (const q of pts) if (towns[q.name]) {
    const [x, y] = q.p, r = towns[q.name] === "r";
    const pass = q.name === "Lukmanier", start = q.name === "Den Bosch";
    svg.append(el("circle", { cx: x, cy: y, r: pass ? 3 : 4.5, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 2 }));
    svg.append(el("text", { x: x + (r ? 12 : -12), y: y + 6, "text-anchor": r ? "start" : "end", "font-size": 18, fill: "var(--fg)", "font-style": pass ? "italic" : "normal" }, pass ? t("Lukmanier 1.915 m", "Lukmanier 1,915 m") : q.name));
  }
  // doelen op de route
  const goalSide = [{ s: "r", dy: 6 }, { s: "l", dy: 20 }, { s: "r", dy: 14 }];
  GOALS.forEach((g, i) => {
    const [x, y] = at(g.eur / 20), o = goalSide[i], r = o.s === "r";
    const reached = totEur >= g.eur;
    svg.append(el("circle", { cx: x, cy: y, r: 9, fill: reached ? "var(--fg)" : "var(--bg)", stroke: "var(--fg)", "stroke-width": 2 }));
    svg.append(el("text", { x: x + (r ? 16 : -16), y: y + o.dy, "text-anchor": r ? "start" : "end", "font-size": 15, "font-weight": 600, fill: "var(--fg)" }, `${g.label} · ${eur(g.eur)}`));
  });
  const [fx, fy] = pts[pts.length - 1].p;
  svg.append(el("text", { x: fx + 12, y: fy + 25, "font-size": 13, fill: "var(--muted)" }, `Finish · km ${nl(ROUTE_KM)}`));
  svg.append(el("text", { x: fx + 12, y: fy + 42, "font-size": 13, fill: "var(--muted)" }, t(`Eindsprint · ${riders} van ${SPRINT} plekken`, `Final sprint · ${riders} of ${SPRINT} places`)));

  svg.querySelectorAll(".seg").forEach(p => {
    p.addEventListener("mouseenter", () => hl(p.dataset.i));
    p.addEventListener("mouseleave", () => hl(null));
    p.addEventListener("click", () => { sel = sel === p.dataset.i ? null : p.dataset.i; hl(null); });
  });

  // stand
  document.getElementById("km").textContent = nl(totKm);
  document.getElementById("eur").innerHTML = t(`<b>${eur(totEur)}</b> opgehaald · ${nl(sKm)} km van bedrijven, ${nl(pKm)} km van het peloton`, `<b>${eur(totEur)}</b> raised · ${nl(sKm)} km from companies, ${nl(pKm)} km from the peloton`);
  const bar = document.getElementById("bar");
  bar.innerHTML = `<div class="f" style="width:${sKm / TOTAL * 100}%"></div><div class="p" style="left:${sKm / TOTAL * 100}%;width:${pKm / TOTAL * 100}%;${sKm ? "" : "border-radius:999px 0 0 999px;"}${totKm >= TOTAL ? "border-radius:0 999px 999px 0" : ""}"></div>` +
    GOALS.map((g, i) => `<div class="tick${i === 2 ? " end" : ""}" style="left:calc(${g.eur / 20 / TOTAL * 100}% - ${i === 2 ? 2 : 1}px)"><span>${eur(g.eur)}</span></div>`).join("");
  const nxt = GOALS.find(g => totEur < g.eur);
  document.getElementById("next").innerHTML = nxt
    ? t(`Op naar <b>${nxt.label.toLowerCase()}: ${eur(nxt.eur)}</b>. Nog ${nl((nxt.eur - totEur) / 20)} km te gaan.`, `Next up: <b>${nxt.label.toLowerCase()}, ${eur(nxt.eur)}</b>. ${nl((nxt.eur - totEur) / 20)} km to go.`)
    : t(`<b>De hele route is gevuld!</b> Dank je wel, iedereen die meerijdt.`, `<b>The whole route is filled!</b> Thank you to everyone riding along.`);
  document.getElementById("sprint").innerHTML = st.eindsprint || st.diner
    ? t(`Eindsprint: <b>${st.eindsprint} van ${SPRINT} plekken bezet</b>, en ${st.diner} ${st.diner === 1 ? "gast" : "gasten"} aan tafel bij het diner.`, `Final sprint: <b>${st.eindsprint} of ${SPRINT} places taken</b>, and ${st.diner} ${st.diner === 1 ? "guest" : "guests"} at the dinner table.`)
    : t(`Eindsprint: alle 50 plekken nog vrij. Fiets mee van Den Bosch naar Veenendaal!`, `Final sprint: all 50 places still open. Ride with us from Den Bosch to Veenendaal!`);

  // lijst
  const list = document.getElementById("list");
  list.innerHTML = "";
  km = 0;
  if (!sponsors.length) list.insertAdjacentHTML("beforeend", `<div class="empty">${t("Nog geen bedrijven. Rij jij als eerste weg vanuit Lucca, bij km 0?", "No companies yet. Will you be the first to roll out of Lucca, at km 0?")}</div>`);
  sponsors.forEach((s, i) => {
    const a = km; km += s.km;
    list.insertAdjacentHTML("beforeend", `<div class="row" tabindex="0" data-i="${i}"><span class="sw" style="background:var(${i % 2 ? "--seg2" : "--seg1"})"></span><div class="n"><div></div><div>${pakketTxt(s.pakket)}</div></div><div class="k">km ${nl(a)}–${nl(km)}</div></div>`);
    const nm = list.lastElementChild.querySelector(".n div");
    nm.textContent = s.name || t("Anonieme sponsor", "Anonymous sponsor");
    if (!s.name) { nm.style.fontStyle = "italic"; nm.style.fontWeight = "400"; }
  });
  list.insertAdjacentHTML("beforeend", `<div class="row" tabindex="0" data-i="p"><span class="sw" style="background:var(--brons)"></span><div class="n"><div>${t("Het peloton", "The peloton")}</div><div>${st.pelotonEuro ? eur(st.pelotonEuro) + t(" van alle particuliere vrienden van de tocht", " from all private friends of the ride") : t("Word de eerste particuliere vriend van de tocht.", "Be the first private friend of the ride.")}</div></div><div class="k">${pKm ? nl(pKm) + " km" : "–"}</div></div>`);
  list.querySelectorAll(".row").forEach(r => {
    r.addEventListener("mouseenter", () => hl(r.dataset.i)); r.addEventListener("mouseleave", () => hl(null));
    r.addEventListener("click", () => { sel = sel === r.dataset.i ? null : r.dataset.i; hl(null); });
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.click(); } });
  });
  // bereik per stuk, voor de naam op de kaart
  RANGES = {}; km = 0;
  sponsors.forEach((s, i) => { RANGES[i] = [km, km + s.km, s.name || t("Anonieme sponsor", "Anonymous sponsor")]; km += s.km; });
  if (pKm > 0) RANGES.p = [km, km + pKm, t("Het peloton", "The peloton")];
  hl(null);

  // doneerknop en voetregel
  if ($("donate")) $("donate").innerHTML = DATA.donateUrl
    ? `<a href="${DATA.donateUrl}" target="_blank" rel="noopener">${t("Doneer nu", "Donate now")}</a>`
    : `<span class="off">${t("Doneerlink volgt", "Donation link coming soon")}</span>`;
  if ($("foot")) $("foot").textContent = t(`Bijgewerkt op ${WIM_DATE(DATA.updated)}. Donaties tellen we elke week bij. Alle kilometers zijn echte kilometers van de route (${nl(ROUTE_KM)} km). Vanaf Den Bosch rijden de meefietsers van de eindsprint mee.`, `Updated ${WIM_DATE(DATA.updated)}. Donations are added every week. Every kilometre is a real kilometre of the route (${nl(ROUTE_KM)} km). From Den Bosch, the final-sprint riders join in.`);
}
let sel = null, RANGES = {};
function hl(i) {
  const k = i == null ? sel : String(i);
  document.querySelectorAll(".seg").forEach(p => p.classList.toggle("on", p.dataset.i === k));
  document.querySelectorAll(".row").forEach(r => r.classList.toggle("on", r.dataset.i === k));
  const svg = document.getElementById("map");
  svg.querySelector("#callout")?.remove();
  const rg = k != null && RANGES[k];
  if (!rg) return;
  const [x, y] = at((rg[0] + rg[1]) / 2), left = x > W * .55;
  const g = el("g", { id: "callout", "pointer-events": "none" });
  g.append(el("line", { x1: x, y1: y, x2: x + (left ? -26 : 26), y2: y, stroke: "var(--fg)", "stroke-width": 1.5 }));
  g.append(el("text", { x: x + (left ? -32 : 32), y: y + 7, "text-anchor": left ? "end" : "start", "font-size": 21, "font-weight": 700, fill: "var(--fg)", stroke: "var(--bg)", "stroke-width": 6, "paint-order": "stroke", "stroke-linejoin": "round" }, rg[2]));
  svg.append(g);
}

// ── Tenue: sponsorplekken ───────────────────────────────────────────────────
const MAIL = "warreninmotion@outlook.com";
const PRICE = { hoofd: 1000, middel: 500, klein: 250 };
const SIZE = { hoofd: t("Hoofdsponsor", "Main sponsor"), middel: t("Middel", "Medium"), klein: t("Klein", "Small") };
// Plekken op het echte Owayo-ontwerp; x, y, w, h in procenten van de foto.
// Geel = hoofdsponsor (borst, bovenrug en beide zijkanten), grijs = vrije logoplekken.
const VIEWS = { voor: { img: "/assets/img/shirt-voor.webp", w: 1064, h: 1143, alt: t("voorkant", "front") },
  achter: { img: "/assets/img/shirt-achter.webp", w: 1025, h: 1233, alt: t("achterkant", "back") },
  links: { img: "/assets/img/shirt-links.webp", w: 670, h: 1197, alt: t("linkerzijkant", "left side") },
  rechts: { img: "/assets/img/shirt-rechts.webp", w: 687, h: 1181, alt: t("rechterzijkant", "right side") } };
const KIT = [
  { id: "hoofd", label: t("Hoofdsponsor", "Main sponsor"), size: "hoofd", where: t("borst, bovenrug en beide zijkanten", "chest, upper back and both sides"), spots: [
    { view: "voor", x: 34.7, y: 31.5, w: 29.5, h: 16.8 }, { view: "achter", x: 36.3, y: 20.6, w: 30.7, h: 15.9 },
    { view: "links", x: 44.5, y: 57.9, w: 10, h: 18.7 }, { view: "rechts", x: 40.6, y: 56.6, w: 10.3, h: 19.3 } ] },
  { id: "rug1", label: t("Rug, bovenste balk", "Back, upper bar"), size: "middel", where: t("rug", "back"), spots: [{ view: "achter", x: 36.6, y: 38.4, w: 29.6, h: 7.4 }] },
  { id: "rug2", label: t("Rug, onderste balk", "Back, lower bar"), size: "middel", where: t("rug", "back"), spots: [{ view: "achter", x: 36.8, y: 47.4, w: 29, h: 7.3 }] },
  { id: "borst1", label: t("Voorkant, balk 1", "Front, bar 1"), size: "middel", where: t("voorkant", "front"), spots: [{ view: "voor", x: 35.4, y: 50.6, w: 27.8, h: 7.6 }] },
  { id: "borst2", label: t("Voorkant, balk 2", "Front, bar 2"), size: "middel", where: t("voorkant", "front"), spots: [{ view: "voor", x: 35.5, y: 61.3, w: 27.6, h: 7.6 }] },
  { id: "borst3", label: t("Voorkant, balk 3", "Front, bar 3"), size: "middel", where: t("voorkant", "front"), spots: [{ view: "voor", x: 36, y: 71.7, w: 27.1, h: 7.6 }] },
  { id: "zak1", label: t("Achterzak links", "Back pocket left"), size: "klein", where: t("achterkant en linkerzij", "back and left side"), spots: [{ view: "achter", x: 27.3, y: 72.1, w: 14.2, h: 13.4 }, { view: "links", x: 62.7, y: 72.9, w: 9.9, h: 13.2 }] },
  { id: "zak2", label: t("Achterzak midden", "Back pocket centre"), size: "klein", where: t("achterkant", "back"), spots: [{ view: "achter", x: 43.4, y: 72.1, w: 16.4, h: 13.3 }] },
  { id: "zak3", label: t("Achterzak rechts", "Back pocket right"), size: "klein", where: t("achterkant en rechterzij", "back and right side"), spots: [{ view: "achter", x: 62.2, y: 72.2, w: 14.3, h: 13.5 }, { view: "rechts", x: 23.5, y: 71, w: 9.4, h: 13 }] },
  { id: "mouwL1", label: t("Linkermouw boven", "Left sleeve, top"), size: "klein", where: t("linkermouw", "left sleeve"), spots: [{ view: "links", x: 43.6, y: 26.1, w: 14.6, h: 6.8 }] },
  { id: "mouwL2", label: t("Linkermouw onder", "Left sleeve, bottom"), size: "klein", where: t("linkermouw", "left sleeve"), spots: [{ view: "links", x: 45, y: 34.5, w: 13.4, h: 6.3 }] },
  { id: "mouwR1", label: t("Rechtermouw boven", "Right sleeve, top"), size: "klein", where: t("rechtermouw", "right sleeve"), spots: [{ view: "rechts", x: 36.5, y: 23.2, w: 15.2, h: 6.4 }] },
  { id: "mouwR2", label: t("Rechtermouw onder", "Right sleeve, bottom"), size: "klein", where: t("rechtermouw", "right sleeve"), spots: [{ view: "rechts", x: 36.5, y: 31.4, w: 14.4, h: 6 }] },
];
const viewsOf = k => k.spots.map(q => q.view);
let C = { ink: "#F2EEE4" }; // kleur van het monogram op de volgbus
const MONO = window.WIM_MONO;
function mono(svg, cx, cy, w) {
  const h = w * 141.8 / 294.8, m = el("svg", { x: cx - w / 2, y: cy - h / 2, width: w, height: h, viewBox: "273.3 154.1 294.8 141.8", style: `color:${C.ink}`, overflow: "visible" });
  m.innerHTML = MONO; svg.append(m);
}
// Vlaggetjes: Italië (start) en Nederland (finish)
function flag(g, x, y, w, h, c) {
  const cols = c === "it" ? ["#009246", "#FFFFFF", "#CE2B37"] : ["#AE1C28", "#FFFFFF", "#21468B"];
  cols.forEach((col, i) => g.append(el("rect", c === "it"
    ? { x: x + i * w / 3, y, width: w / 3 + .2, height: h, fill: col }
    : { x, y: y + i * h / 3, width: w, height: h / 3 + .2, fill: col })));
  g.append(el("rect", { x, y, width: w, height: h, fill: "none", stroke: "rgba(0,0,0,.25)", "stroke-width": .4 }));
}
// Nep-logo voor bezette plekken: initialen in een eigen vorm en kleur
const LOGO_COL = ["#2B4C7E", "#9E3B2A", "#2E7A74", "#6B4E8C", "#B07A1E", "#3C6E3A"];
function logo(g, name, cx, cy, w, h) {
  const words = name.split(/\s+/).filter(Boolean);
  const ini = (words.length > 1 ? words.map(x => x[0]).join("") : name.slice(0, 2)).slice(0, 3).toUpperCase();
  let hsh = 0; for (const ch of name) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const col = LOGO_COL[hsh % LOGO_COL.length], shape = hsh % 3, mh = h * .72;
  if (w / h >= 2.6) {
    const pw = Math.min(w * .72, mh * (1.2 + ini.length * .55));
    g.append(el("rect", { x: cx - pw / 2, y: cy - mh / 2, width: pw, height: mh, rx: shape === 0 ? mh / 2 : shape === 1 ? 3 : mh * .25, fill: col }));
    g.append(el("text", { x: cx, y: cy + mh * .2, "text-anchor": "middle", "font-size": mh * .56, "font-weight": 700, "letter-spacing": mh * .08, fill: "#fff", "font-family": shape === 2 ? "var(--display)" : "var(--body)" }, ini));
  } else {
    const r = mh / 2;
    if (shape === 1) g.append(el("rect", { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, rx: 3, fill: col }));
    else g.append(el("circle", { cx, cy, r, fill: col }));
    g.append(el("text", { x: cx, y: cy + r * .36, "text-anchor": "middle", "font-size": r * (ini.length > 2 ? .78 : .95), "font-weight": 700, fill: "#fff" }, ini));
  }
}
const priceTxt = s => s.size === "hoofd" ? t("op aanvraag", "on request") : eur(PRICE[s.size]);
let kitView = "voor", kitSel = null;
const kitState = id => (CUR.tenue || {})[id] || { status: "vrij" };
const SVGNS = "http://www.w3.org/2000/svg";
const stTxt = st => st.status === "vrij" ? t("vrij", "available") : st.status === "optie" ? t("in optie", "on hold") : t("bezet", "taken");

function drawKit() {
  const v = VIEWS[kitView], shot = $("kitShot"), img = $("kitImg");
  // alle kanten even hoog, zodat de pagina niet verspringt bij het draaien
  const H = Math.min(500, $("kitStage").clientWidth * VIEWS.voor.h / VIEWS.voor.w);
  shot.style.height = `${Math.round(H)}px`;
  shot.style.width = `${Math.round(H * v.w / v.h)}px`;
  if (!img.src.endsWith(v.img)) img.src = v.img;
  img.width = v.w; img.height = v.h;
  img.alt = t(`Shirt Warren in Motion, ${v.alt}, met de sponsorplekken`, `Warren in Motion jersey, ${v.alt}, with the sponsor spots`);
  shot.querySelectorAll(".spot").forEach(n => n.remove());
  for (const s of KIT) for (const q of s.spots.filter(q => q.view === kitView)) {
    const st = kitState(s.id), pw = q.w * v.w / 100, ph = q.h * v.h / 100, tall = ph > pw * 1.4;
    const b = document.createElement("button");
    b.type = "button";
    b.className = `spot ${st.status}${tall ? " tall" : ""}${kitSel === s.id ? " on" : ""}`;
    b.style.cssText = `left:${q.x}%;top:${q.y}%;width:${q.w}%;height:${q.h}%`;
    b.setAttribute("aria-label", `${s.label}, ${priceTxt(s)}, ${stTxt(st)}`);
    if (st.status === "bezet" && st.sponsor) {
      const svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", `0 0 ${pw} ${ph}`);
      const g = el("g", tall ? { transform: `rotate(-90 ${pw / 2} ${ph / 2})` } : {});
      if (tall) logo(g, st.sponsor, pw / 2, ph / 2, ph * .8, pw * .9); else logo(g, st.sponsor, pw / 2, ph / 2, pw * .9, ph * .9);
      svg.append(g); b.append(svg);
    } else {
      const sp = document.createElement("span");
      sp.textContent = st.status === "bezet" ? t("Bezet", "Taken") : st.status === "optie" ? t("optie", "on hold") : s.size === "hoofd" ? (tall ? t("Hoofd", "Main") : t("Hoofdsponsor", "Main sponsor")) : eur(PRICE[s.size]);
      b.append(sp);
    }
    b.addEventListener("click", () => { kitSel = kitSel === s.id ? null : s.id; renderKit(); });
    shot.append(b);
  }
}

function renderKit() {
  document.querySelectorAll(".kit-views button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.view === kitView)));
  drawKit();
  const chip = st => `<span class="chip ${st.status}">${st.status === "vrij" ? t("Vrij", "Available") : st.status === "optie" ? t("In optie", "On hold") : t("Bezet", "Taken")}</span>`;
  const panel = $("kitPanel");
  const s = KIT.find(k => k.id === kitSel);
  const free = KIT.filter(k => k.size !== "hoofd" && kitState(k.id).status === "vrij").length;
  const nFree = KIT.filter(k => k.size !== "hoofd").length;
  if (!s) {
    panel.innerHTML = t(`<h3>Nog ${free} van ${nFree} logoplekken vrij</h3><p>Draai het shirt met de knoppen: voor, achter en beide zijkanten. Hoe beter een plek te zien is op de fiets, hoe hoger de prijs. De hoofdsponsor staat op de borst, de bovenrug en beide zijkanten. Een plek op het shirt kies je vanaf 50 kilometers. De opbrengst betaalt de shirts en de beplakking van de volgbus.</p>`,
      `<h3>${free} of ${nFree} logo spots available</h3><p>Turn the jersey with the buttons: front, back and both sides. The more visible a spot is on the bike, the higher the price. The main sponsor sits on the chest, upper back and both sides. You can pick a jersey spot from 50 kilometres. The proceeds pay for the jerseys and the follow van graphics.</p>`);
  } else {
    const st = kitState(s.id);
    const subj = encodeURIComponent(t(`Shirtplek: ${s.label}`, `Jersey spot: ${s.label}`));
    const what = s.size === "hoofd" ? t(`Op de ${s.where} · prijs op aanvraag`, `On the ${s.where} · price on request`) : t(`${eur(PRICE[s.size])} · zichtbaar op de ${s.where}`, `${eur(PRICE[s.size])} · visible on the ${s.where}`);
    let body = "";
    if (st.status === "vrij") body = `<p>${what}. ${t("Te kiezen vanaf 50 kilometers. Mail Warren en de plek is van jou.", "Available from 50 kilometres. Email Warren and the spot is yours.")}</p><div class="contact"><a href="mailto:${MAIL}?subject=${subj}">${t("Reserveer deze plek", "Reserve this spot")}</a><span class="addr">${MAIL}</span><button type="button" class="copy">${t("Kopieer", "Copy")}</button></div>`;
    else if (st.status === "optie") body = `<p>${what}. ${t("Iemand heeft een optie op deze plek. Mail Warren en hoor als eerste of hij vrijkomt.", "Someone has this spot on hold. Email Warren to be the first to know if it frees up.")}</p><div class="contact"><a href="mailto:${MAIL}?subject=${subj}">${t("Mail Warren", "Email Warren")}</a><span class="addr">${MAIL}</span><button type="button" class="copy">${t("Kopieer", "Copy")}</button></div>`;
    else body = `<p>${what}. ${t("Deze plek is bezet", "This spot is taken")}${st.sponsor ? t(" door ", " by ") : ""}<b></b>.</p>`;
    panel.innerHTML = `<h3>${s.label} ${chip(st)}</h3>${body}`;
    const b = panel.querySelector("p b"); if (b) b.textContent = st.sponsor || "";
    bindCopy(panel);
  }
  const list = $("kitList");
  list.innerHTML = "";
  KIT.forEach(k => {
    const st = kitState(k.id);
    list.insertAdjacentHTML("beforeend", `<div class="kit-row${kitSel === k.id ? " on" : ""}" tabindex="0" data-id="${k.id}"><span>${k.label} <span style="color:var(--muted)">· ${k.where}</span>${chip(st)}</span><span class="p">${priceTxt(k)}</span></div>`);
  });
  list.querySelectorAll(".kit-row").forEach(r => {
    const go = () => { const k = KIT.find(x => x.id === r.dataset.id); kitSel = k.id; if (!viewsOf(k).includes(kitView)) flipTo(viewsOf(k)[0]); else renderKit(); $("kitStage").scrollIntoView({ block: "nearest", behavior: "smooth" }); };
    r.addEventListener("click", go);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
}
function flipTo(view) {
  if (view === kitView) return;
  const stage = $("kitStage");
  stage.classList.add("flip");
  setTimeout(() => { kitView = view; renderKit(); stage.classList.remove("flip"); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200);
}
if ($("kitStage")) {
  // alvast laden, zodat draaien niet hapert
  Object.values(VIEWS).forEach(v => { const i = new Image(); i.src = v.img; });
  let kitW = 0;
  addEventListener("resize", () => { const w = $("kitStage").clientWidth; if (w !== kitW) { kitW = w; drawKit(); } });
}
// ── Volgbus ─────────────────────────────────────────────────────────────────
// Foto's van de Mercedes-Benz Citan (achtergrond verwijderd, assets/img/bus-zij.webp en bus-achter.webp),
// met de magneetpanelen als SVG erover. Coördinaten zijn pixels van de uitgesneden foto.
let busSide = "zij";
function busImg(svg, src, w, h) {
  svg.append(el("ellipse", { cx: w / 2, cy: h - 8, rx: w * .46, ry: 10, fill: "rgba(20,32,28,.22)", filter: "url(#busBlur)" }));
  const im = el("image", { x: 0, y: 0, width: w, height: h, preserveAspectRatio: "xMidYMid meet" });
  im.setAttribute("href", src); svg.append(im);
}
function busDefs(svg) {
  svg.insertAdjacentHTML("beforeend", `<defs><filter id="busBlur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="panelShadow" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#000" flood-opacity=".28"/></filter></defs>`);
}
function drawBusRear(svg) {
  // achteraanzicht 566 × 553, gecentreerd in een brede viewBox zodat de schaal past bij de zijkant
  svg.setAttribute("viewBox", "-330 -6 1226 565");
  busDefs(svg); busImg(svg, "/assets/img/bus-achter.webp", 566, 553);
  const A = (tag, a, t) => { const e = el(tag, a, t); svg.append(e); return e; };
  const TT = (x, y, s, t, a = {}) => A("text", { x, y, "font-size": s, "text-anchor": "middle", "font-family": "var(--body)", ...a }, t);
  const Z = { fill: "#F2EEE4" };
  // linkerdeur: veiligheid voor het verkeer achter de bus
  A("rect", { x: 100, y: 78, width: 222, height: 166, rx: 7, fill: "#1E4034", filter: "url(#panelShadow)" });
  TT(211, 100, 11, "Please keep your distance", { ...Z, "font-weight": 700 });
  const keep = C; C = { ...C, ink: "#F2EEE4" }; mono(svg, 211, 124, 46); C = keep;
  TT(211, 166, 22, "CYCLIST AHEAD", { ...Z, "font-family": "var(--display)", textLength: 186, lengthAdjust: "spacingAndGlyphs" });
  A("rect", { x: 193, y: 177, width: 36, height: 3, fill: "#C08A3E" });
  TT(211, 202, 17, "1,500 km", { ...Z, "font-family": "var(--display)" });
  TT(211, 222, 8.5, "LUCCA → VEENENDAAL", { ...Z, "letter-spacing": 1, opacity: .85 });
  flag(svg, 128, 215, 13, 9, "it"); flag(svg, 281, 215, 13, 9, "nl");
  // rechterdeur: doneren
  A("rect", { x: 342, y: 78, width: 132, height: 166, rx: 7, fill: "#F2EEE4", filter: "url(#panelShadow)" });
  A("rect", { x: 370, y: 88, width: 76, height: 76, fill: "#FFFFFF", stroke: "#D8D2C3" });
  for (const [x, y] of [[376, 94], [424, 94], [376, 142]]) A("rect", { x, y, width: 16, height: 16, fill: "none", stroke: "#14201C", "stroke-width": 4 });
  TT(408, 132, 8, "QR", { fill: "#8A918C", "font-weight": 700 });
  TT(408, 190, 17, "Scan & donate", { fill: "#1E4034", "font-family": "var(--display)" });
  TT(408, 207, 7.6, "for the Dutch Food Banks", { fill: "#1E4034" });
  TT(408, 228, 10, "@warreninmotion", { fill: "#1E4034", "font-weight": 700 });
  // kenteken: Warren in Motion met logo
  A("rect", { x: 143, y: 293, width: 174, height: 42, rx: 5, fill: "#F2EEE4", stroke: "#1E4034", "stroke-width": 3 });
  A("rect", { x: 146, y: 296, width: 34, height: 36, rx: 3, fill: "#1E4034" });
  const k2 = C; C = { ...C, ink: "#F2EEE4" }; mono(svg, 163, 314, 26); C = k2;
  TT(249, 319, 11.5, "WARREN IN MOTION", { fill: "#1E4034", "font-family": "var(--display)", "letter-spacing": .4, textLength: 118, lengthAdjust: "spacingAndGlyphs" });
}
function drawBus() {
  const svg = document.getElementById("busSvg"); svg.innerHTML = "";
  document.getElementById("busZij").setAttribute("aria-selected", busSide === "zij");
  document.getElementById("busAchter").setAttribute("aria-selected", busSide === "achter");
  if (busSide === "achter") return drawBusRear(svg);
  svg.setAttribute("viewBox", "0 -6 1223 532");
  busDefs(svg); busImg(svg, "/assets/img/bus-zij.webp", 1223, 514);
  const A = (tag, a, t) => { const e = el(tag, a, t); svg.append(e); return e; };
  const TT = (x, y, s, t, a = {}) => A("text", { x, y, "font-size": s, "text-anchor": "middle", ...a }, t);
  const Z = { fill: "#F2EEE4", "font-family": "var(--body)" };
  // paneel 1 (schuifdeur, boven de handgrepen): Warren in Motion
  A("rect", { x: 300, y: 50, width: 236, height: 176, rx: 7, fill: "#1E4034", filter: "url(#panelShadow)" });
  const keep = C; C = { ...C, ink: "#F2EEE4" }; mono(svg, 418, 76, 62); C = keep;
  TT(418, 112, 8.5, "WARREN IN MOTION", { ...Z, "letter-spacing": 2.2 });
  A("rect", { x: 400, y: 120, width: 36, height: 3, fill: "#C08A3E" });
  TT(418, 160, 38, "1,500 km", { ...Z, "font-family": "var(--display)" });
  TT(418, 182, 13.5, "Lucca → Veenendaal", { ...Z, "font-weight": 700 });
  flag(svg, 316, 173, 15, 10, "it"); flag(svg, 505, 173, 15, 10, "nl");
  TT(418, 200, 10, "Cycling for the Dutch Food Banks", Z);
  TT(418, 215, 8.5, "15–22 May 2027 · 7 countries · @warreninmotion", { ...Z, opacity: .85 });
  // paneel 2 (achter op de zijkant): hoofdsponsor
  const G = { fill: "#1E4034", "font-family": "var(--body)", "font-weight": 700, "text-anchor": "start" };
  A("rect", { x: 128, y: 62, width: 154, height: 128, rx: 7, fill: "#F2EEE4", filter: "url(#panelShadow)" });
  TT(140, 80, 7.5, "MAIN SPONSOR", { ...G, "letter-spacing": 1.8 });
  A("rect", { x: 140, y: 88, width: 130, height: 90, rx: 4, fill: "#FFFFFF", stroke: "#D8D2C3" });
  const hs = kitState("hoofd");
  if (hs.status === "bezet" && hs.sponsor) { const g = el("g", {}); logo(g, hs.sponsor, 205, 133, 90, 58); svg.append(g); }
  else TT(205, 137, 12, "Your logo here", { fill: "#8A918C", "font-family": "var(--body)" });
  // paneel 3 (schuifdeur, onder de handgrepen): alle bedrijven met kilometers
  A("rect", { x: 300, y: 270, width: 236, height: 112, rx: 7, fill: "#F2EEE4", filter: "url(#panelShadow)" });
  TT(312, 288, 7.5, "SUPPORTED BY", { ...G, "letter-spacing": 1.6 });
  const cos = CUR.sponsors.filter(s => s.name && s.name !== hs.sponsor);
  const max = 16, show = cos.slice(0, cos.length > max ? max - 1 : max);
  show.forEach((s, i) => { const g = el("g", {}); logo(g, s.name, 327 + (i % 8) * 26.5, 312 + Math.floor(i / 8) * 34, 22, 22); svg.append(g); });
  if (cos.length > max) TT(327 + 7 * 26.5, 352, 10, `+${cos.length - (max - 1)}`, { fill: "#1E4034", "font-weight": 700, "font-family": "var(--body)" });
  if (!cos.length) TT(418, 330, 11, "Your company here", { fill: "#8A918C", "font-family": "var(--body)" });
}

// ── Rekenhulp voor bedrijven ────────────────────────────────────────────────
const calc = { km: 50, seats: 1, kit: "" };
function renderCalc() {
  const km = calc.km, kmEur = km * 20, ok = km >= 50;
  document.getElementById("calcKmTxt").textContent = `${nl(km)} km`;
  document.getElementById("calcKmEur").textContent = eur(kmEur);
  document.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-checked", String(+b.dataset.seats === calc.seats)));
  const sel = document.getElementById("calcKit");
  const free = KIT.filter(k => k.size !== "hoofd" && kitState(k.id).status === "vrij");
  if (calc.kit && (!ok || !free.some(k => k.id === calc.kit))) calc.kit = "";
  sel.innerHTML = `<option value="">${t("Geen plek op het shirt", "No jersey spot")}</option>` + free.map(k => `<option value="${k.id}">${k.label} · ${eur(PRICE[k.size])}</option>`).join("");
  sel.value = calc.kit; sel.disabled = !ok;
  document.getElementById("calcKitHint").innerHTML = ok
    ? t(`Nog ${free.length} plekken vrij. <a class="inl" href="#tenue">Bekijk ze op het shirt</a>.`, `${free.length} spots available. <a class="inl" href="#tenue">See them on the jersey</a>.`)
    : t(`Schuif naar 50 km of meer en kies een plek op het shirt.`, `Slide to 50 km or more to pick a jersey spot.`);
  const k = KIT.find(x => x.id === calc.kit), kitEur = k ? PRICE[k.size] : 0, seatEur = calc.seats * 100;
  const lines = [[`${nl(km)} km × €20`, kmEur], [t(`${calc.seats} ${calc.seats > 1 ? "plekken" : "plek"} aan tafel`, `${calc.seats} ${calc.seats > 1 ? "seats" : "seat"} at the dinner`), seatEur]];
  if (k) lines.push([t(`Shirt: ${k.label}`, `Jersey: ${k.label}`), kitEur]);
  document.getElementById("calcLines").innerHTML = lines.map(([a, b]) => `<div><span>${a}</span><span>${eur(b)}</span></div>`).join("");
  const total = kmEur + seatEur + kitEur;
  document.getElementById("calcTotal").textContent = eur(total);
  const subj = `Sponsoring: ${nl(km)} km${k ? " + " + k.label : ""}`;
  const body = t(`Hoi Warren,\n\nWe rijden graag mee:\n- ${nl(km)} km (${eur(kmEur)})\n- ${calc.seats} ${calc.seats > 1 ? "plekken" : "plek"} aan tafel bij het diner (${eur(seatEur)})\n${k ? `- Shirtplek: ${k.label} (${eur(kitEur)})\n` : ""}Totaal: ${eur(total)}\n\nBedrijfsnaam:\nContactpersoon:\n`, `Hi Warren,\n\nWe would love to ride along:\n- ${nl(km)} km (${eur(kmEur)})\n- ${calc.seats} ${calc.seats > 1 ? "seats" : "seat"} at the dinner (${eur(seatEur)})\n${k ? `- Jersey spot: ${k.label} (${eur(kitEur)})\n` : ""}Total: ${eur(total)}\n\nCompany name:\nContact person:\n`);
  document.getElementById("calcMail").href = `mailto:${MAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
}
on("calcKm", "input", e => { calc.km = +e.target.value; renderCalc(); });
document.querySelectorAll(".seg button[data-seats]").forEach(b => b.addEventListener("click", () => { calc.seats = +b.dataset.seats; renderCalc(); }));
on("calcKit", "change", e => { calc.kit = e.target.value; renderCalc(); });
on("busZij", "click", () => { busSide = "zij"; drawBus(); });
on("busAchter", "click", () => { busSide = "achter"; drawBus(); });
document.querySelectorAll(".kit-views button").forEach(b => b.addEventListener("click", () => flipTo(b.dataset.view)));
if ($("kitStage")) renderKit();
if ($("calcKm")) renderCalc();
if ($("busSvg")) drawBus();
render();
