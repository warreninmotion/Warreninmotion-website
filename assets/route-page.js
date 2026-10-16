// De route (NL en EN): kaart links (zoomt in op een etappe), etappes rechts in een scrollvak met per etappe het
// hoogteprofiel gekleurd naar helling en de beklimmingen. Gegevens uit /assets/route-data.js en route.js.
(function () {
  const $ = id => document.getElementById(id);
  const COUNTRIES = [["ITALIË",44.62,10.0],["ZWITSERLAND",46.22,10.05],["FRANKRIJK",48.2,6.62],["DUITSLAND",49.5,8.95],["LUXEMBURG",49.8,6.95],["BELGIË",50.6,4.75],["NEDERLAND",51.33,4.55]];
  const GRADES = [[3, "<3%"], [6, "3–6%"], [9, "6–9%"], [12, "9–12%"], [Infinity, ">12%"]];
  const GC = g => `var(--s${GRADES.findIndex(([t]) => g < t) + 1})`;
  const legend = `<span style="color:var(--fg);font-weight:600">${t("Helling", "Gradient")}</span>` + GRADES.map(([, t], i) => `<span><i style="background:var(--s${i + 1})"></i>${t.replace("<", "&lt;").replace(">", "&gt;")}</span>`).join("");
  const climbName = (s, c, j) => s.dag === 3 && c.top >= 1900 ? t("Lukmanierpas", "Lukmanier Pass") : t(`Klim ${j + 1}`, `Climb ${j + 1}`);
  const climbTop = (s, c) => s.dag === 3 && c.top >= 1900 ? 1915 : c.top;
  const catTxt = c => c.cat === "HC" ? "HC" : "Cat. " + c.cat;
  const gradeAt = (s, km) => { const i = Math.max(0, Math.min(s.prof.length - 2, Math.floor((km - s.a) / R.profStep))); return (s.prof[i + 1] - s.prof[i]) / (R.profStep * 10); };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = -1, selClimb = null;

  // ── Kaart: lagen ─────────────────────────────────────────────────────────
  const svg = $("rmap"), NS = { "vector-effect": "non-scaling-stroke" };
  const FULL = [0, 0, W, H]; let vb = FULL.slice();
  const setVB = b => { vb = b; svg.setAttribute("viewBox", b.map(v => v.toFixed(1)).join(" ")); };
  setVB(FULL);
  const gLand = el("g", {}), gBase = el("g", {}), gLabels = el("g", {}), gOver = el("g", {});
  svg.append(gLand, gBase, gLabels, gOver);
  if (LAND) gLand.append(el("path", { d: LAND, fill: "var(--land)", "fill-rule": "evenodd", stroke: "none" }));
  if (BORDERS) gLand.append(el("path", { d: BORDERS, fill: "none", stroke: "var(--border)", "stroke-width": 1, "stroke-linejoin": "round", ...NS }));
  STAGES.forEach((s, i) => gBase.append(el("path", { d: path(s.a, s.b), fill: "none", stroke: i % 2 ? "var(--seg2)" : "var(--seg1)", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round", class: "rseg", "data-i": i, style: "cursor:pointer", ...NS })));
  for (const [n, la, lo] of COUNTRIES) { const [x, y] = xy(la, lo); gLabels.append(el("text", { x, y, "text-anchor": "middle", "font-size": 13, "letter-spacing": 3, fill: "var(--muted)", opacity: .7 }, n)); }
  const side = { "Lucca": "r", "Novi Ligure": "l", "Locarno": "l", "Sargans": "r", "Mulhouse": "r", "Bad Bergzabern": "r", "Arlon": "l", "Lommel": "r", "Veenendaal": "r" };
  for (const q of pts) {
    if (!side[q.name]) continue;
    const [x, y] = q.p, r = side[q.name] === "r";
    gLabels.append(el("circle", { cx: x, cy: y, r: 5, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 2 }));
    gLabels.append(el("text", { x: x + (r ? 12 : -12), y: y + 6, "text-anchor": r ? "start" : "end", "font-size": 18, fill: "var(--fg)" }, q.name));
  }
  STAGES.forEach((s, i) => {
    const f = { 3: .78, 8: .22 }[s.dag] || .5, [x, y] = at(s.a + (s.b - s.a) * f);
    const g = el("g", { class: "rnr", "data-i": i, style: "cursor:pointer" });
    g.append(el("circle", { cx: x, cy: y, r: 12, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 1.5 }));
    g.append(el("text", { x, y: y + 5, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: "var(--fg)" }, s.dag));
    gLabels.append(g);
  });

  // Inzoomen: viewBox vloeiend naar de etappe, passend in het kaartvak
  function boxFor(s) {
    const seg = pts.filter(q => q.km >= s.a - .01 && q.km <= s.b + .01), xs = seg.map(q => q.p[0]), ys = seg.map(q => q.p[1]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = Math.max(x1 - x0, y1 - y0) * .18 + 12; x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    const asp = svg.clientWidth / svg.clientHeight || .8; let w = x1 - x0, h = y1 - y0;
    if (w / h < asp) { x0 -= (h * asp - w) / 2; w = h * asp; } else { y0 -= (w / asp - h) / 2; h = w / asp; }
    return [x0, y0, w, h];
  }
  let anim = 0;
  function zoomTo(b, done) {
    cancelAnimationFrame(anim);
    const from = vb.slice(), t0 = performance.now(), dur = reduce ? 0 : 550;
    const step = t => {
      const f = dur ? Math.min(1, (t - t0) / dur) : 1, e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      setVB(from.map((v, i) => v + (b[i] - v) * e));
      if (f < 1) anim = requestAnimationFrame(step); else done && done();
    };
    anim = requestAnimationFrame(step);
  }
  const upp = () => Math.max(vb[2] / svg.clientWidth, vb[3] / svg.clientHeight); // gebruikerseenheden per pixel

  // Overlay voor de gekozen etappe: helling op het spoor, start, finish en beklimmingen
  function drawOverlay() {
    gOver.innerHTML = "";
    if (cur < 0) return;
    const s = STAGES[cur], k = upp(), seg = pts.filter(q => q.km >= s.a - .01 && q.km <= s.b + .01);
    for (const [n, la, lo] of COUNTRIES) { const [x, y] = xy(la, lo); gOver.append(el("text", { x, y, "text-anchor": "middle", "font-size": 12 * k, "letter-spacing": 3 * k, fill: "var(--muted)", opacity: .75 }, n)); }
    gOver.append(el("path", { d: path(s.a, s.b), fill: "none", stroke: "var(--fg)", "stroke-width": 10, "stroke-linejoin": "round", "stroke-linecap": "round", ...NS }));
    for (let i = 0; i < seg.length - 1; i++) {
      const a = seg[i], b = seg[i + 1];
      gOver.append(el("line", { x1: a.p[0], y1: a.p[1], x2: b.p[0], y2: b.p[1], stroke: GC(gradeAt(s, (a.km + b.km) / 2)), "stroke-width": 6, "stroke-linecap": "round", ...NS }));
    }
    const label = (p, txt, big) => {
      const right = p[0] < vb[0] + vb[2] * .55;
      gOver.append(el("circle", { cx: p[0], cy: p[1], r: (big ? 7 : 5) * k, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 2.5 * k }));
      gOver.append(el("text", { x: p[0] + (right ? 12 : -12) * k, y: p[1] + 5 * k, "text-anchor": right ? "start" : "end", "font-size": 15 * k, "font-weight": 700, fill: "var(--fg)", stroke: "var(--land)", "stroke-width": 4 * k, "paint-order": "stroke" }, txt));
    };
    label(at(s.a), s.van, true); label(at(s.b), s.naar, true);
    if (s.dag === 8) label(at(SPRINT_KM), t("Den Bosch · eindsprint", "Den Bosch · final sprint"), false);
    s.climbs.forEach((c, j) => {
      const p = at(c.b), on = selClimb === j;
      if (on) gOver.append(el("path", { d: path(c.a, c.b), fill: "none", stroke: "var(--fg)", "stroke-width": 14, opacity: .25, "stroke-linecap": "round", ...NS }));
      const g = el("g", { class: "mc", "data-j": j, style: "cursor:pointer" });
      g.append(el("circle", { cx: p[0], cy: p[1], r: (on ? 13 : 11) * k, fill: on ? "var(--groen)" : "var(--fg)", stroke: "var(--bg)", "stroke-width": 2 * k }));
      g.append(el("text", { x: p[0], y: p[1] + 4.5 * k, "text-anchor": "middle", "font-size": 12.5 * k, "font-weight": 700, fill: "var(--bg)" }, j + 1));
      gOver.append(g);
    });
    gOver.querySelectorAll(".mc").forEach(g => g.addEventListener("click", () => pickClimb(+g.dataset.j)));
  }

  // ── Hoogteprofiel hele tocht ─────────────────────────────────────────────
  const TOP = 2000, prof = $("prof"), PX = km => 34 + km / R.km * 958, PY = e => 180 - e / TOP * 160;
  for (const e of [0, 500, 1000, 1500, 2000]) {
    prof.append(el("line", { x1: 34, x2: 992, y1: PY(e), y2: PY(e), stroke: "var(--line)", "stroke-width": 1 }));
    prof.append(el("text", { x: 28, y: PY(e) + 4, "text-anchor": "end", "font-size": 11, fill: "var(--muted)" }, e ? nl(e) : "0 m"));
  }
  STAGES.forEach((s, i) => {
    const d = "M" + PX(s.a).toFixed(1) + " " + PY(0) + s.prof.map((e, j) => `L${PX(s.a + j * R.profStep).toFixed(1)} ${PY(e).toFixed(1)}`).join("") + `L${PX(s.b).toFixed(1)} ${PY(0)}Z`;
    prof.append(el("path", { d, fill: i % 2 ? "var(--seg2)" : "var(--seg1)", class: "pa", "data-i": i }));
    prof.append(el("text", { x: PX((s.a + s.b) / 2), y: 200, "text-anchor": "middle", "font-size": 12, "font-weight": 600, fill: "var(--fg)" }, s.dag));
    if (i) prof.append(el("line", { x1: PX(s.a), x2: PX(s.a), y1: 20, y2: 186, stroke: "var(--bg)", "stroke-width": 1.5 }));
  });
  { const top = R.stages[2].top; prof.append(el("text", { x: PX(top[2]) + 8, y: PY(R.stages[2].max) + 4, "font-size": 12, fill: "var(--fg)", "font-style": "italic" }, t("Lukmanierpas 1.915 m", "Lukmanier Pass 1,915 m"))); }
  const upTot = STAGES.reduce((a, s) => a + s.up, 0);
  $("profLegend").innerHTML = t(`<span>Afstand <b>${nl(R.km)} km</b></span><span>Totale stijging <b>${nl(upTot)} m</b></span><span>Hoogste punt <b>1.915 m</b> (Lukmanierpas)</span><span>Klik op een etappe voor de details</span>`, `<span>Distance <b>${nl(R.km)} km</b></span><span>Total climbing <b>${nl(upTot)} m</b></span><span>Highest point <b>1,915 m</b> (Lukmanier Pass)</span><span>Click a stage for the details</span>`);

  // ── Lijst met etappes ────────────────────────────────────────────────────
  const list = $("stages");
  list.innerHTML = STAGES.map((s, i) => `<li class="stage" data-i="${i}" id="dag-${s.dag}">
      <button type="button" class="stage-h" aria-expanded="false" aria-controls="sb-${i}">
        <span class="nr" aria-hidden="true">${s.dag}</span>
        <span class="d">${t("Dag", "Day")} ${s.dag} · ${s.datum}</span>
        <span class="km">${nl(s.km)} km<small>km ${nl(Math.round(s.a))}–${nl(Math.round(s.b))}</small></span>
        <h3>${s.van} → ${s.naar}</h3>
        <span class="ele"><span>${t("Stijging", "Climbing")} <b>${nl(s.up)} m</b></span><span>${t("Daling", "Descent")} <b>${nl(s.down)} m</b></span><span>${t("Hoogste punt", "Highest point")} <b>${nl(s.dag === 3 ? 1915 : s.max)} m</b></span><span>${s.climbs.length ? `<b>${s.climbs.length}</b> ${s.climbs.length === 1 ? t("beklimming", "climb") : t("beklimmingen", "climbs")}` : t("vlak", "flat")}</span></span>
      </button>
      <div class="stage-b" id="sb-${i}" hidden></div>
    </li>`).join("");

  function drawProfile(s, box) {
    const P = box.querySelector("svg"), tip = box.querySelector(".tip"); P.innerHTML = "";
    const L = 46, Rr = 594, T = 58, B = 226, n = s.prof.length - 1;
    const lo0 = Math.min(...s.prof), hi0 = Math.max(...s.prof);
    const st = [50, 100, 200, 250, 500].find(v => Math.max(hi0 - lo0, 150) / v <= 5) || 500, lo = Math.floor(lo0 / st) * st, hi = Math.max(lo + 2 * st, Math.ceil(hi0 / st) * st);
    const X = km => L + km / s.km * (Rr - L), Y = e => B - (e - lo) / (hi - lo) * (B - T);
    for (let e = lo; e <= hi; e += st) {
      P.append(el("line", { x1: L, x2: Rr, y1: Y(e), y2: Y(e), stroke: "var(--line)", "stroke-width": 1 }));
      P.append(el("text", { x: L - 6, y: Y(e) + 4, "text-anchor": "end", "font-size": 11, fill: "var(--muted)" }, nl(e) + (e === lo ? " m" : "")));
    }
    const xs = s.km > 150 ? 50 : 25;
    for (let k = 0; k <= s.km + .01; k += xs) P.append(el("text", { x: X(k), y: B + 18, "text-anchor": "middle", "font-size": 11, fill: "var(--muted)" }, k ? nl(k) : "0 km"));
    for (let i = 0; i < n; i++) {
      const g = (s.prof[i + 1] - s.prof[i]) / (R.profStep * 10), x0 = X(i * R.profStep), x1 = X(Math.min(s.km, (i + 1) * R.profStep));
      P.append(el("path", { d: `M${x0.toFixed(1)} ${B}L${x0.toFixed(1)} ${Y(s.prof[i]).toFixed(1)}L${x1.toFixed(1)} ${Y(s.prof[i + 1]).toFixed(1)}L${x1.toFixed(1)} ${B}Z`, fill: GC(g) }));
    }
    P.append(el("path", { d: "M" + s.prof.map((e, i) => `${X(Math.min(s.km, i * R.profStep)).toFixed(1)} ${Y(e).toFixed(1)}`).join("L"), fill: "none", stroke: "var(--fg)", "stroke-width": 1.2, "stroke-linejoin": "round" }));
    P.append(el("line", { x1: L, x2: Rr, y1: B, y2: B, stroke: "var(--fg)", "stroke-width": 1, opacity: .5 }));
    let lastX = -99, lift = 0;
    s.climbs.forEach((c, j) => {
      const a = X(c.a - s.a), b = X(c.b - s.a), on = selClimb === j, g = el("g", { class: "pc", "data-j": j, style: "cursor:pointer" });
      const cx = (a + b) / 2; lift = cx - lastX < 22 && !lift ? 18 : 0; lastX = cx;
      g.append(el("rect", { x: a, y: T - 4, width: Math.max(2, b - a), height: B - T + 4, fill: "var(--fg)", opacity: on ? .12 : 0 }));
      g.append(el("path", { d: `M${a} ${T - 4}L${a} ${T - 10}L${b} ${T - 10}L${b} ${T - 4}`, fill: "none", stroke: "var(--fg)", "stroke-width": on ? 2.2 : 1.3 }));
      if (lift) g.append(el("line", { x1: cx, x2: cx, y1: T - 10, y2: T - 22 - lift, stroke: "var(--fg)", "stroke-width": 1 }));
      g.append(el("circle", { cx, cy: T - 22 - lift, r: 9.5, fill: on ? "var(--groen)" : "var(--fg)" }));
      g.append(el("text", { x: cx, y: T - 18 - lift, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "var(--bg)" }, j + 1));
      P.append(g);
    });
    P.querySelectorAll(".pc").forEach(g => g.addEventListener("click", () => pickClimb(+g.dataset.j)));
    const hit = el("rect", { x: L, y: T, width: Rr - L, height: B - T, fill: "transparent" });
    const vline = el("line", { y1: T, y2: B, stroke: "var(--fg)", "stroke-width": 1, opacity: 0 }), dot = el("circle", { r: 4, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 2, opacity: 0 });
    P.append(vline, dot, hit);
    const move = ev => {
      const r = P.getBoundingClientRect(), px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left, vx = px / r.width * 600;
      const km = Math.max(0, Math.min(s.km, (vx - L) / (Rr - L) * s.km)), i = Math.min(n, Math.round(km / R.profStep)), e = s.prof[i], g = gradeAt(s, s.a + km);
      vline.setAttribute("x1", X(km)); vline.setAttribute("x2", X(km)); vline.setAttribute("opacity", .6);
      dot.setAttribute("cx", X(km)); dot.setAttribute("cy", Y(e)); dot.setAttribute("opacity", 1);
      tip.hidden = false; tip.textContent = `km ${nl(km)} · ${nl(e)} m · ${g >= 0 ? "+" : ""}${nl(g)}%`;
      tip.style.left = Math.max(70, Math.min(r.width - 70, px)) + "px"; tip.style.top = (Y(e) / 250 * r.height - 10) + "px";
    };
    const out = () => { tip.hidden = true; vline.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); };
    hit.addEventListener("mousemove", move); hit.addEventListener("touchmove", move, { passive: true }); hit.addEventListener("mouseleave", out); hit.addEventListener("touchend", out);
  }

  // Beklimmingen: compacte rijen onder de kaart (op telefoon in de etappe)
  function climbRows(s) {
    if (!s.climbs.length) return `<p class="muted small">${t("Geen noemenswaardige beklimmingen: een vlakke dag om kilometers te maken.", "No notable climbs: a flat day for covering ground.")}</p>`;
    return `<div class="crows">${s.climbs.map((c, j) => `<button type="button" class="crow" data-j="${j}" aria-pressed="false">
        <span class="no">${j + 1}</span><b>${climbName(s, c, j)}${c.cat ? ` <span class="cat">${catTxt(c)}</span>` : ""}</b><span class="go">${t("Profiel", "Profile")}</span>
        <span class="m">${nl(c.len)} km · ${nl(c.grade)}% · +${nl(c.gain)} m · top ${nl(climbTop(s, c))} m · km ${nl(Math.round(c.a - s.a))}</span>
      </button>`).join("")}</div>`;
  }
  const bindRows = root => root.querySelectorAll(".crow").forEach(r => r.addEventListener("click", () => pickClimb(+r.dataset.j)));

  // Profiel van één klim, op de plek van de kaart: per 100 m gekleurd naar helling, met % per kilometer
  function drawClimb(s, c, j) {
    const box = $("cview"), P = $("cprof"), tip = $("cvTip"), cw = box.clientWidth || 500, ch = box.clientHeight || 400, u = 600 / cw;
    const Wv = 600, Hv = Math.round(600 * ch / cw); P.setAttribute("viewBox", `0 0 ${Wv} ${Hv}`); P.innerHTML = "";
    $("cvHead").innerHTML = `<b>${j + 1} · ${climbName(s, c, j)}</b><span>${nl(c.len)} km · ${t("gemiddeld", "average")} ${nl(c.grade)}% · +${nl(c.gain)} m · top ${nl(climbTop(s, c))} m${c.cat ? ` · ${catTxt(c)}` : ""}</span><span>${t(`Dag ${s.dag}, km ${nl(Math.round(c.a - s.a))}–${nl(Math.round(c.b - s.a))} van de etappe`, `Day ${s.dag}, km ${nl(Math.round(c.a - s.a))}–${nl(Math.round(c.b - s.a))} of the stage`)}</span>`;
    const pr = c.prof, n = pr.length - 1, lo0 = Math.min(...pr), hi0 = Math.max(...pr);
    const st = [25, 50, 100, 200].find(v => Math.max(hi0 - lo0, 80) / v <= 5) || 200, lo = Math.floor(lo0 / st) * st, hi = Math.ceil(hi0 / st) * st + st * .3;
    const L = 44 * u, Rr = Wv - 14 * u, T = ($("cvHead").offsetHeight + 34) * u, B = Hv - 30 * u;
    const X = i => L + i / n * (Rr - L), Y = e => B - (e - lo) / (hi - lo) * (B - T), fs = 11 * u;
    for (let e = lo; e <= hi; e += st) {
      P.append(el("line", { x1: L, x2: Rr, y1: Y(e), y2: Y(e), stroke: "var(--line)", "stroke-width": u }));
      P.append(el("text", { x: L - 6 * u, y: Y(e) + 4 * u, "text-anchor": "end", "font-size": fs, fill: "var(--muted)" }, nl(e) + (e === lo ? " m" : "")));
    }
    const g = i => { const a = Math.max(0, i - 1), b = Math.min(n, i + 2); return (pr[b] - pr[a]) / ((b - a) * 100) * 100; };
    for (let i = 0; i < n; i++) P.append(el("path", { d: `M${X(i).toFixed(1)} ${B}L${X(i).toFixed(1)} ${Y(pr[i]).toFixed(1)}L${X(i + 1).toFixed(1)} ${Y(pr[i + 1]).toFixed(1)}L${X(i + 1).toFixed(1)} ${B}Z`, fill: GC(g(i)) }));
    P.append(el("path", { d: "M" + pr.map((e, i) => `${X(i).toFixed(1)} ${Y(e).toFixed(1)}`).join("L"), fill: "none", stroke: "var(--fg)", "stroke-width": 1.4 * u, "stroke-linejoin": "round" }));
    P.append(el("line", { x1: L, x2: Rr, y1: B, y2: B, stroke: "var(--fg)", "stroke-width": u, opacity: .5 }));
    // per kilometer: scheidingslijn en gemiddeld %
    const kmW = (Rr - L) / (n / 10), every = kmW < 26 * u ? Math.ceil(26 * u / kmW) : 1;
    for (let k = 0; k * 10 < n; k++) {
      const a = k * 10, b = Math.min(n, a + 10), avg = (pr[b] - pr[a]) / ((b - a) / 10) / 10;
      if (k) P.append(el("line", { x1: X(a), x2: X(a), y1: Y(pr[a]), y2: B, stroke: "var(--card)", "stroke-width": 1.2 * u }));
      if (k % every === 0) P.append(el("text", { x: X(a) + (X(b) - X(a)) / 2, y: Math.min(Y(pr[a]), Y(pr[b])) - 7 * u, "text-anchor": "middle", "font-size": fs, "font-weight": 700, fill: "var(--fg)" }, `${nl(Math.round(avg * 10) / 10)}%`));
      if (k % every === 0 && X(n) - X(a) > 34 * u) P.append(el("text", { x: X(a), y: B + 17 * u, "text-anchor": "middle", "font-size": fs, fill: "var(--muted)" }, k ? nl(k) : "0 km"));
    }
    P.append(el("text", { x: X(n), y: B + 17 * u, "text-anchor": "end", "font-size": fs, fill: "var(--muted)" }, `${nl(c.len)} km`));
    // hover
    const hit = el("rect", { x: L, y: T, width: Rr - L, height: B - T, fill: "transparent" });
    const vline = el("line", { y1: T, y2: B, stroke: "var(--fg)", "stroke-width": u, opacity: 0 }), dot = el("circle", { r: 4 * u, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 2 * u, opacity: 0 });
    P.append(vline, dot, hit);
    const move = ev => {
      const r = P.getBoundingClientRect(), px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left, vx = px * u;
      const i = Math.max(0, Math.min(n, Math.round((vx - L) / (Rr - L) * n))), e = pr[i];
      vline.setAttribute("x1", X(i)); vline.setAttribute("x2", X(i)); vline.setAttribute("opacity", .6); dot.setAttribute("cx", X(i)); dot.setAttribute("cy", Y(e)); dot.setAttribute("opacity", 1);
      tip.hidden = false; tip.textContent = `km ${nl(i / 10)} · ${nl(e)} m · ${nl(Math.round(g(Math.min(i, n - 1)) * 10) / 10)}%`;
      tip.style.left = Math.max(70, Math.min(r.width - 70, px)) + "px"; tip.style.top = (Y(e) / u - 10) + "px";
    };
    const out = () => { tip.hidden = true; vline.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); };
    hit.addEventListener("mousemove", move); hit.addEventListener("touchmove", move, { passive: true }); hit.addEventListener("mouseleave", out); hit.addEventListener("touchend", out);
  }
  function showViewer() {
    const on = cur >= 0 && selClimb != null;
    $("cview").hidden = !on; $("toMap").hidden = !on; $("reset").hidden = on || cur < 0;
    if (on) drawClimb(STAGES[cur], STAGES[cur].climbs[selClimb], selClimb);
  }

  function fillBody(i) {
    const s = STAGES[i], b = $(`sb-${i}`);
    b.innerHTML = `<p class="via"><b>${s.landen}.</b> ${s.via}</p>
      <div class="sprof"><svg viewBox="0 0 600 250" role="img" aria-label="${t(`Hoogteprofiel van dag ${s.dag}, gekleurd naar hellingspercentage`, `Elevation profile of day ${s.dag}, coloured by gradient`)}"></svg><div class="tip" hidden></div></div>
      <div class="gl">${legend}</div>
      <div class="cpanel-m"><div class="cp-t" style="margin-bottom:6px">Beklimmingen</div>${climbRows(s)}</div>`;
    drawProfile(s, b.querySelector(".sprof"));
    $("cpanel").innerHTML = `<div class="cp-t">${t(`Beklimmingen dag ${s.dag}`, `Climbs on day ${s.dag}`)}</div>${climbRows(s)}`;
    bindRows(b); bindRows($("cpanel"));
  }
  function pickClimb(j) {
    selClimb = j == null || selClimb === j ? null : j;
    drawProfile(STAGES[cur], $(`sb-${cur}`).querySelector(".sprof")); drawOverlay(); showViewer();
    document.querySelectorAll(".crow").forEach(r => { const on = +r.dataset.j === selClimb; r.classList.toggle("on", on); r.setAttribute("aria-pressed", String(on)); });
  }

  function select(i) {
    if (i === cur) i = -1;
    if (cur >= 0) { const o = list.children[cur]; o.classList.remove("on"); o.querySelector(".stage-h").setAttribute("aria-expanded", "false"); $(`sb-${cur}`).hidden = true; $(`sb-${cur}`).innerHTML = ""; }
    cur = i; selClimb = null; gOver.innerHTML = ""; showViewer();
    document.querySelector(".rgrid").classList.toggle("sel", i >= 0); // kaart groot of klein (beklimmingen eronder)
    gBase.querySelectorAll(".rseg").forEach(p => p.setAttribute("opacity", i < 0 || +p.dataset.i === i ? 1 : .35));
    prof.querySelectorAll(".pa").forEach(p => p.setAttribute("opacity", i < 0 || +p.dataset.i === i ? 1 : .35));
    history.replaceState(null, "", i >= 0 ? `#dag-${i + 1}` : location.pathname);
    if (i < 0) { $("cpanel").innerHTML = `<p class="muted small">${t("Kies een etappe en zie hier alle beklimmingen.", "Pick a stage to see all its climbs here.")}</p>`; gLabels.style.display = ""; zoomTo(FULL); return; }
    const li = list.children[i]; li.classList.add("on"); li.querySelector(".stage-h").setAttribute("aria-expanded", "true");
    $(`sb-${i}`).hidden = false; fillBody(i);
    gLabels.style.display = "none";
    zoomTo(boxFor(STAGES[i]), drawOverlay);
    requestAnimationFrame(() => {
      const sl = $("slist"), bh = reduce ? "auto" : "smooth";
      if (getComputedStyle(sl).overflowY !== "auto") return li.scrollIntoView({ block: "start", behavior: bh });
      // naast elkaar: alleen het etappevak scrollt, de pagina zet de kaart netjes in beeld
      const g = document.querySelector(".rgrid").getBoundingClientRect();
      if (g.top < 60 || g.top > innerHeight * .35) scrollTo({ top: scrollY + g.top - 84, behavior: bh });
      sl.scrollTo({ top: li.offsetTop, behavior: bh });
    });
  }
  const hl = i => {
    if (cur >= 0) return;
    gBase.querySelectorAll(".rseg").forEach(p => p.classList.toggle("on", i != null && +p.dataset.i === i));
    prof.querySelectorAll(".pa").forEach(p => p.setAttribute("opacity", i == null || +p.dataset.i === i ? 1 : .35));
  };
  list.querySelectorAll(".stage").forEach(li => {
    const i = +li.dataset.i, h = li.querySelector(".stage-h");
    h.addEventListener("click", () => select(i));
    h.addEventListener("mouseenter", () => hl(i)); h.addEventListener("mouseleave", () => hl(null));
  });
  [...gBase.querySelectorAll(".rseg"), ...gLabels.querySelectorAll(".rnr"), ...prof.querySelectorAll(".pa")].forEach(p => {
    const i = +p.dataset.i;
    p.addEventListener("click", () => select(i === cur ? cur : i));
    p.addEventListener("mouseenter", () => hl(i)); p.addEventListener("mouseleave", () => hl(null));
  });
  $("reset").addEventListener("click", () => select(-1));
  $("toMap").addEventListener("click", () => pickClimb(null));
  addEventListener("resize", () => { if (cur >= 0) { setVB(boxFor(STAGES[cur])); drawOverlay(); showViewer(); } });
  const m = location.hash.match(/^#dag-([1-8])$/);
  if (m) select(+m[1] - 1);
})();
