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
  list.insertAdjacentHTML("beforeend", `<div class="row" tabindex="0" data-i="p"><span class="sw" style="background:var(--brons)"></span><div class="n"><div>Het peloton</div><div>${st.pelotonEuro ? eur(st.pelotonEuro) + " van alle particuliere vrienden van de tocht" : "Word de eerste particuliere vriend van de tocht."}</div></div><div class="k">${pKm ? nl(pKm) + " km" : "–"}</div></div>`);
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
const PRICE = { hoofd: 1000, groot: 750, middel: 500, klein: 250 };
const SIZE = { hoofd: t("Hoofdsponsor", "Main sponsor"), groot: t("Groot", "Large"), middel: t("Middel", "Medium"), klein: t("Klein", "Small") };
// Prijs naar zichtbaarheid op de fiets: van achteren (peloton, volgbus) en opzij (foto's).
// De hoofdsponsor heeft borst, bovenrug en beide zijkanten: altijd in beeld.
const KIT = [
  { id: "hoofd", label: t("Hoofdsponsor", "Main sponsor"), size: "hoofd", note: t("borst, bovenrug en beide zijkanten", "chest, upper back and both sides"), rects: [
    { side: "voor", x: 140, y: 96, w: 120, h: 58 },
    { side: "voor", x: 84, y: 178, w: 20, h: 130 }, { side: "voor", x: 296, y: 178, w: 20, h: 130 },
    { side: "achter", x: 130, y: 90, w: 140, h: 60 },
    { side: "achter", x: 84, y: 178, w: 20, h: 100 }, { side: "achter", x: 296, y: 178, w: 20, h: 100 } ] },
  { id: "mouwL", label: t("Linkermouw", "Left sleeve"), size: "middel", rects: [{ side: "voor", cx: 343, cy: 128, w: 52, h: 26, rot: 50 }] },
  { id: "mouwR", label: t("Rechtermouw", "Right sleeve"), size: "middel", rects: [{ side: "voor", cx: 57, cy: 128, w: 52, h: 26, rot: -50 }] },
  { id: "zak1", label: t("Achterzak links", "Back pocket left"), size: "klein", rects: [{ side: "achter", x: 112, y: 296, w: 48, h: 26 }] },
  { id: "zak2", label: t("Achterzak midden", "Back pocket centre"), size: "klein", rects: [{ side: "achter", x: 172, y: 296, w: 56, h: 26 }] },
  { id: "zak3", label: t("Achterzak rechts", "Back pocket right"), size: "klein", rects: [{ side: "achter", x: 240, y: 296, w: 48, h: 26 }] },
  { id: "buik", label: t("Buik", "Front, belly"), size: "klein", rects: [{ side: "voor", x: 150, y: 252, w: 100, h: 30 }] },
];
const sidesOf = k => [...new Set(k.rects.map(q => q.side))];
const KITCOL = {
  warren: { jersey: "#1E4034", trim: "#F2EEE4", shorts: "#14201C", line: "#2F5A4A", ink: "#F2EEE4", free: "rgba(242,238,228,.07)", taken: "#F2EEE4" },
  rijders: { jersey: "#F2EEE4", trim: "#1E4034", shorts: "#1E4034", line: "#C9C1AE", ink: "#1E4034", free: "rgba(30,64,52,.06)", taken: "#FFFFFF" },
};
let C = { ...KITCOL.warren, accent: "#C08A3E" }, kitCol = "warren";
// Monogram Warren in Motion (uit het vectorbestand van het brandbook)
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
const SIDE = { voor: t("voor", "front"), achter: t("achter", "back") };
let kitSide = "voor", kitSel = null;
const kitState = id => (CUR.tenue || {})[id] || { status: "vrij" };

