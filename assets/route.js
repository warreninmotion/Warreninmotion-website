// Route Lucca → Veenendaal uit de GPX-bestanden (assets/route-data.js, window.WIM_ROUTE): kaartprojectie,
// etappes en landkaart. Gedeeld door Home, De route en Tussenstand. Laden na route-data.js (en voor de
// landkaart na d3, topojson en datamaps).
const R = window.WIM_ROUTE;
const ROUTE_KM = Math.round(R.km), SPRINT = 50;
// Acht etappes, zaterdag 15 t/m zaterdag 22 mei 2027. Afstand en hoogtemeters komen uit de GPX.
const STAGES = [
  { dag: 1, datum: t("za 15 mei", "Sat 15 May"), van: "Lucca", naar: "Novi Ligure", landen: t("Italië", "Italy"),
    via: t("Vertrek op de Piazza dell'Anfiteatro, langs de kust via La Spezia en dan landinwaarts naar Piemonte.", "Rolling out from the Piazza dell'Anfiteatro, along the coast via La Spezia and inland to Piedmont.") },
  { dag: 2, datum: t("zo 16 mei", "Sun 16 May"), van: "Novi Ligure", naar: "Locarno", landen: t("Italië → Zwitserland", "Italy → Switzerland"),
    via: t("Noordwaarts door de Povlakte en langs het Lago Maggiore Zwitserland in.", "North across the Po plain and along Lake Maggiore into Switzerland.") },
  { dag: 3, datum: t("ma 17 mei", "Mon 17 May"), van: "Locarno", naar: "Sargans", landen: t("Zwitserland", "Switzerland"),
    via: t("De koninginnenrit: over de Lukmanierpas (1.915 m), het dak van de tocht, en via Chur naar Sargans.", "The queen stage: over the Lukmanier Pass (1,915 m), the roof of the ride, and via Chur to Sargans.") },
  { dag: 4, datum: t("di 18 mei", "Tue 18 May"), van: "Sargans", naar: "Mulhouse", landen: t("Zwitserland → Frankrijk", "Switzerland → France"),
    via: t("Langs het Walensee, via Zürich en Basel de grens over naar Frankrijk.", "Past the Walensee, via Zurich and Basel across the border into France.") },
  { dag: 5, datum: t("wo 19 mei", "Wed 19 May"), van: "Mulhouse", naar: "Bad Bergzabern", landen: t("Frankrijk → Duitsland", "France → Germany"),
    via: t("Door de Elzas over de wijnroute, via Straatsburg naar de Duitse Pfalz.", "Through Alsace on the wine route, via Strasbourg to the German Palatinate.") },
  { dag: 6, datum: t("do 20 mei", "Thu 20 May"), van: "Bad Bergzabern", naar: "Arlon", landen: t("Duitsland → Luxemburg → België", "Germany → Luxembourg → Belgium"),
    via: t("Drie landen op één dag: via Saarbrücken en Luxemburg-stad naar België.", "Three countries in one day: via Saarbrücken and Luxembourg City into Belgium.") },
  { dag: 7, datum: t("vr 21 mei", "Fri 21 May"), van: "Arlon", naar: "Lommel", landen: t("België", "Belgium"),
    via: t("Op en neer door de Ardennen via Bastogne en Luik, en dan de Kempen in.", "Up and down through the Ardennes via Bastogne and Liège, then into the Campine.") },
  { dag: 8, datum: t("za 22 mei", "Sat 22 May"), van: "Lommel", naar: "Veenendaal", landen: t("België → Nederland", "Belgium → Netherlands"),
    via: t("De laatste dag. Vanaf Den Bosch fietsen tot 50 meefietsers mee in de eindsprint naar de finish in Veenendaal.", "The final day. From Den Bosch, up to 50 riders join the final sprint to the finish in Veenendaal.") },
];
const K = 120, PADL = 120, PADR = 100, PADT = 34, PADB = 34;
const LON0 = 5.3, LON1 = 10.5, LAT1 = 52.05, LAT0 = 43.8, CX = 0.669;
const W = PADL + (LON1 - LON0) * CX * K + PADR, H = PADT + (LAT1 - LAT0) * K + PADB;
const xy = (lat, lon) => [PADL + (lon - LON0) * CX * K, PADT + (LAT1 - lat) * K];
// Alle punten van het spoor op volgorde, met km vanaf Lucca; plaatsnamen op de etappegrenzen
const pts = [];
R.stages.forEach((s, i) => {
  Object.assign(STAGES[i], { a: s.track[0][2], b: s.track[s.track.length - 1][2], km: s.km, up: s.up, down: s.down, max: s.max, min: s.min, prof: s.prof, climbs: s.climbs || [] });
  s.track.forEach(([la, lo, km], j) => pts.push({ name: j === 0 ? STAGES[i].van : "", p: xy(la, lo), km }));
});
pts[pts.length - 1].name = "Veenendaal";
// Lukmanier: hoogste punt van etappe 3; Den Bosch: dichtstbijzijnde punt van etappe 8
(function () {
  const t = R.stages[2].top, at3 = pts.findIndex(q => q.km >= t[2]);
  pts.splice(at3, 0, { name: "Lukmanier", p: xy(t[0], t[1]), km: t[2] });
  const db = xy(51.6978, 5.3037); let bi = 0, bd = Infinity;
  pts.forEach((q, i) => { if (q.km > STAGES[7].a && !q.name) { const d = Math.hypot(q.p[0] - db[0], q.p[1] - db[1]); if (d < bd) { bd = d; bi = i; } } });
  pts[bi].name = "Den Bosch";
})();
const kmOf = name => pts.find(q => q.name === name).km;
const SPRINT_KM = kmOf("Den Bosch");
function at(km) {
  km = Math.max(0, Math.min(pts[pts.length - 1].km, km));
  for (let i = 1; i < pts.length; i++) if (km <= pts[i].km) {
    const a = pts[i - 1], b = pts[i], t = (km - a.km) / (b.km - a.km || 1);
    return [a.p[0] + (b.p[0] - a.p[0]) * t, a.p[1] + (b.p[1] - a.p[1]) * t];
  }
  return pts[pts.length - 1].p;
}
function path(a, b) {
  const out = [at(a)];
  for (const q of pts) if (q.km > a && q.km < b) out.push(q.p);
  out.push(at(b));
  return "M" + out.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");
}

// ── Landen en grenzen (Natural Earth via Datamaps), één keer omgerekend ─────
let LAND = "", BORDERS = "";
try {
  if (window.Datamap && window.topojson) {
    const topo = Datamap.prototype.worldTopo, obj = topo.objects.world;
    const inBox = ([lo, la]) => lo > 1 && lo < 14 && la > 41 && la < 55;
    const ring = r => r.some(inBox) ? "M" + r.map(([lo, la]) => xy(la, lo).map(v => v.toFixed(1)).join(" ")).join("L") + "Z" : "";
    for (const f of topojson.feature(topo, obj).features) {
      const g = f.geometry; if (!g) continue;
      const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
      for (const p of polys) LAND += p.map(ring).join("");
    }
    const mesh = topojson.mesh(topo, obj, (a, b) => a !== b);
    for (const l of mesh.coordinates) if (l.some(inBox)) BORDERS += "M" + l.map(([lo, la]) => xy(la, lo).map(v => v.toFixed(1)).join(" ")).join("L");
  }
} catch (e) { LAND = ""; BORDERS = ""; }

const nl = n => (Math.round(n * 10) / 10).toLocaleString(window.WIM_LOC || "nl-NL", { maximumFractionDigits: 1 });
const eur = n => "€" + nl(n);
function el(tag, attrs, text) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}
