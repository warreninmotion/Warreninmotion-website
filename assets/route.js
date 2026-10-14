// Route Lucca → Veenendaal uit de GPX-bestanden (assets/route-data.js, window.WIM_ROUTE): kaartprojectie,
// etappes en landkaart. Gedeeld door Home, De route en Tussenstand. Laden na route-data.js (en voor de
// landkaart na d3, topojson en datamaps).
const R = window.WIM_ROUTE;
const ROUTE_KM = Math.round(R.km), SPRINT = 50;
// Acht etappes, zaterdag 15 t/m zaterdag 22 mei 2027. Afstand en hoogtemeters komen uit de GPX.
const STAGES = [
  { dag: 1, datum: "za 15 mei", van: "Lucca", naar: "Novi Ligure", landen: "Italië", via: "Langs de kust via La Spezia, dan landinwaarts naar Piemonte." },
  { dag: 2, datum: "zo 16 mei", van: "Novi Ligure", naar: "Locarno", landen: "Italië → Zwitserland", via: "Noordwaarts langs het Lago Maggiore." },
  { dag: 3, datum: "ma 17 mei", van: "Locarno", naar: "Sargans", landen: "Zwitserland", via: "Over de Lukmanierpas (1.915 m), het hoogste punt van de tocht, en via Chur." },
  { dag: 4, datum: "di 18 mei", van: "Sargans", naar: "Mulhouse", landen: "Zwitserland → Frankrijk", via: "Via Zürich en Basel." },
  { dag: 5, datum: "wo 19 mei", van: "Mulhouse", naar: "Bad Bergzabern", landen: "Frankrijk → Duitsland", via: "Door de Elzas over de wijnroute, via Straatsburg." },
  { dag: 6, datum: "do 20 mei", van: "Bad Bergzabern", naar: "Arlon", landen: "Duitsland → Luxemburg → België", via: "Via Saarbrücken en Luxemburg-stad." },
  { dag: 7, datum: "vr 21 mei", van: "Arlon", naar: "Lommel", landen: "België", via: "Door de Ardennen via Bastogne en Luik." },
  { dag: 8, datum: "za 22 mei", van: "Lommel", naar: "Veenendaal", landen: "België → Nederland", via: "Vanaf Den Bosch de eindsprint: de laatste kilometers samen met meefietsers naar de finish." },
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

const nl = n => (Math.round(n * 10) / 10).toLocaleString("nl-NL", { maximumFractionDigits: 1 });
const eur = n => "€" + nl(n);
function el(tag, attrs, text) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}