function drawKit() {
  const svg = document.getElementById("kitSvg");
  svg.innerHTML = "";
  const body = "M140 42 Q200 74 260 42 L332 70 L392 150 L346 186 L320 160 L318 332 Q200 346 82 332 L80 160 L54 186 L8 150 L68 70 Z";
  svg.append(el("ellipse", { cx: 200, cy: 492, rx: 150, ry: 8, fill: "var(--line)" }));
  if (kitCol === "warren") { // alleen Warren rijdt in een eigen broek; meefietsers krijgen alleen het shirt
    svg.append(el("path", { d: "M92 338 L308 338 L318 470 L222 480 L200 402 L178 480 L82 470 Z", fill: C.shorts, stroke: C.jersey, "stroke-width": 1.5 }));
    svg.append(el("path", { d: "M82 470 L178 480 M222 480 L318 470", stroke: C.trim, "stroke-width": 5, fill: "none", opacity: .85 }));
  }
  svg.append(el("path", { d: body, fill: C.jersey, stroke: C.line, "stroke-width": 1.5 }));
  svg.append(el("path", { d: "M8 150 L54 186 M392 150 L346 186", stroke: C.trim, "stroke-width": 6, fill: "none" }));
  if (kitSide === "voor") {
    svg.append(el("path", { d: "M140 42 Q200 74 260 42 L252 35 Q200 62 148 35 Z", fill: C.trim }));
    mono(svg, 200, 200, 74);
  } else {
    svg.append(el("path", { d: "M146 40 Q200 50 254 40 L260 47 Q200 60 140 47 Z", fill: C.trim }));
    svg.append(el("path", { d: "M106 288 L294 288 M166 288 L166 334 M234 288 L234 334", stroke: C.trim, "stroke-width": 1.5, fill: "none", opacity: .5 }));
    mono(svg, 200, 198, 80);
    svg.append(el("text", { x: 200, y: 246, "text-anchor": "middle", "font-size": 12, "letter-spacing": 4, fill: C.ink, "font-family": "var(--display)" }, "WARREN IN MOTION"));
  }
  for (const s of KIT) for (const q of s.rects.filter(q => q.side === kitSide)) {
    const st = kitState(s.id), on = kitSel === s.id;
    const cx = q.cx ?? q.x + q.w / 2, cy = q.cy ?? q.y + q.h / 2, tall = q.h > q.w * 2;
    const onShorts = cy > 340, ink = onShorts ? "#F2EEE4" : C.ink, freeFill = onShorts ? "rgba(242,238,228,.07)" : C.free;
    const g = el("g", { class: "spot", tabindex: 0, role: "button", "aria-label": `${s.label}, ${priceTxt(s)}, ${st.status === "vrij" ? t("vrij", "available") : st.status === "optie" ? t("in optie", "on hold") : t("bezet", "taken")}`, transform: `rotate(${q.rot || 0} ${cx} ${cy})` });
    const r = el("rect", { x: cx - q.w / 2, y: cy - q.h / 2, width: q.w, height: q.h, rx: 4,
      fill: st.status === "bezet" ? C.taken : st.status === "optie" ? "rgba(192,138,62,.22)" : freeFill,
      stroke: on ? C.accent : st.status === "optie" ? C.accent : st.status === "bezet" && kitCol === "rijders" ? C.line : ink, "stroke-width": on ? 3.5 : st.status === "vrij" ? 1.5 : 2,
      "stroke-dasharray": st.status === "vrij" && !on ? "5 4" : "none" });
    g.append(r);
    if (st.status === "bezet" && st.sponsor) {
      if (tall) { const lg = el("g", { transform: `rotate(-90 ${cx} ${cy})` }); logo(lg, st.sponsor, cx, cy, q.h * .6, q.w); g.append(lg); }
      else logo(g, st.sponsor, cx, cy, q.w, q.h);
    } else {
      const txt = st.status === "bezet" ? "Bezet" : st.status === "optie" ? "in optie" : s.size === "hoofd" ? "Hoofdsponsor" : eur(PRICE[s.size]);
      const fs = tall ? Math.min(q.w * .5, 11) : Math.min(q.h * .42, 14);
      g.append(el("text", { x: cx, y: cy + fs * .36, "text-anchor": "middle", "font-size": fs, "font-weight": 600, fill: st.status === "bezet" ? "#1E4034" : ink, transform: tall ? `rotate(-90 ${cx} ${cy})` : "" }, txt));
    }
    const pick = () => { kitSel = kitSel === s.id ? null : s.id; renderKit(); };
    g.addEventListener("click", pick);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    svg.append(g);
  }
}

