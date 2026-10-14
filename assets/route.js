// Route Lucca → Veenendaal: dag-eindpunten met echte GPX-km (1.576 km), kaartprojectie en landkaart.
// Gedeeld door De route en Elke kilometer telt. Laden na d3, topojson en datamaps.
const ROUTE_KM = 1576, SPRINT = 50;
const WP = [
  ["Lucca",43.843,10.503,0],["",43.87,10.25],["",44.10,9.83],["",44.25,9.58],["",44.27,9.40],["",44.48,9.10],
  ["Novi Ligure",44.762,8.787,238],["",45.25,8.73],["",45.45,8.62],["",45.76,8.56],["",45.88,8.53],["",46.06,8.69],
  ["Locarno",46.17,8.80,433],["",46.19,9.02],["",46.36,8.97],["Lukmanier",46.56,8.80],["",46.70,8.85],["",46.77,9.20],["",46.85,9.53],
  ["Sargans",47.05,9.44,630],["",47.12,9.31],["",47.23,8.82],["",47.37,8.54],["",47.55,7.79],["",47.56,7.59],
  ["Mulhouse",47.75,7.34,838],["",48.08,7.36],["",48.46,7.48],["",48.58,7.75],["",49.04,7.94],
  ["Bad Bergzabern",49.10,8.00,1037],["",49.20,7.60],["",49.24,6.99],["",49.47,6.36],["",49.61,6.13],
  ["Arlon",49.68,5.81,1262],["",50.00,5.72],["",50.27,5.45],["",50.53,5.57],["",50.63,5.57],["",50.93,5.34],
  ["Lommel",51.23,5.31,1461],["",51.59,5.33],["Den Bosch",51.69,5.30],["",51.89,5.43],["",51.96,5.57],
  ["Veenendaal",52.03,5.56,1576],
];
// Acht etappes, zaterdag 15 t/m zaterdag 22 mei 2027. km volgt uit de GPX-km hierboven.
const STAGES = [
  { dag: 1, datum: "za 15 mei", van: "Lucca", naar: "Novi Ligure", landen: "Italië", via: "Langs de kust via La Spezia, dan landinwaarts naar Piemonte." },
  { dag: 2, datum: "zo 16 mei", van: "Novi Ligure", naar: "Locarno", landen: "Italië → Zwitserland", via: "Noordwaarts langs het Lago Maggiore." },
  { dag: 3, datum: "ma 17 mei", van: "Locarno", naar: "Sargans", landen: "Zwitserland", via: "Over de Lukmanierpas (1.915 m), het hoogste punt van de tocht, en via Chur." },
  { dag: 4, datum: "di 18 mei", van: "Sargans", naar: "Mulhouse", landen: "Zwitserland → Frankrijk", via: "Via Zürich en Basel." },
  { dag: 5, datum: "wo 19 mei", van: "Mulhouse", naar: "Bad Bergzabern", landen: "Frankrijk → Duitsland", via: "Door de Elzas via Straatsburg." },
  { dag: 6, datum: "do 20 mei", van: "Bad Bergzabern", naar: "Arlon", landen: "Duitsland → Luxemburg → België", via: "Via Saarbrücken en Luxemburg-stad." },
  { dag: 7, datum: "vr 21 mei", van: "Arlon", naar: "Lommel", landen: "België", via: "Door de Ardennen via Bastogne en Luik." },
  { dag: 8, datum: "za 22 mei", van: "Lommel", naar: "Veenendaal", landen: "België → Nederland", via: "Vanaf Den Bosch de eindsprint: de laatste 50 km samen met meefietsers naar de finish." },
];
const K = 120, PADL = 120, PADR = 100, PADT = 34, PADB = 34;
const LON0 = 5.3, LON1 = 10.5, LAT1 = 52.05, LAT0 = 43.8, CX = 0.669;
const W = PADL + (LON1 - LON0) * CX * K + PADR, H = PADT + (LAT1 - LAT0) * K + PADB;
const xy = (lat, lon) => [PADL + (lon - LON0) * CX * K, PADT + (LAT1 - lat) * K];
const pts = WP.map(w => ({ name: w[0], p: xy(w[1], w[2]), real: w[3] }));
// km per waypoint: binnen een dag verdeeld naar afstand op de kaart
(function () {
  let s = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].real !== undefined) {
    const d = [0]; for (let j = s + 1; j <= i; j++) d.push(d[d.length - 1] + Math.hypot(pts[j].p[0] - pts[j - 1].p[0], pts[j].p[1] - pts[j - 1].p[1]));
    const a = pts[s].real, b = pts[i].real, L = d[d.length - 1];
    for (let j = s; j <= i; j++) pts[j].km = a + (b - a) * d[j - s] / L;
    s = i;
  }
})();
const kmOf = name => pts.find(q => q.name === name).km;
const SPRINT_KM = kmOf("Den Bosch");
STAGES.forEach(s => { s.a = kmOf(s.van); s.b = kmOf(s.naar); s.km = s.b - s.a; });
function at(km) {
  km = Math.max(0, Math.min(ROUTE_KM, km));
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