function renderKit() {
  document.getElementById("kitVoor").setAttribute("aria-selected", kitSide === "voor");
  document.getElementById("kitAchter").setAttribute("aria-selected", kitSide === "achter");
  drawKit();
  const chip = st => `<span class="chip ${st.status}">${st.status === "vrij" ? t("Vrij", "Available") : st.status === "optie" ? t("In optie", "On hold") : t("Bezet", "Taken")}</span>`;
  const panel = document.getElementById("kitPanel");
  const s = KIT.find(k => k.id === kitSel);
  const free = KIT.filter(k => kitState(k.id).status === "vrij").length;
  if (!s) {
    panel.innerHTML = t(`<h3>Nog ${free} van ${KIT.length} plekken vrij</h3><p>Hoe beter een plek te zien is op de fiets, van achteren en opzij, hoe hoger de prijs. De hoofdsponsor staat op de borst, de bovenrug en beide zijkanten. Een plek op het shirt kies je vanaf 50 kilometers. De opbrengst betaalt de shirts en de beplakking van de volgbus.</p>`, `<h3>${free} of ${KIT.length} places available</h3><p>The more visible a spot is on the bike, from behind and from the side, the higher the price. The main sponsor sits on the chest, upper back and both sides. You can pick a jersey spot from 50 kilometres. The proceeds pay for the jerseys and the follow van graphics.</p>`);
  } else {
    const st = kitState(s.id);
    const subj = encodeURIComponent(t(`Shirtplek: ${s.label}`, `Jersey spot: ${s.label}`));
    const sideTxt = sidesOf(s).length > 1 ? t("zijkant, zichtbaar voor en achter", "side, visible front and back") : sidesOf(s)[0] === "voor" ? t("voorkant", "front") : t("achterkant", "back");
    const what = s.size === "hoofd" ? t(`Op ${s.note} · prijs op aanvraag`, `On the ${s.note} · price on request`) : `${SIZE[s.size]} · ${eur(PRICE[s.size])} · ${sideTxt}`;
    let body = "";
    if (st.status === "vrij") body = `<p>${what}. ${t("Te kiezen vanaf 50 kilometers. Mail Warren en de plek is van jou.", "Available from 50 kilometres. Email Warren and the spot is yours.")}</p><div class="contact"><a href="mailto:${MAIL}?subject=${subj}">${t("Reserveer deze plek", "Reserve this spot")}</a><span class="addr">${MAIL}</span><button type="button" class="copy">${t("Kopieer", "Copy")}</button></div>`;
    else if (st.status === "optie") body = `<p>${what}. ${t("Iemand heeft een optie op deze plek. Mail Warren en hoor als eerste of hij vrijkomt.", "Someone has this spot on hold. Email Warren to be the first to know if it frees up.")}</p><div class="contact"><a href="mailto:${MAIL}?subject=${subj}">${t("Mail Warren", "Email Warren")}</a><span class="addr">${MAIL}</span><button type="button" class="copy">${t("Kopieer", "Copy")}</button></div>`;
    else body = `<p>${what}. ${t("Deze plek is bezet", "This spot is taken")}${st.sponsor ? t(" door ", " by ") : ""}<b></b>.</p>`;
    panel.innerHTML = `<h3>${s.label} ${chip(st)}</h3>${body}`;
    const b = panel.querySelector("p b"); if (b) b.textContent = st.sponsor || "";
    bindCopy(panel);
  }
  const list = document.getElementById("kitList");
  list.innerHTML = "";
  [...KIT].sort((a, b) => PRICE[b.size] - PRICE[a.size]).forEach(k => {
    const st = kitState(k.id);
    list.insertAdjacentHTML("beforeend", `<div class="kit-row${kitSel === k.id ? " on" : ""}" tabindex="0" data-id="${k.id}"><span>${k.label} <span style="color:var(--muted)">· ${sidesOf(k).map(x => SIDE[x]).join(" + ")}</span>${chip(st)}</span><span class="p">${priceTxt(k)}</span></div>`);
  });
  list.querySelectorAll(".kit-row").forEach(r => {
    const go = () => { const k = KIT.find(x => x.id === r.dataset.id); kitSel = k.id; if (!sidesOf(k).includes(kitSide)) flipTo(sidesOf(k)[0]); else renderKit(); document.getElementById("kitPanel").scrollIntoView({ block: "nearest", behavior: "smooth" }); };
    r.addEventListener("click", go);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
}
function flipTo(side) {
  if (side === kitSide) return;
  const svg = document.getElementById("kitSvg");
  svg.classList.add("flip");
  setTimeout(() => { kitSide = side; renderKit(); svg.classList.remove("flip"); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250);
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
function setCol(c) {
  kitCol = c; C = { ...KITCOL[c], accent: "#C08A3E" };
  document.getElementById("colWarren").setAttribute("aria-selected", c === "warren");
  document.getElementById("colRijders").setAttribute("aria-selected", c === "rijders");
  renderKit();
}
on("busZij", "click", () => { busSide = "zij"; drawBus(); });
on("busAchter", "click", () => { busSide = "achter"; drawBus(); });
on("colWarren", "click", () => setCol("warren"));
on("colRijders", "click", () => setCol("rijders"));
on("kitVoor", "click", () => flipTo("voor"));
on("kitAchter", "click", () => flipTo("achter"));
if ($("kitSvg")) renderKit();
if ($("calcKm")) renderCalc();
if ($("busSvg")) drawBus();
render();
